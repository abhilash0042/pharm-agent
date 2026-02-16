import React, { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import styles from './Layout.module.css';

interface LayoutProps {
    children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className={styles.container}>
            <Sidebar />
            <div className={styles.mainContent}>
                <Header />
                <main className={styles.pageContent}>
                    {children}
                </main>
            </div>
        </div>
    );
};
