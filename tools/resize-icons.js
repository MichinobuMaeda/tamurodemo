const path = require('path')
const sharp = require('sharp')
const icongen = require('icon-gen')

// Vue + Vuetify + PWA の場合
const iconsPath = path.join(__dirname, '..', 'public', 'img', 'icons')
const faviconPath = path.join(__dirname, '..', 'public')
// 入力に safari-pinned-tab.svg 以外のファイルを利用する場合は変更する。
const inputPath = path.join(iconsPath, 'safari-pinned-tab.svg')

// Vue + Vuetify + PWA の場合
const targets = [
  {
    source: inputPath,
    size: 192,
    name: 'android-chrome-192x192.png'
  },
  {
    source: inputPath,
    size: 512,
    name: 'android-chrome-512x512.png'
  },
  {
    source: inputPath,
    size: 192,
    name: 'android-chrome-maskable-192x192.png'
  },
  {
    source: inputPath,
    size: 512,
    name: 'android-chrome-maskable-512x512.png'
  },
  {
    source: inputPath,
    size: 180,
    name: 'apple-touch-icon.png'
  },
  {
    source: inputPath,
    size: 60,
    name: 'apple-touch-icon-60x60.png'
  },
  {
    source: inputPath,
    size: 76,
    name: 'apple-touch-icon-76x76.png'
  },
  {
    source: inputPath,
    size: 120,
    name: 'apple-touch-icon-120x120.png'
  },
  {
    source: inputPath,
    size: 152,
    name: 'apple-touch-icon-152x152.png'
  },
  {
    source: inputPath,
    size: 180,
    name: 'apple-touch-icon-180x180.png'
  },
  {
    source: inputPath,
    size: 16,
    name: 'favicon-16x16.png'
  },
  {
    source: inputPath,
    size: 32,
    name: 'favicon-32x32.png'
  },
  {
    source: inputPath,
    size: 144,
    name: 'msapplication-icon-144x144.png'
  },
  {
    source: inputPath,
    size: 150,
    name: 'mstile-150x150.png'
  }
]

targets.forEach(target => {
  // 入力がSVGで出力の解像度が低い場合は density を大きな値に変更する。
  const inputImage = sharp(target.source, { density: 96 })
  inputImage.metadata().then(metaData => {
    inputImage
      // トリミングが必要な場合は設定する。
      .extract({
        left: 0,
        top: 0,
        width: metaData.width - 0 * 2,
        height: metaData.height - 0 * 2
      })
      // kernel は通常 lanczos3 (default) でよい。
      .resize(
        target.size,
        target.size,
        {
          kernel: sharp.kernel.lanczos3
        }
      )
      .toFile(path.join(iconsPath, target.name))
  })
})

icongen(inputPath, faviconPath, {
  report: true,
  ico: {
    name: 'favicon',
    sizes: [16, 32, 48]
  }
}).then((results) => {
  console.log(results)
}).catch((err) => {
  console.error(err)
})
