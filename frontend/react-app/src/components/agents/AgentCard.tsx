import React from 'react';
import { Bot, Play, Pause } from 'lucide-react';
import styles from './AgentCard.module.css';

export interface AgentProps {
    id: string;
    name: string;
    description: string;
    status: 'idle' | 'running' | 'error';
    tasksCompleted: number;
    uptime: string;
}

export const AgentCard: React.FC<AgentProps> = ({
    name,
    description,
    status,
    tasksCompleted,
    uptime
}) => {
    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <div className={styles.iconWrapper}>
                    <Bot size={28} />
                </div>
                <div className={`${styles.statusIndicator} ${status === 'running' ? styles.statusRunning :
                    status === 'error' ? styles.statusError :
                        styles.statusIdle
                    }`}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'currentColor' }} />
                    {status}
                </div>
            </div>

            <div>
                <h3 className={styles.name}>{name}</h3>
                <p className={styles.description}>{description}</p>
            </div>

            <div className={styles.stats}>
                <div>TASKS: {tasksCompleted}</div>
                <div>UPTIME: {uptime}</div>
            </div>

            <div className={styles.actions}>
                {status === 'running' ? (
                    <button className={`${styles.button} ${styles.btnSecondary}`}>
                        <Pause size={14} /> PAUSE
                    </button>
                ) : (
                    <button className={`${styles.button} ${styles.btnPrimary}`}>
                        <Play size={14} /> START
                    </button>
                )}
                <button className={`${styles.button} ${styles.btnSecondary}`}>
                    DETAILS
                </button>
            </div>
        </div>
    );
};
