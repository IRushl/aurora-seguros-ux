import React from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-700.css';
import './styles/tokens.css';
import './styles/app.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
