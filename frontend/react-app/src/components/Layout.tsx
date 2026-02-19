import React from 'react';
import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

interface LayoutProps {
    children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="flex bg-pharma-dark min-h-screen text-slate-100 font-sans selection:bg-pharma-accent/30">
            <Sidebar />
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="h-16 border-b border-slate-700 flex items-center justify-between px-8 bg-pharma-dark/50 backdrop-blur-md sticky top-0 z-10">
                    <h2 className="text-lg font-semibold text-slate-200">Research Console</h2>
                    <div className="flex items-center space-x-4">
                        <span className="text-xs text-pharma-success bg-pharma-success/10 px-2 py-1 rounded-full border border-pharma-success/20">System Online</span>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-auto p-8 relative">
                    {/* Background decoration */}
                    <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-pharma-accent/5 to-transparent pointer-events-none"></div>

                    <div className="relative z-0 max-w-6xl mx-auto">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};
