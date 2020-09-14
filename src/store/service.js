import { db } from '../plugins/firebase'
import version from './version'

export const clearService = state => {
  state.version = version
  state.service = {}
}

export const initService = async state => {
  state.service = {
    ...(await db.collection('service').get()).docs
      .reduce((ret, cur) => ({ ...ret, [cur.id]: cur.data() }), {})
  }
}

export const updateAvailable = state =>
  // version !== 'development' &&
  state.service.status &&
  state.service.status.version &&
  state.service.status.version !== state.version

export const updateApp = state => async () => {
  state.loading = true
  const registrations = await navigator.serviceWorker.getRegistrations()
  registrations.forEach(registration => {
    registration.unregister()
  })
  setTimeout(() => document.location.reload(true), 1000)
}
