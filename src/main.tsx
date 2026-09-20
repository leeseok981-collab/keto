import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './ErrorBoundary.tsx';
import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('KETO root element was not found. Please ensure index.html has a <div id="root"></div> element.');
}

// Prevent white screen by suppressing benign WebSocket errors in AI Studio Preview
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && (
    event.reason.message?.includes('WebSocket') || 
    event.reason.message?.includes('closed without opened') ||
    event.reason === 'WebSocket closed without opened'
  )) {
    console.warn('Caught and suppressed benign Vite WebSocket error:', event.reason);
    event.preventDefault();
  }
});

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

