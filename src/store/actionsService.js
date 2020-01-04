import version from '../conf/version'

const onServiceStatusChanged = ({ commit, state }, { doc }) => {
  commit('setService', doc)
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
  let doc = await state.db.collection('service').doc('status').get()
  state.preferences.menuPosition = doc.data().menuPosition || state.preferences.menuPosition
  state.preferences.locale = doc.data().locale || state.preferences.locale
  state.preferences.timezone = doc.data().timezone || state.preferences.timezone
  i18n.locale = state.preferences.locale
  onServiceStatusChanged({ commit, state }, { doc })
  state.db.collection('service').doc('status').onSnapshot(async doc => {
    onServiceStatusChanged({ commit, state }, { doc })
  })
}
