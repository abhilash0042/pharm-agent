import React from 'react';
import { Activity, Brain, Database, Server } from 'lucide-react';
import { StatsCard } from '../components/dashboard/StatsCard';
import { ActivityLog } from '../components/dashboard/ActivityLog';
import styles from './Dashboard.module.css';

const Dashboard: React.FC = () => {
    return (
        <div className={styles.dashboard}>
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>System Overview</h2>
                </div>
                <div className={styles.grid}>
                    <StatsCard
                        title="Active Agents"
                        value="4"
                        icon={Brain}
                        trend="Stable"
                    />
                    <StatsCard
                        title="Research Tasks"
                        value="12"
                        icon={Activity}
                        trend="2 New"
                    />
                    <StatsCard
                        title="Knowledge Nodes"
                        value="1,240"
                        icon={Database}
                        trend="+15%"
                    />
                    <StatsCard
                        title="System Load"
                        value="32%"
                        icon={Server}
                        trendDirection="down"
                        trend="-5%"
                    />
                </div>
            </div>

            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Recent Research Activity</h2>
                </div>
                <ActivityLog />
            </div>
        </div>
    );
};

export default Dashboard;
