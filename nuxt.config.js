module.exports = {
  mode: 'spa',
  head: { title: 'gui' }, // Headers of the page
  loading: false, // Disable default loading bar
  build: {
    extend(config, { isDev, isClient }) {
      if (isDev && isClient) {
        // Run ESLint on save
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }
      // Extend only webpack config for client-bundle
      if (isClient) {
        config.target = 'electron-renderer'
      }
    }
  },
  dev: process.env.NODE_ENV === 'DEV',
  css: [
    'element-ui/lib/theme-chalk/index.css',
    '@fortawesome/fontawesome-svg-core/styles.css'
  ],
  plugins: [
    '@/plugins/element-ui',
    '~/plugins/font-awesome.js',
    '~/plugins/vue-feather-icons.js'
  ]
}
