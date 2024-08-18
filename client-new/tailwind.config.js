const { nextui } = require("@nextui-org/react");

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
        "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}"
    ],
    theme: {
        extend: {
            screens: {
                xs: '320px',
                s: '428px',
                sm: '768px',
                md: '1024px',
                lg: '1200px',
                xl: '1512px',
            },
            colors: {
                brand: {
                    color: '#C7D2FE',
                    chatbg: '#FBDBA7',
                },
                nav: {
                    border: '#262626'
                }
            },
        },
    },
    darkMode: "class",
    plugins: [
        nextui(),
    ],
}