/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'warm-ivory': 'hsl(var(--color-warm-ivory) / <alpha-value>)',
        'soft-beige': 'hsl(var(--color-soft-beige) / <alpha-value>)',
        'deep-brown': 'hsl(var(--color-deep-brown) / <alpha-value>)',
        'warm-gray': 'hsl(var(--color-warm-gray) / <alpha-value>)',
        'sage-green': 'hsl(var(--color-sage-green) / <alpha-value>)',
        'dusty-rose': 'hsl(var(--color-dusty-rose) / <alpha-value>)',
        'background': 'hsl(var(--color-warm-ivory) / <alpha-value>)',
        'foreground': 'hsl(var(--color-deep-brown) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      boxShadow: {
        'soft': '0 10px 40px -10px rgba(0,0,0,0.05)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      }
    },
  },
  plugins: [],
}
