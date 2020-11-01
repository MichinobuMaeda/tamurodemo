module.exports = {
  pluginOptions: {
    i18n: {
      locale: 'ja',
      fallbackLocale: 'ja',
      localeDir: 'locales',
      enableInSFC: false
    }
  },
  transpileDependencies: [
    'vuetify'
  ],
  pwa: {
    name: 'Tamuro',
    themeColor: '#33691e',
    msTileColor: '#f1f8e9',
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: 'black',
    manifestOptions: {
      start_url: '/',
      display: 'standalone',
      orientation: 'portrait-primary',
      background_color: '#f1f8e9'
    },
    workboxPluginMode: 'InjectManifest',
    workboxOptions: {
      swSrc: 'src/registerServiceWorker.js'
    }
  }
}
