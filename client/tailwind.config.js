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
                theme: {
                    50: '#EEF2FF',
                    100: '#E0E7FF',
                    200: '#C7D2FE',
                    300: '#A5B4FC',
                    400: '#818CF8',
                    500: '#6366F1',
                    600: '#4F46E5',
                    700: '#4338CA',
                    800: '#3730A3',
                    900: '#312E81',
                    950: '#1E1B4B',
                  },
                nav: {
                    border: '#262626'
                }
            },
            spacing: {
                940: '940px'
            }
        },
    },
    darkMode: "class",
    plugins: [
        nextui(),
    ],
}