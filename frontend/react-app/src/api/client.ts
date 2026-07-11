import axios from 'axios';

// In production, this would be an env var.
// For now, assuming standard localhost:8000
// const API_BASE_URL = 'http://127.0.0.1:8000';

// Uses VITE_API_URL from environment variables for production (e.g. Render/Vercel)
// Falls back to empty string for local dev relying on Vite Proxy
export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '',
    headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': import.meta.env.VITE_API_KEY || ''
    }
});

export const researchApi = {
    createJob: async (molecule: string, prompt: string) => {
        const response = await apiClient.post('/api/research', { molecule, prompt });
        return response.data; // { job_id: string }
    },
    getStatus: async (jobId: string) => {
        const response = await apiClient.get(`/api/research/${jobId}/status`);
        return response.data;
    }
};
