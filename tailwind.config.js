/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0a0807', // ana arka plan (siyaha yakın, sıcak)
        night: '#030303', // tam gece
        bone: '#ece4d8', // kırık beyaz yazı
        wine: '#5c1620', // bordo
        ember: '#a8382e', // sıcak kırmızı (çok az kullan)
        gold: '#c6a46a', // hafif altın
        paper: '#efe6d8', // mektup kağıdı
        inkbrown: '#2b1c18', // mektup yazısı
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        label: '0.32em',
      },
    },
  },
  plugins: [],
}
