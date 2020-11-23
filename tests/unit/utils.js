import fs from 'fs'
import path from 'path'
import * as Firebase from '@firebase/rules-unit-testing'
import '../../src/plugins/composition-api'
import { initialData } from '../../functions/initialData'
import { updateService } from '../../functions/service'
import { createStore } from '../../src/store/init'

const projectId = 'tamuro-test01'
const apiKey = 'test-api-key'
const primary = 'primary'
const uid = 'account01'
const email = 'account01@example.com'

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

process.env.BASE_URL = '/'

const currentUser = {
  data: {},
  uid,
  email,
  clear () {
    this.data = {}
  },
  reauthenticateWithCredential (cred) {
    return Promise.resolve(true)
      .then(() => {
        this.data.reauthenticateWithCredential = {
          cred
        }
      })
  },
  updateEmail (email) {
    return Promise.resolve(true)
      .then(() => {
        this.email = email
      })
  },
  updatePassword (password) {
    return Promise.resolve(true)
      .then(() => {
        this.data.password = password
      })
  },
  linkWithRedirect (provider) {
    return Promise.resolve(true)
      .then(() => {
        this.data.linkWithRedirect = {
          provider
        }
      })
  },
  unlink (id) {
    return Promise.resolve(true)
      .then(() => {
        this.data.unlink = {
          id
        }
      })
  }
}

export const auth = {
  data: {},
  currentUser,
  clear () {
    this.data = {}
    this.currentUser.clear()
  },
  sendPasswordResetEmail (email, options) {
    return Promise.resolve(true)
      .then(() => {
        this.data.sendPasswordResetEmail = {
          email,
          options
        }
      })
  },
  sendSignInLinkToEmail (email, options) {
    return Promise.resolve(true)
      .then(() => {
        this.data.sendSignInLinkToEmail = {
          email,
          options
        }
      })
  },
  signInWithEmailLink (email, url) {
    return Promise.resolve(true)
      .then(() => {
        this.data.signInWithEmailLink = {
          email,
          url
        }
      })
  },
  signInWithEmailAndPassword (email, password) {
    return Promise.resolve(true)
      .then(() => {
        this.data.signInWithEmailAndPassword = {
          email,
          password
        }
      })
  },
  signInWithCustomToken (token) {
    return Promise.resolve(true)
      .then(() => {
        if (!token) {
          throw new Error('Invalid token')
        }
        this.data.signInWithCustomToken = {
          token
        }
      })
  },
  signInWithRedirect (provider) {
    return Promise.resolve(true)
      .then(() => {
        this.data.signInWithRedirect = {
          provider
        }
      })
  }
}

const messaging = {
  error: false,
  data: {},
  clear () {
    this.error = false
    this.data = {}
  },
  sendMulticast (message) {
    this.data.message = message
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
    }
  }
}

export const store = createStore(firebase, root)

export const testData = async () => {
  const db = admin.firestore()

  await updateService({ db }, initialData)
  await db.collection('service').doc('conf').update({
    apiKey,
    invitationExpirationTime: 60 * 1000,
    hosting: 'http://localhost:5000'
  })
  await db.collection('accounts').doc(primary).set({ valid: true })
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
