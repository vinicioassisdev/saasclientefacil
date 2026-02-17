/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./**/*.{js,ts,jsx,tsx}", // Catch-all for root files
    ],
    theme: {
        extend: {},
    },
    plugins: [],
}
