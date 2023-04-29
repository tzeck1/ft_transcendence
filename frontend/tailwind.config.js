module.exports = {
  corePlugins: {
    container:false
  },
  purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
      '3xl': '1792px',
      '4xl': '2048px',
      '5xl': '2304px',
    },
    extend: {
      fontSize: {
        "1vh": "1vh",
        "2vh": "2vh",
        "3vh": "3vh",
        "4vh": "4vh",
        "5vh": "5vh",
        "6vh": "6vh",
        "7vh": "7vh",
        "8vh": "8vh",
        "9vh": "9vh",
        "10vh": "10vh",
      },
      height: {
        "3vh": "3vh",
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    function ({ addComponents }) {
      addComponents({
        '.container': {
          maxWidth: '100%',
          '@screen sm': {
            maxWidth: '640px',
          },
          '@screen md': {
            maxWidth: '768px',
          },
          '@screen lg': {
            maxWidth: '1024px',
          },
          '@screen xl': {
            maxWidth: '1280px',
          },
          '@screen 2xl': {
            maxWidth: '1536px'
          },
          '@screen 3xl': {
            maxWidth: '1792px'
          },
          '@screen 4xl': {
            maxWidth: '2048px'
          },
          '@screen 5xl': {
            maxWidth: '2304px'
          }
        },
      })
    }
  ],
}
