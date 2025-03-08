module.exports = {
    content: [
      './src/**/*.{html,js,jsx,ts,tsx,css}',  // Adjust according to your project structure
    ],
    theme: {
      extend: {},
    },
    plugins: [
      require('@tailwindcss/forms'),  // Add this line to use the forms plugin
    ],
  }