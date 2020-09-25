import { db, functions } from '../plugins/firebase'
import version from './version'

export const clearService = state => {
  state.version = version
  state.service = {}
  state.menuPosition = 'br'
  state.locale = 'ja_JP'
  state.tz = 'Asia/Tokyo'
}

const onServiceUpdate = (state, querySnapshot) => {
  const service = {}
  querySnapshot.forEach(doc => service[doc.id] = doc.data())
  state.service = service
  if (state.service.defaults) {
    const keys = ['menuPosition', 'locale', 'tz']
    keys.forEach(key => { state[key] = state.service.defaults[key] || state[key] })
  }
}
export const initService = async state => {
  onServiceUpdate(state, await db.collection('service').get())
  db.collection('service').onSnapshot(
    querySnapshot => onServiceUpdate(state, querySnapshot)
  )
}

export const updateServiceVersion = () => functions.httpsCallable("updateServiceVersion").call()
