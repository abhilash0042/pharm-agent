import axios from 'axios';

// In production, this would be an env var.
// For now, assuming standard localhost:8000
// const API_BASE_URL = 'http://127.0.0.1:8000';

export const apiClient = axios.create({
    // baseURL: API_BASE_URL, 
    // We use RELATIVE paths so Vite Proxy handles the forwarding to 127.0.0.1:8000.
    // This avoids CORS and Network Errors.
    headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': 'supersecret' // Hardcoded for prototype
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
