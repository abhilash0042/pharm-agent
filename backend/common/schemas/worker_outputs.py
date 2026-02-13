from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from .canonical_result import TrialRecord


class ClinicalTrialsOutputs(BaseModel):
    trials: List[TrialRecord]
    summary_text: str
    research_confidence: float
    key_findings: List[str]
    suggested_follow_up: List[str]

class ReportWorkerOutputs(BaseModel):
    pdf_uri: str
    ppt_uri: str

class CompetitorRecord(BaseModel):
    name: str
    market_share: Optional[str] = None
    strengths: List[str] = []
    weaknesses: List[str] = []
    product_comparison: Optional[str] = None
    confidence_score: float = Field(0.0, ge=0.0, le=1.0)

class MarketIntelligenceOutputs(BaseModel):
    market_size_global: Optional[str] = None
    tam: Optional[str] = Field(None, description="Total Addressable Market")
    sam: Optional[str] = Field(None, description="Serviceable Addressable Market")
    som: Optional[str] = Field(None, description="Serviceable Obtainable Market")
    competitors: List[CompetitorRecord] = []
    patent_status: Optional[str] = None
    pricing_insights: Optional[str] = None
    key_findings: List[str] = []
    trend_analysis: Optional[str] = None