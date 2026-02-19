import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

interface Job {
    job_id: string;
    molecule: string;
    status: string;
    created_at: string;
}

interface HistoryViewProps {
    onSelectJob: (jobId: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ onSelectJob }) => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch history
        // Uses the new endpoint we just added
        axios.get('/api/jobs', {
            headers: { 'X-API-KEY': 'supersecret' }
        })
            .then(res => {
                setJobs(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load history", err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="text-white p-8">Loading history...</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Research History</h2>
            <div className="bg-pharma-card rounded-xl border border-slate-700 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-800 text-slate-400">
                        <tr>
                            <th className="p-4">Molecule</th>
                            <th className="p-4">Date</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {jobs.map(job => (
                            <tr key={job.job_id} className="hover:bg-white/5 transition-colors">
                                <td className="p-4 font-medium text-white">{job.molecule}</td>
                                <td className="p-4 text-slate-400">
                                    {new Date(job.created_at).toLocaleDateString()}
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${job.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                            job.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                                                'bg-blue-500/20 text-blue-400'
                                        }`}>
                                        {job.status.toUpperCase()}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <button
                                        onClick={() => onSelectJob(job.job_id)}
                                        className="text-pharma-accent hover:text-white flex items-center space-x-1"
                                    >
                                        <span>View Report</span>
                                        <ArrowRightIcon className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {jobs.length === 0 && (
                    <div className="p-8 text-center text-slate-500">No research jobs found.</div>
                )}
            </div>
        </div>
    );
};
