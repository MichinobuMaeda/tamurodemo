import fs from 'fs'
import path from 'path'
import * as Firebase from '@firebase/rules-unit-testing'
import '../../src/plugins/composition-api'
import { initialData } from '../../functions/initialData'
import { updateService } from '../../functions/service'
import { createStore } from '../../src/store/init'

const projectId = 'tamuro02'
const apiKey = 'test-api-key'
const primary = 'primary'
const uid = 'account01'
const email = 'account01@example.com'
const logger = console

Firebase.loadFirestoreRules({
  projectId,
  rules: fs.readFileSync(path.join(__dirname, '..', '..', 'firestore.rules'), 'utf8')
})

const app = Firebase.initializeTestApp({ projectId, auth: { uid, email } })
export const admin = Firebase.initializeAdminApp({ projectId })

export const clearDb = () => Firebase.clearFirestoreData({ projectId })

export const deleteApp = () => Promise.all(Firebase.apps().map(app => app.delete()))

export const functions = {
  inputs: {},
  results: {},
  clear () {
    this.inputs = {}
    this.results = {}
  },
  httpsCallable (name) {
    return data => {
      this.inputs[name] = data
      return Promise.resolve(this.results[name])
    }
  }
}

export const setFakeWindow = () => {
  const localStorage = {
    data: {},
    clear () {
      this.data = {}
    },
    setItem (key, val) {
      this.data[key] = val
    },
    getItem (key) {
      return this.data[key]
    }
  }

  global.window = {
    clear () {
      this.localStorage.clear()
    },
    location: {
      protocol: 'http:',
      hostname: 'localhost',
      port: '5000',
      href: 'http://localhost:5000/#/path1'
    },
    localStorage
  }
}

global.navigator = {
  msMaxTouchPoints: 0
}

process.env.BASE_URL = '/'

const currentUser = {
  data: {},
  uid,
  email,
  clear () {
    this.data = {}
  },
  async reauthenticateWithCredential (cred) {
    await Promise.resolve(true)
    this.data.reauthenticateWithCredential = {
      cred
    }
  },
  async updateEmail (email) {
    await Promise.resolve(true)
    this.email = email
  },
  async updatePassword (password) {
    await Promise.resolve(true)
    this.data.password = password
  },
  async linkWithRedirect (provider) {
    await Promise.resolve(true)
    this.data.linkWithRedirect = {
      provider
    }
  },
  async unlink (id) {
    await Promise.resolve(true)
    this.data.unlink = {
      id
    }
  }
}

export const auth = {
  data: {},
  currentUser,
  languageCode: null,
  clear () {
    this.data = {
      isSignInWithEmailLink: false
    }
    this.currentUser.clear()
  },
  async sendPasswordResetEmail (email, options) {
    await Promise.resolve(true)
    this.data.sendPasswordResetEmail = {
      email,
      options
    }
  },
  async sendSignInLinkToEmail (email, options) {
    await Promise.resolve(true)
    this.data.sendSignInLinkToEmail = {
      email,
      options
    }
  },
  async signInWithEmailLink (email, url) {
    await Promise.resolve(true)
    this.data.signInWithEmailLink = {
      email,
      url
    }
  },
  async signInWithEmailAndPassword (email, password) {
    await Promise.resolve(true)
    this.data.signInWithEmailAndPassword = {
      email,
      password
    }
  },
  async signInWithCustomToken (token) {
    await Promise.resolve(true)
    if (!token) {
      throw new Error('Invalid token')
    }
    this.data.signInWithCustomToken = {
      token
    }
  },
  async signInWithRedirect (provider) {
    await Promise.resolve(true)
    this.data.signInWithRedirect = {
      provider
    }
  },
  async signOut () {
    await Promise.resolve(true)
    this.data.signOut = {
      called: true
    }
  },
  isSignInWithEmailLink () {
    return this.data.isSignInWithEmailLink
  },
  onAuthStateChanged (cb) {
    this.data.onAuthStateChanged = cb
  }
}

const messaging = {
  error: false,
  data: {
    token: 'generated token 1'
  },
  clear () {
    this.error = false
    this.data = {}
  },
  sendMulticast (message) {
    this.data.message = message
  },
  getToken (keys) {
    this.data.getToken = keys
    return this.data.token
  },
  onMessage (cb) {
    this.data.onMessage = cb
  }
}

export const router = {
  data: {},
  clear () {
    this.data = {}
  },
  onRejected () {
    this.data.pushCatched()
  },
  push (route) {
    this.data.push = route
    return {
      catch: func => {
        this.data.pushCatched = func
      }
    }
  }
}

export const firebase = {
  auth,
  db: app.firestore(),
  functions,
  messaging,
  webPushCertificateKey: 'BPZ_fdPSU__DSq7IDD5cK6DlPUd4iEqQfuMEfXb7cHZnNsTzOTRFW5EW9lnd6Dnso1-0fulRxXsaPWcJhL0n0_4',
  FieldValue: Firebase.firestore.FieldValue
}

export const root = {
  $i18n: {
    called: {},
    t (key) {
      this.called[key] = this.called[key] || 0
      ++this.called[key]
      return key
    },
    locale: null
  },
  $vuetify: {
    theme: {
      dark: null
    }
  }
}

export const store = createStore(firebase, root)

export const testData = async () => {
  const db = admin.firestore()

  await updateService({ db, logger }, initialData)
  await db.collection('service').doc('conf').update({
    apiKey,
    invitationExpirationTime: 60 * 1000,
    hosting: 'http://localhost:5000'
  })
  await db.collection('accounts').doc(primary).set({ valid: true })
  await db.collection('users').doc(primary).set({ name: 'Primary user' })
  await db.collection('profiles').doc(primary).set({ test: 'test' })
  await db.collection('groups').doc('all').update({
    members: [primary]
  })
  await db.collection('groups').doc('admins').update({
    members: [primary]
  })
  await db.collection('groups').doc('managers').update({
    members: [primary]
  })
}

export const waitRealtimeUpdate = tm => new Promise(resolve => setTimeout(resolve, tm || 500))
