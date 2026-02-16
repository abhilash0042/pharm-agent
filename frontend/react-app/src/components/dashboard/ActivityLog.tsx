import React, { useEffect, useRef } from 'react';
import { Terminal } from 'lucide-react';
import styles from './ActivityLog.module.css';

interface LogEntry {
    id: string;
    timestamp: string;
    message: string;
    level: 'info' | 'warn' | 'error';
}

// Mock data generator
const generateMockLogs = (): LogEntry[] => [
    { id: '1', timestamp: '10:42:01', message: 'System initialized successfully', level: 'info' },
    { id: '2', timestamp: '10:42:05', message: 'Connected to primary database node', level: 'info' },
    { id: '3', timestamp: '10:42:12', message: 'Loading agent configurations...', level: 'info' },
    { id: '4', timestamp: '10:42:15', message: 'Market Intelligence Agent: Idle', level: 'info' },
    { id: '5', timestamp: '10:42:16', message: 'Clinical Trials Agent: Active', level: 'info' },
    { id: '6', timestamp: '10:42:45', message: 'Fetching latest FDA approvals...', level: 'info' },
    { id: '7', timestamp: '10:43:02', message: 'Rate limit warning: API (clinical.trails.gov)', level: 'warn' },
    { id: '8', timestamp: '10:43:10', message: 'Data ingestion complete for batch #492', level: 'info' },
];

export const ActivityLog: React.FC = () => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const logs = generateMockLogs();

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, []);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <span className={styles.title}>System Log Stream</span>
                <Terminal size={14} className={styles.title} />
            </div>
            <div className={styles.content} ref={scrollRef}>
                {logs.map((log) => (
                    <div key={log.id} className={styles.logEntry}>
                        <span className={styles.timestamp}>[{log.timestamp}]</span>
                        <span className={styles.message}>
                            <span className={
                                log.level === 'warn' ? styles.levelWarn :
                                    log.level === 'error' ? styles.levelError :
                                        styles.levelInfo
                            }>
                                {log.level.toUpperCase()}
                            </span>
                            {' :: '}
                            {log.message}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};
