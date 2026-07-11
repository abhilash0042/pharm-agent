import json
import os
import re
import time
import uuid
import uuid6
from typing import Any, Dict, Type, TypeVar

from openai import OpenAI
from pydantic import BaseModel, ValidationError

from backend.database import SessionLocal
from backend.master_agent.models.llm_call import LLMCall

class LLMResponseFormatError(Exception): pass
class LLMServiceError(Exception): pass

ollama_base = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434/v1")

# Use local Ollama — free, no rate limits, no credits
client = OpenAI(
    base_url=ollama_base,
    api_key="ollama",
)
MODEL_NAME = os.getenv("LLM_MODEL", "llama3.2")

# generic type for schema
T = TypeVar("T", bound=BaseModel)


def _build_example_from_schema(schema_cls: Type[BaseModel]) -> Dict[str, Any]:
    """
    Dynamically build a concrete example dict from a Pydantic model's schema.
    This is critical for small local models that can't follow abstract $ref schemas.
    """
    schema = schema_cls.model_json_schema()
    defs = schema.get("$defs", {})

    def _example_for_type(prop: dict, depth: int = 0) -> Any:
        if depth > 5:
            return None
        # Resolve $ref
        if "$ref" in prop:
            ref_name = prop["$ref"].split("/")[-1]
            return _example_for_type(defs.get(ref_name, {}), depth + 1)
        # anyOf / oneOf
        for key in ("anyOf", "oneOf"):
            if key in prop:
                non_null = [p for p in prop[key] if p.get("type") != "null"]
                if non_null:
                    return _example_for_type(non_null[0], depth + 1)
                return None
        typ = prop.get("type")
        if typ == "string":
            return prop.get("description", prop.get("title", "example string"))
        if typ == "number" or typ == "integer":
            return 0.85 if "confidence" in prop.get("title", "").lower() else 1
        if typ == "boolean":
            return True
        if typ == "array":
            items = prop.get("items", {})
            return [_example_for_type(items, depth + 1)]
        if typ == "object":
            obj = {}
            for k, v in prop.get("properties", {}).items():
                obj[k] = _example_for_type(v, depth + 1)
            return obj
        return "value"

    result = {}
    for field_name, field_schema in schema.get("properties", {}).items():
        result[field_name] = _example_for_type(field_schema)
    return result


def _extract_json(text: str) -> str:
    """Extract JSON from LLM response, handling markdown blocks and extra text."""
    text = text.strip()
    # Strip markdown code blocks
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    text = text.strip()

    # Try direct parse first
    try:
        json.loads(text)
        return text
    except json.JSONDecodeError:
        pass

    # Try to extract first JSON object
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        candidate = match.group(0)
        try:
            json.loads(candidate)
            return candidate
        except json.JSONDecodeError:
            pass

    raise LLMResponseFormatError(f"Could not extract valid JSON. Response was: {text[:300]}")


def _log_llm_call(db, *, job_id, stage, model, prompt, response, prompt_tokens, completion_tokens):
    call = LLMCall(
        id=uuid6.uuid7(),
        job_id=job_id,
        stage=stage,
        model=model,
        prompt=prompt,
        response=response,
        prompt_tokens=prompt_tokens,
        response_tokens=completion_tokens
    )
    db.add(call)
    db.commit()


def llm_structured(
        *,
        prompt: str,
        schema: Type[T],
        job_id: uuid.UUID,
        stage: str,
        max_retries: int = 3,
) -> T:
    """
    Call LLM and return a validated Pydantic model instance.
    Uses example-based prompting so small local models (llama3.2) can follow the format.
    """
    db = SessionLocal()

    # Build a concrete example — small models can't follow abstract $ref schemas
    example = _build_example_from_schema(schema)
    example_json = json.dumps(example, indent=2)

    instructions = (
        "You are a pharmaceutical research AI. Your job is to return valid JSON only.\n"
        "Return ONLY a JSON object — no explanation, no markdown, no extra text.\n\n"
        "The JSON must have exactly this structure (replace example values with real data):\n"
        f"{example_json}\n\n"
        "IMPORTANT: Only output the JSON object. Nothing before it. Nothing after it."
    )
    input_text = f"{prompt}\n\nRespond with ONLY the JSON object."

    try:
        for attempt in range(max_retries):
            try:
                resp = client.chat.completions.create(
                    model=MODEL_NAME,
                    messages=[
                        {"role": "system", "content": instructions},
                        {"role": "user", "content": input_text}
                    ],
                    temperature=0.1,
                    max_tokens=4096,
                )

                raw_text = resp.choices[0].message.content
                print(f"[LLM] Raw response (attempt {attempt+1}): {raw_text[:300]}")

                json_text = _extract_json(raw_text)
                parsed = json.loads(json_text)
                validated = schema.model_validate(parsed)

                usage = resp.usage
                prompt_tokens = usage.prompt_tokens if usage else 0
                completion_tokens = usage.completion_tokens if usage else 0

                _log_llm_call(
                    db,
                    job_id=job_id,
                    stage=stage,
                    model=MODEL_NAME,
                    prompt=input_text,
                    response=json_text,
                    prompt_tokens=prompt_tokens,
                    completion_tokens=completion_tokens
                )
                return validated

            except (ValidationError, json.JSONDecodeError, LLMResponseFormatError) as e:
                print(f"[LLM] Parse/validation failed (attempt {attempt+1}/{max_retries}): {e}")
                if attempt == max_retries - 1:
                    raise LLMResponseFormatError(f"Failed to get valid JSON after {max_retries} attempts: {e}")
                time.sleep(2)

            except Exception as e:
                print(f"[LLM] API Error (attempt {attempt+1}/{max_retries}): {e}")
                if attempt == max_retries - 1:
                    raise LLMServiceError(f"LLM API failed: {e}")
                time.sleep(5)

    finally:
        db.close()