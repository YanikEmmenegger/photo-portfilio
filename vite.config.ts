import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import UnpluginFonts from 'unplugin-fonts/vite';

export default defineConfig({
    base: '/', // Base path for assets
    plugins: [
        react(),
        UnpluginFonts({
            google: {
                families: [
                    'Inter:wght@100;200;300;400;500;700' // Include Thin (200), Light (300), Regular (400), Medium (500), and Bold (700)
                ],
            },
        }),
    ],
});
