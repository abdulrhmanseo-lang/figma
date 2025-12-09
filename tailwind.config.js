/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#0A2A43",
                accent: "#1CB5F3",
                brand: {
                    dark: "#0A2A43",
                    light: "#E3F6FC",
                    purple: "#6A11CB",
                    blue: "#2575FC",
                }
            },
            fontFamily: {
                cairo: ["Cairo", "sans-serif"],
            },
            container: {
                center: true,
                padding: "1.5rem",
                screens: {
                    "2xl": "1400px",
                },
            },
        },
    },
    plugins: [],
}
