import React, { useState } from 'react';
import { PlayIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

interface NewResearchProps {
    onSubmit: (molecule: string, prompt: string) => void;
    isLoading: boolean;
}

export const NewResearch: React.FC<NewResearchProps> = ({ onSubmit, isLoading }) => {
    const [molecule, setMolecule] = useState('');
    const [prompt, setPrompt] = useState('Analyze clinical trials for efficacy and safety signals.');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (molecule.trim()) {
            onSubmit(molecule, prompt);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-pharma-card rounded-xl p-6 border border-slate-700 shadow-xl"
        >
            <h3 className="text-xl font-semibold mb-4 text-white">Start New Research</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Target Molecule</label>
                    <input
                        type="text"
                        value={molecule}
                        onChange={(e) => setMolecule(e.target.value)}
                        placeholder="e.g., CardioFlow-7"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-pharma-accent placeholder:text-slate-600 transition-all"
                        disabled={isLoading}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Research Prompt</label>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-pharma-accent h-24 resize-none transition-all"
                        disabled={isLoading}
                    />
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isLoading || !molecule.trim()}
                        className="flex items-center space-x-2 bg-gradient-to-r from-pharma-accent to-blue-600 hover:to-blue-500 text-white px-6 py-3 rounded-lg font-medium shadow-lg shadow-pharma-accent/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <PlayIcon className="w-5 h-5" />
                        )}
                        <span>{isLoading ? 'Initiating Agent...' : 'Launch Research'}</span>
                    </button>
                </div>
            </form>
        </motion.div>
    );
};
