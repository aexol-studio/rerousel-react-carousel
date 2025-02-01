import { App } from './App';
import React from 'react';
import { createRoot } from 'react-dom/client';

const appMount = document.getElementById('app');

if (appMount) {
    const root = createRoot(appMount);
    root.render(<App />);
}
