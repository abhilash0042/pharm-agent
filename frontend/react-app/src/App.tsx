import React from 'react';
import './styles/utils.css';

function App() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>
            <h1>Initializing System...</h1>
            <p style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>Loading modules...</p>
        </div>
    );
}

export default App;
