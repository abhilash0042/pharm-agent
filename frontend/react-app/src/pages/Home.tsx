import React, { useState } from 'react';
import { apiClient } from '../api/client';
import { NewResearch } from '../components/NewResearch';
import { ResearchStatus } from '../components/ResearchStatus';
import { ReportView } from '../components/ReportView';
import { HistoryView } from '../components/HistoryView';

export const Home: React.FC = () => {
    const [currentView, setCurrentView] = useState<'new' | 'status' | 'report' | 'history'>('new');
    const [jobId, setJobId] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Called when NewResearch form is submitted
    const handleResearchSubmit = async (molecule: string, prompt: string) => {
        setIsSubmitting(true);
        try {
            const res = await apiClient.post('/api/research',
                { molecule, prompt }
            );
            setJobId(res.data.job_id);
            setCurrentView('status');
        } catch (err: any) {
            console.error(err);
            const msg = err.response?.data?.detail || err.message || "Failed to start research";
            alert(`Error: ${JSON.stringify(msg)}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNav = (view: 'new' | 'history') => {
        setCurrentView(view);
    };

    return (
        <div className="flex h-screen bg-pharma-dark text-slate-200 font-sans">
            <div className="w-64 bg-pharma-card border-r border-slate-700 flex flex-col h-screen">
                <div className="p-6 border-b border-slate-700">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-pharma-accent to-blue-500 bg-clip-text text-transparent">
                        Pharm-Agent
                    </h1>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <button
                        onClick={() => handleNav('new')}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${currentView === 'new' || currentView === 'status' || currentView === 'report' ? 'bg-pharma-accent/10 text-pharma-accent' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                        </svg>
                        <span className="font-medium">Research Console</span>
                    </button>
                    <button
                        onClick={() => handleNav('history')}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${currentView === 'history' ? 'bg-pharma-accent/10 text-pharma-accent' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium">History</span>
                    </button>
                </nav>
                <div className="p-4 border-t border-slate-700">
                    <div className="flex items-center space-x-3 px-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pharma-accent to-purple-500"></div>
                        <div>
                            <p className="text-sm font-medium text-white">Dr. Shiva</p>
                            <p className="text-xs text-slate-500">Lead Researcher</p>
                        </div>
                    </div>
                </div>
            </div>

            <main className="flex-1 overflow-auto">
                <div className="max-w-7xl mx-auto p-8">
                    {currentView === 'new' && (
                        <div className="max-w-2xl mx-auto pt-10">
                            <div className="mb-8">
                                <h2 className="text-3xl font-bold text-white mb-2">New Research Job</h2>
                                <p className="text-slate-400">
                                    Initialize autonomous agents for clinical trial synthesis.
                                </p>
                            </div>
                            <NewResearch
                                onSubmit={handleResearchSubmit}
                                isLoading={isSubmitting}
                            />
                        </div>
                    )}

                    {currentView === 'status' && (
                        <div className="max-w-2xl mx-auto pt-20">
                            <ResearchStatus
                                jobId={jobId}
                                onComplete={() => setCurrentView('report')}
                            />
                        </div>
                    )}

                    {currentView === 'report' && (
                        <ReportView jobId={jobId} />
                    )}

                    {currentView === 'history' && (
                        <HistoryView onSelectJob={(id) => { setJobId(id); setCurrentView('report'); }} />
                    )}
                </div>
            </main>
        </div>
    );
};
