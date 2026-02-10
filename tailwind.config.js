/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'retro-base': '#efe3cf',   // Crema principal
        'retro-base2': '#f3ead7',  // Crema más claro (para degradados)
        'retro-ink': '#0f0f10',    // Negro tinta (casi negro)
        'retro-gold': '#c6a35a',   // Dorado
        'retro-line': 'rgba(15, 15, 16, 0.1)', // Líneas sutiles
        'retro-muted': '#6f6f73',  // Gris texto secundario
      },
      animation: {
        'marquee': 'marquee 25s linear infinite', // Velocidad ajustada para leer bien
        'fadeIn': 'fadeIn 0.5s ease-out',
        'slideDown': 'slideDown 0.3s ease-out',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' }, // Mueve solo la mitad para el loop infinito
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'sans-serif'], // O la fuente que estés usando
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
};