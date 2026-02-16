import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Bot,
    FileText,
    Database,
    Settings,
    Terminal,
    Activity
} from 'lucide-react';
import styles from './Sidebar.module.css';

export const Sidebar: React.FC = () => {
    const navItems = [
        { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/agents', icon: Bot, label: 'Active Agents' },
        { to: '/research', icon: FileText, label: 'Research Tasks' },
        { to: '/knowledge', icon: Database, label: 'Knowledge Base' },
        { to: '/logs', icon: Terminal, label: 'System Logs' },
        { to: '/settings', icon: Settings, label: 'Settings' },
    ];

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logoContainer}>
                <div className={styles.logo}>
                    <Activity size={24} />
                    <span>PHARM_AGENT</span>
                </div>
            </div>

            <nav className={styles.nav}>
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            isActive ? `${styles.navItem} ${styles.navItemActive}` : styles.navItem
                        }
                    >
                        <item.icon className={styles.navIcon} />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className={styles.footer}>
                v7.0.0-RC1
                <br />
                SYSTEM ONLINE
            </div>
        </aside>
    );
};
