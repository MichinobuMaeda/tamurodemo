import Firebase from 'firebase'
import 'firebase/firestore'
import conf from '../conf'

const firebase = Firebase.initializeApp(conf.firebase)
const db = firebase.firestore()

const message = window.localStorage.getItem('message') ? JSON.parse(window.localStorage.getItem('message')) : { key: 'noMessage', params: {} }

// https://stackoverflow.com/questions/11381673/detecting-a-mobile-browser
const mobilecheck = () => navigator.userAgent.match(/Android/i) ||
  navigator.userAgent.match(/webOS/i) ||
  navigator.userAgent.match(/iPhone/i) ||
  navigator.userAgent.match(/iPad/i) ||
  navigator.userAgent.match(/iPod/i) ||
  navigator.userAgent.match(/BlackBerry/i) ||
  navigator.userAgent.match(/Windows Phone/i)

export default {
  conf,
  firebase,
  db,
  loading: true,
  message,
  me: null,
  groups: [],
  accounts: [],
  users: [],
  profiles: {},
  service: {},
  unsubscribers: [],
  isMobile: mobilecheck()
}
