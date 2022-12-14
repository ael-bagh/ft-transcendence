/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    'node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        'levi': ["Levibrush", "sans-serif"],
        'minecraft': ["Minecraft", "sans-serif"],
      },
    },
  },
  plugins: [
    require('flowbite/plugin')
  ],
}
