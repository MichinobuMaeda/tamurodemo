import version from '../conf/version'

export const releaseUiNewVersion = ({ state }) => state.db.collection('service').doc('status').update({
  version: state.conf.version
})

const onServiceStatusChanged = ({ commit, state }, { doc, i18n }) => {
  commit('setService', doc)
  i18n.locale = (state.service && state.service.status && state.service.status.locale) || i18n.locale
  if (state.service.status.version > version) {
    const reloadPage = (path, cb) => {
      let req = new XMLHttpRequest()
      req.open('get', path)
      req.setRequestHeader('Pragma', 'no-cache')
      req.setRequestHeader('Expires', '-1')
      req.setRequestHeader('Cache-Control', 'no-cache')
      req.send()
      req.onreadystatechange = () => {
        if (req.readyState === 4) {
          cb()
        }
      }
    }
    reloadPage(
      '/service-worker.js',
      reloadPage(
        '/',
        reloadPage(
          window.location.href,
          () => {
            caches.keys().then(keys => {
              keys.forEach(key => caches.delete(key))
            })
            setTimeout(() => document.location.reload(true), 1000)
          }
        )
      )
    )
  }
}

export const getServiceStatus = async ({ commit, state }, { i18n }) => {
  await onServiceStatusChanged({ commit, state }, { doc: await state.db.collection('service').doc('status').get(), i18n })
  state.db.collection('service').doc('status').onSnapshot(async doc => {
    await onServiceStatusChanged({ commit, state }, { doc, i18n })
  })
}
