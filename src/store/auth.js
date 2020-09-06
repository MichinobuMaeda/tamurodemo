import firebase from 'boot/firebase'
import { clearStore, initStore } from './index'
import * as utils from './utils'

const { auth, db } = firebase
const topUrl = () => window.location.href.replace(/\?.*/, '').replace(/#.*/, '#/')
const signInUrl = () => window.location.href.replace(/\?.*/, '').replace(/#.*/, '#/signin')

// 保持データ
export const authState = {
  // ログインユーザ
  me: {},
  // 認証情報
  credential: {},
  // 切断対象の Firestore リアルタイム更新セッション
  unsubscribers: {},
  // ログアウトを確認する。
  confirmLogout: false,
  // ステータスメッセージ
  authMessage: ''
}

// 保持データをクリアする。
export const clearAuth = state => {
  state.me = {}
  state.credential = {}
  state.unsubscribers = {}
  state.confirmLogout = false
  state.authMessage = ''
}

// ログアウトする。
export const logout = () => auth.signOut()

// 保持データを設定する。
export const initAuth = async state => {
  if (state.me && state.me.id) {
    state.unsubscribers.me = db.collection('accounts').doc(state.me.id).onSnapshot(async doc => {
      if (doc && doc.exists && doc.data().valid) {
        state.me = utils.simplifyDoc(doc)
      } else {
        // 無効なユーザになった場合、ログアウトする。
        await logout()
      }
    })
  }
}

// E-mail アドレスの入力値をチェックする。
export const validateEmail = str => (!str) || /^(\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+|none)$/.test(str)

// パスワードの入力値をチェックする。
export const validatePassword = str => (!str) || (str.length >= 8)

// ログイン時の処理。
const onLogin = async (state, me) => {
  state.authMessage = ''
  window.localStorage.setItem('spacemoniAuthMessage', '')
  // リアルタイム更新のデータを受信するまでアカウント情報を保持する。
  state.me = utils.simplifyDoc(me)
  // ストアを初期化する。
  await initStore(state)
}

// ログアウト時の処理。
const onLogout = (state) => {
  // ストアをクリアする。
  clearStore(state)
}

// ユーザ認証の状態を確認する。
export const checkAuthStatus = async (state) => {
  auth.onAuthStateChanged(async user => {
    // E-mail リンクでログインの URL の場合、
    if (auth.isSignInWithEmailLink(window.location.href)) {
      const email = window.localStorage.getItem('spacemoniEmailLinkRequest')
      window.localStorage.setItem('spacemoniEmailLinkRequest', '')
      window.localStorage.setItem('spacemoniAuthMessage', '')
      if (email) {
        // リンクを要求した E-mail アドレスが保存されている場合、
        // E-mail リンクによるでログインを要求する。
        await auth.signInWithEmailLink(
          email,
          window.location.href
        )
      }
      window.location.href = topUrl()
    } else if (user) {
      // 認証済みの場合、
      // ログインユーザの情報を取得する。
      const me = await db.collection('accounts').doc(user.uid).get()
      if (me && me.exists && me.data().valid) {
        // 正当なユーザの場合、ログインする。
        await onLogin(state, me)
      } else {
        // 無効なユーザの場合、ログアウトする。
        await logout()
        window.location.href = signInUrl()
      }
    } else {
      // 認証されていない場合、ログアウト時の処理をする。
      onLogout(state)
    }
    setTimeout(() => { state.loading = false }, 500)
  })
}

// E-mail リンクでログインする。
export const signInWithEmailLink = async state => {
  await auth.sendSignInLinkToEmail(state.credential.email, {
    url: window.location.href,
    handleCodeInApp: true
  })
  window.localStorage.setItem('spacemoniEmailLinkRequest', state.credential.email)
  state.authMessage = '入力したメールアドレス宛にご案内を送信しました。このページは閉じてください。'
}

// パスワードでログインする。
export const signInWithPassword = async state => {
  try {
    await auth.signInWithEmailAndPassword(
      state.credential.email,
      state.credential.password
    )
  } catch (e) {
    state.authMessage = 'メールアドレスかパスワードが間違っています。'
  }
}

// パスワードリセットする。
export const resetPassword = state => async () => {
  await auth.sendPasswordResetEmail(
    state.me.id ? state.me.email : state.credential.email,
    {
      url: topUrl(),
      handleCodeInApp: true
    }
  )
  state.authMessage = '入力したメールアドレス宛にご案内を送信しました。このページは閉じてください。'
  window.localStorage.setItem('spacemoniAuthMessage', '')
}

// アクセス権制御
export const guard = (me, route, router) => {
  if (!route.name) {
    // nothing to do
  } else if (me && me.valid) {
    if (route.name === 'signin') {
      const pageSaved = window.localStorage.getItem('spacemoniPage')
      window.localStorage.setItem('spacemoniPage', '')
      const page = pageSaved ? JSON.parse(pageSaved) : { name: 'top' }
      router.push(page).catch(() => {})
    } else if (!(me.admin || me.tester)) {
      if (['raw'].includes(route.name)) {
        const next = { name: 'top' }
        window.localStorage.setItem('spacemoniPage', JSON.stringify(next))
        router.push(next).catch(() => {})
      }
    } else if (!me.admin) {
      if (['brands', 'spaces', 'accounts', 'devices'].includes(route.name)) {
        const next = { name: 'top' }
        window.localStorage.setItem('spacemoniPage', JSON.stringify(next))
        router.push(next).catch(() => {})
      }
    }
  } else {
    if (route.name !== 'signin') {
      router.push({ name: 'signin' }).catch(() => {})
    }
  }
}

export const isAdmin = state => state.me && state.me.valid && state.me.admin
