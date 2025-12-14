/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                // Backgrounds
                'bg-primary': '#0a0a0f',
                'bg-secondary': '#12121a',
                'bg-card': '#1a1a2e',
                'bg-card-hover': '#252540',
                // Purple accents
                'accent-purple': '#8b5cf6',
                'accent-violet': '#a855f7',
                'accent-fuchsia': '#d946ef',
                // Spotify green
                'spotify-green': '#1DB954',
            },
            backgroundImage: {
                'gradient-primary': 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)',
                'gradient-glow': 'linear-gradient(135deg, rgba(139, 92, 246, 0.4) 0%, rgba(217, 70, 239, 0.4) 100%)',
            },
            boxShadow: {
                'glow': '0 0 30px rgba(139, 92, 246, 0.3)',
                'glow-lg': '0 0 60px rgba(139, 92, 246, 0.4)',
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
        },
    },
    plugins: [],
}
