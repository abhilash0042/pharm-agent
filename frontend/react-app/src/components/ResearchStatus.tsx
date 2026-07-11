import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { CheckCircleIcon, ClockIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { researchApi } from '../api/client';
import type { ResearchStatusResponse } from '../types';
import clsx from 'clsx';

interface ResearchStatusProps {
    jobId: string;
    onComplete: (data: ResearchStatusResponse) => void;
}

export const ResearchStatus: React.FC<ResearchStatusProps> = ({ jobId, onComplete }) => {
    const [status, setStatus] = useState<string>('queued');
    const statusRef = useRef(status);

    // Keep ref in sync with state
    useEffect(() => {
        statusRef.current = status;
    }, [status]);

    // Polling Logic
    useEffect(() => {
        let isMounted = true;
        const poll = async () => {
            try {
                const data = await researchApi.getStatus(jobId);
                if (isMounted) {
                    setStatus(data.status);
                    if (data.status === 'completed' || data.status === 'failed') {
                        onComplete(data);
                        return; // Stop polling
                    }
                }
            } catch (err) {
                console.error("Polling error", err);
            }

            // Use ref to check latest status (avoids stale closure)
            if (isMounted && statusRef.current !== 'completed' && statusRef.current !== 'failed') {
                setTimeout(poll, 2000); // Poll every 2s
            }
        };

        poll();
        return () => { isMounted = false; };
    }, [jobId]);

    const steps = [
        { id: 'clinical_trials', label: 'Clinical Trials Mining', activeStates: ['running_clinical_trials'], completedStates: ['running_patents', 'running_market_intelligence', 'running_synthesis', 'generating_report', 'completed'] },
        { id: 'patents', label: 'Patent Analysis', activeStates: ['running_patents'], completedStates: ['running_market_intelligence', 'running_synthesis', 'generating_report', 'completed'] },
        { id: 'market', label: 'Market Intelligence', activeStates: ['running_market_intelligence'], completedStates: ['running_synthesis', 'generating_report', 'completed'] },
        { id: 'synthesis', label: 'Evidence Synthesis (LLM)', activeStates: ['running_synthesis'], completedStates: ['generating_report', 'completed'] },
        { id: 'report', label: 'Report Generation', activeStates: ['generating_report'], completedStates: ['completed'] },
    ];

    const getStepState = (step: typeof steps[0]) => {
        if (steps.some(s => s.completedStates.includes(status) && s.id === step.id) || step.completedStates.includes(status)) return 'completed';
        if (step.activeStates.includes(status)) return 'active';
        return 'pending';
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-pharma-card rounded-xl p-8 border border-slate-700 shadow-xl relative overflow-hidden"
        >
            {/* Background Pulse */}
            {status !== 'completed' && status !== 'failed' && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-pharma-accent/20 rounded-full blur-3xl -mr-10 -mt-10 animate-pulse"></div>
            )}

            <h3 className="text-xl font-semibold mb-6 flex items-center space-x-3">
                <div className={clsx("w-3 h-3 rounded-full", {
                    'bg-pharma-accent animate-ping': status.startsWith('running') || status === 'generating_report',
                    'bg-pharma-success': status === 'completed',
                    'bg-pharma-error': status === 'failed',
                    'bg-slate-500': status === 'queued'
                })}></div>
                <span>Research Status: <span className="text-pharma-accent capitalize">{status.replace(/_/g, ' ').replace('running ', '')}</span></span>
            </h3>

            <div className="space-y-6 relative">
                {/* Connecting Line */}
                <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-slate-800 -z-10"></div>

                {steps.map((step, idx) => {
                    const stepState = getStepState(step);
                    return (
                        <div key={idx} className="flex items-center space-x-4">
                            <div className={clsx("w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-500", {
                                'border-pharma-success bg-pharma-success/20 text-pharma-success': stepState === 'completed',
                                'border-pharma-accent bg-pharma-accent/20 text-pharma-accent animate-pulse': stepState === 'active',
                                'border-slate-700 bg-slate-800 text-slate-500': stepState === 'pending'
                            })}>
                                {stepState === 'completed' ? <CheckCircleIcon className="w-6 h-6" /> :
                                    stepState === 'active' ? <ClockIcon className="w-6 h-6 animate-spin-slow" /> :
                                        <DocumentTextIcon className="w-6 h-6" />}
                            </div>
                            <div>
                                <p className={clsx("font-medium text-lg", {
                                    'text-white': stepState !== 'pending',
                                    'text-slate-500': stepState === 'pending'
                                })}>{step.label}</p>
                                <p className="text-sm text-slate-500">
                                    {stepState === 'completed' ? 'Completed successfully' :
                                        stepState === 'active' ? 'Processing...' : 'Waiting...'}
                                </p>
                            </div>
                        </div>
                    )
                })}
            </div>
        </motion.div>
    );
};
