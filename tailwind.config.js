/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}",], theme: {
        extend: {
            fontWeight: {
                thin: '100', // Custom font weight class for font-weight: 100
            },
        },
    }, plugins: [require('@tailwindcss/line-clamp'),],
}
