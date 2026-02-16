import React from 'react';
import { AgentCard, type AgentProps } from '../components/agents/AgentCard';
import styles from './Agents.module.css';

const Agents: React.FC = () => {
    const agents: AgentProps[] = [
        {
            id: 'market-intel',
            name: 'Market Intelligence',
            description: 'Monitors competitor movements, pricing strategies, and market trends in real-time.',
            status: 'running',
            tasksCompleted: 142,
            uptime: '4d 2h'
        },
        {
            id: 'clinical-trials',
            name: 'Clinical Trials Monitor',
            description: 'Tracks ongoing clinical trials, FDA approvals, and recruitment milestones.',
            status: 'idle',
            tasksCompleted: 89,
            uptime: '12h 30m'
        },
        {
            id: 'patent-watch',
            name: 'Patent Watchdog',
            description: 'Scans global patent databases for new filings related to target compounds.',
            status: 'idle',
            tasksCompleted: 312,
            uptime: '4d 2h'
        },
        {
            id: 'sentiment-analysis',
            name: 'Social Sentiment',
            description: 'Analyzes patient and HCP sentiment across social media and forums.',
            status: 'idle',
            tasksCompleted: 1240,
            uptime: '2h 15m'
        }
    ];

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Active Agents</h1>
            </div>

            <div className={styles.grid}>
                {agents.map(agent => (
                    <AgentCard key={agent.id} {...agent} />
                ))}
            </div>
        </div>
    );
};

export default Agents;
