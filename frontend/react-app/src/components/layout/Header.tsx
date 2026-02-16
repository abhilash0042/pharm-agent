import React from 'react';
import styles from './Header.module.css';

export const Header: React.FC = () => {
    return (
        <header className={styles.header}>
            <div className={styles.title}>
                Research Console / Dashboard
            </div>

            <div className={styles.controls}>
                <div className={styles.statusInfo}>
                    <div className={styles.statusDot} />
                    <span>NETWORK: SECURE</span>
                </div>
            </div>
        </header>
    );
};
