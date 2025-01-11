/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}', // Inclui todos os arquivos na pasta app
    './src/components/**/*.{js,ts,jsx,tsx}', // Inclui componentes reutilizáveis
  ],  theme: {
    extend: {
      colors: {
        azul: '#0686C3',
        azul2: '#01C0F8',
        verde: '#46D43E',
        cinza: '#9A9B9D',
        preto: '#0E1518',
      },
    },
  },
  plugins: [],
};
