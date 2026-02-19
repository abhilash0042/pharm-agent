import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ArrowDownTrayIcon, BeakerIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ReportViewProps {
    jobId: string;
}

export const ReportView: React.FC<ReportViewProps> = ({ jobId }) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const poll = setInterval(() => {
            axios.get(`/api/research/${jobId}/status`, {
                headers: { 'X-API-KEY': 'supersecret' }
            })
                .then(res => {
                    if (res.data.status === 'completed') {
                        setData(res.data.canonical_result);
                        setLoading(false);
                        clearInterval(poll);
                    } else if (res.data.status === 'failed') {
                        setLoading(false);
                        clearInterval(poll);
                    }
                });
        }, 2000);

        return () => clearInterval(poll);
    }, [jobId]);

    const handleDownload = (type: 'pdf' | 'ppt') => {
        window.open(`/api/research/${jobId}/download/${type}`, '_blank');
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-96 space-y-4 animate-pulse">
            <BeakerIcon className="w-16 h-16 text-pharma-accent" />
            <p className="text-slate-400">Synthesizing clinical evidence...</p>
        </div>
    );

    if (!data) return <div className="text-red-400">Research Failed</div>;

    // Prepare chart data
    const trials = data.trials || [];

    // Status Data
    const statusCounts: Record<string, number> = {};
    trials.forEach((t: any) => { statusCounts[t.status] = (statusCounts[t.status] || 0) + 1; });
    const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    // Phase Data
    const phaseCounts: Record<string, number> = {};
    trials.forEach((t: any) => { phaseCounts[t.phase] = (phaseCounts[t.phase] || 0) + 1; });
    const phaseData = Object.entries(phaseCounts).map(([name, value]) => ({ name, value }));

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                        Research Results: {data.molecule}
                    </h2>
                    <div className="flex space-x-4 mt-2 text-sm text-slate-400">
                        <span>Confidence: {(data.confidence_overall * 100).toFixed(0)}%</span>
                        <span>Data Completeness: {(data.data_completeness_score * 100).toFixed(0)}%</span>
                    </div>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={() => handleDownload('pdf')}
                        className="flex items-center space-x-2 px-4 py-2 bg-pharma-accent hover:bg-pharma-accent/80 rounded-lg text-black font-semibold transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                        <ArrowDownTrayIcon className="w-5 h-5" />
                        <span>PDF Report</span>
                    </button>
                    <button
                        onClick={() => handleDownload('ppt')}
                        className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-medium transition-all">
                        <ArrowDownTrayIcon className="w-5 h-5" />
                        <span>Slides (PPTX)</span>
                    </button>
                </div>
            </div>

            {/* Visual Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-pharma-card rounded-xl border border-slate-700">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <ChartBarIcon className="w-5 h-5 mr-2 text-pharma-accent" />
                        Trial Status
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%" cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value">
                                    {statusData.map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="p-6 bg-pharma-card rounded-xl border border-slate-700">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <ChartBarIcon className="w-5 h-5 mr-2 text-pharma-accent" />
                        Phase Distribution
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={phaseData}>
                                <XAxis dataKey="name" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.1)' }} contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                                <Bar dataKey="value" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Key Findings */}
            <div className="p-6 bg-pharma-card rounded-xl border border-slate-700">
                <h3 className="text-xl font-bold text-white mb-4">Key Clinical Findings</h3>
                <ul className="space-y-3">
                    {data.key_findings.map((finding: string, i: number) => (
                        <li key={i} className="flex items-start text-slate-300">
                            <span className="mr-3 text-pharma-accent">•</span>
                            {finding}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Market Intelligence */}
            {data.market_data && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-pharma-card rounded-xl border border-slate-700">
                        <h3 className="text-xl font-bold text-white mb-4">Commercial Landscape</h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-slate-800/50 rounded-lg">
                                    <p className="text-xs text-slate-400 uppercase tracking-wider">Market Size (Global)</p>
                                    <p className="text-lg font-semibold text-pharma-accent">{data.market_data.market_size_global || 'N/A'}</p>
                                </div>
                                <div className="p-3 bg-slate-800/50 rounded-lg">
                                    <p className="text-xs text-slate-400 uppercase tracking-wider">TAM</p>
                                    <p className="text-lg font-semibold text-white">{data.market_data.tam || 'N/A'}</p>
                                </div>
                                <div className="p-3 bg-slate-800/50 rounded-lg">
                                    <p className="text-xs text-slate-400 uppercase tracking-wider">SAM</p>
                                    <p className="text-lg font-semibold text-white">{data.market_data.sam || 'N/A'}</p>
                                </div>
                                <div className="p-3 bg-slate-800/50 rounded-lg">
                                    <p className="text-xs text-slate-400 uppercase tracking-wider">SOM</p>
                                    <p className="text-lg font-semibold text-white">{data.market_data.som || 'N/A'}</p>
                                </div>
                            </div>
                            {data.market_data.trend_analysis && (
                                <div className="mt-4">
                                    <p className="text-xs text-slate-400 uppercase mb-1">Trend Analysis</p>
                                    <p className="text-sm text-slate-300">{data.market_data.trend_analysis}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-6 bg-pharma-card rounded-xl border border-slate-700">
                        <h3 className="text-xl font-bold text-white mb-4">Competitor Breakdown</h3>
                        <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                            {data.market_data.competitors?.map((comp: any, i: number) => (
                                <div key={i} className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-semibold text-white">{comp.name}</span>
                                        <span className="text-xs px-2 py-0.5 bg-pharma-accent/20 text-pharma-accent rounded-full">
                                            {(comp.confidence_score * 100).toFixed(0)}% Conf.
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400">{comp.market_share || 'Market share unknown'}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Risk Assessment */}
            {data.risk_assessment && (
                <div className="p-6 bg-pharma-card rounded-xl border border-red-900/30">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                        <BeakerIcon className="w-6 h-6 mr-2 text-red-400" />
                        Strategic Risk Assessment
                    </h3>
                    <p className="text-slate-300 leading-relaxed italic">"{data.risk_assessment}"</p>
                </div>
            )}
        </div>
    );
};
