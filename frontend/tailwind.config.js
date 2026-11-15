/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sanctuary: {
          ivory: '#F8F6F0',
          sage: '#E9F0E7',
          'sage-light': '#F2F7F1',
          eucalyptus: '#A9C4B2',
          forest: '#244B43',
          'forest-dark': '#17332D',
          'forest-light': '#326359',
          mist: '#D9E9E5',
          sand: '#E8D8CC',
          'sand-light': '#F5ECE5',
          terracotta: '#D98880',
          sun: '#F4D06F',
        },
        brand: {
          50: '#f4f8f4',
          100: '#e9f0e7',
          200: '#d9e9e5',
          300: '#a9c4b2',
          400: '#6d9d80',
          500: '#326359',
          600: '#244B43',
          700: '#1e3f38',
          800: '#17332d',
          900: '#102420',
          950: '#0b1916',
        },
        aura: {
          mist: '#D9E9E5',
          sky: '#A9C4B2',
          ocean: '#244B43',
          teal: '#2F5E54',
          mint: '#E9F0E7',
          iris: '#8E9AAF',
          twilight: '#17332D',
          midnight: '#102420',
        }
      },
      boxShadow: {
        'sanctuary': '0 8px 30px -4px rgba(36, 75, 67, 0.06)',
        'sanctuary-lg': '0 16px 45px -8px rgba(36, 75, 67, 0.10)',
        'sanctuary-glow': '0 0 30px rgba(169, 196, 178, 0.35)',
        'aura': '0 4px 25px -4px rgba(36, 75, 67, 0.08)',
        'aura-lg': '0 10px 35px -5px rgba(36, 75, 67, 0.12)',
        'aura-glow': '0 0 25px rgba(169, 196, 178, 0.25)',
      }
    },
  },
  plugins: [],
}
