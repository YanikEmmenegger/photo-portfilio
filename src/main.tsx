// main.tsx or index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // Your global styles

// Add this effect to disable right-clicks globally
document.addEventListener('contextmenu', (event) => {
    event.preventDefault();
});

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
