import React from 'react';
import { HomeIcon, ClockIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

interface SidebarProps {
    className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className }) => {
    return (
        <div className={clsx("w-64 bg-pharma-card border-r border-slate-700 flex flex-col h-screen", className)}>
            <div className="p-6 border-b border-slate-700">
                <h1 className="text-xl font-bold bg-gradient-to-r from-pharma-accent to-blue-500 bg-clip-text text-transparent">
                    Pharm-Agent
                </h1>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                <a href="#" className="flex items-center space-x-3 px-4 py-3 bg-pharma-accent/10 text-pharma-accent rounded-lg">
                    <HomeIcon className="w-6 h-6" />
                    <span className="font-medium">Research Console</span>
                    <div className="ml-auto w-1 h-8 bg-pharma-accent rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)]"></div>
                </a>

                <a href="#" className="flex items-center space-x-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                    <ClockIcon className="w-6 h-6" />
                    <span className="font-medium">History</span>
                </a>

                {/* <a href="#" className="flex items-center space-x-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                    <Cog6ToothIcon className="w-6 h-6" />
                    <span className="font-medium">Settings</span>
                </a> */}
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
    );
};
