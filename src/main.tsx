// main.tsx or index.tsx
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css'; // Your global styles

// Add this effect to disable right-clicks globally
// document.addEventListener('contextmenu', (event) => {
//     event.preventDefault();
// });

ReactDOM.render(
    <React.StrictMode>
        <App/>
    </React.StrictMode>,
    document.getElementById('root')
);
