// import axios from 'axios'
import firebase from '../plugins/firebase'
import * as utils from './utils'
import version from './version'

const { db } = firebase

// 保持データ
export const serviceState = {
  service: {},
  version
}

const docsForAdmin = [
  'ftp'
]

// status 以外の保持データをクリアする。
export const clearService = state => {
  docsForAdmin.forEach(doc => {
    state.service = { ...state.service, [doc]: {} }
  })
}

// status 以外の保持データを設定する。
export const initService = async state => {
  if (state.me && state.me.valid && state.me.admin) {
    docsForAdmin.forEach(doc => {
      state.unsubscribers.accounts = db.collection('service').doc(doc)
        .onSnapshot(async doc => {
          const { id, ...data } = utils.simplifyDoc(doc)
          state.service = { ...state.service, [id]: data }
        })
    })
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

// 保持データを設定する。
export const initCommonService = async state => {
  const { id, ...data } = utils.simplifyDoc(
    await db.collection('service').doc('status').get()
  )
  state.service[id] = data
  db.collection('service').doc('status')
    .onSnapshot(async doc => {
      const { id, ...data } = utils.simplifyDoc(doc)
      state.service = { ...state.service, [id]: data }
    })
}
