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
        // PALETA EXACTA EXTRAÍDA DEL HTML
        'retro-base': '#efe3cf',   // Crema principal
        'retro-base2': '#f3ead7',  // Crema secundario (más claro)
        'retro-ink': '#0f0f10',    // Negro tinta (texto)
        'retro-gold': '#c6a35a',   // Dorado
        'retro-muted': '#6f6f73',  // Gris suave para textos secundarios
        'retro-line': 'rgba(15,15,16,0.10)', // Líneas sutiles
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};