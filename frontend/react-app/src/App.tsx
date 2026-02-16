import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import Dashboard from './pages/Dashboard';

// Lazy load other pages
const PlaceholderPage = ({ title }: { title: string }) => (
    <div style={{ padding: 'var(--space-lg)', color: 'var(--color-text-muted)' }}>
        <h2>{title}</h2>
        <p>Module initializing...</p>
    </div>
);

function App() {
    return (
        <Layout>
            <Suspense fallback={<div>Loading...</div>}>
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/agents" element={<PlaceholderPage title="Active Agents" />} />
                    <Route path="/research" element={<PlaceholderPage title="Research Tasks" />} />
                    <Route path="/knowledge" element={<PlaceholderPage title="Knowledge Base" />} />
                    <Route path="/logs" element={<PlaceholderPage title="System Logs" />} />
                    <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Suspense>
        </Layout>
    );
}

export default App;
