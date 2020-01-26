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

export const getServiceConf = async ({ commit, state }) => {
  let doc = await state.db.collection('service').doc('conf').get()
  commit('setService', doc)
  commit('setPreferences', doc.data())
  state.firebase.auth().languageCode = state.preferences.locale.replace(/.*-/, '')
  state.db.collection('service').doc('conf').onSnapshot(async doc => {
    commit('setService', doc)
  })
}

export const getServiceStatus = async ({ commit, state }) => {
  let doc = await state.db.collection('service').doc('status').get()
  onServiceStatusChanged({ commit, state }, { doc })
  state.db.collection('service').doc('status').onSnapshot(async doc => {
    onServiceStatusChanged({ commit, state }, { doc })
  })
}
