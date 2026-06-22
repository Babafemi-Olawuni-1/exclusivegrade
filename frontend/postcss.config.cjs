const tailwindcss  = require('./node_modules/tailwindcss')
const autoprefixer = require('./node_modules/autoprefixer')

module.exports = {
  plugins: [
    tailwindcss('./tailwind.config.cjs'),
    autoprefixer,
  ],
}
