import React from 'react';
import type { LucideIcon } from 'lucide-react';
import styles from './StatsCard.module.css';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: string;
    trendDirection?: 'up' | 'down';
}

export const StatsCard: React.FC<StatsCardProps> = ({
    title,
    value,
    icon: Icon,
    trend,
    trendDirection = 'up'
}) => {
    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <span className={styles.title}>{title}</span>
                <Icon size={18} className={styles.icon} />
            </div>
            <div className={styles.value}>{value}</div>
            {trend && (
                <div className={`${styles.trend} ${trendDirection === 'up' ? styles.trendPositive : styles.trendNegative}`}>
                    {trendDirection === 'up' ? '↑' : '↓'} {trend}
                </div>
            )}
        </div>
    );
};
