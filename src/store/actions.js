import crypto from 'crypto'
import querystring from 'querystring'
import Firebase from 'firebase'
import version from '../utils/version'

const LINE_AUTH_URL = 'https://access.line.me/oauth2/v2.1/authorize'

export const signOut = ({ state }) => state.firebase.auth().signOut()

const onSignIn = async ({ commit, state }, { user }) => {
  let me = await state.db.collection('accounts').doc(user.uid).get()
  if (me && me.exists && me.data().valid) {
    commit('setMe', me)
    if (me.data().admin || me.data().manager) {
      commit('addUnsubscriber', state.db.collection('accounts').orderBy('name', 'asc').onSnapshot(querySnapshot => {
        commit('setAccounts', querySnapshot)
      }))
    }
    commit('addUnsubscriber', state.db.collection('service').doc('schema').onSnapshot(doc => {
      commit('setProperties', doc.data().properties)
      commit('setStreets', doc.data().streets)
    }))
    commit('addUnsubscriber', state.db.collection('members').onSnapshot(querySnapshot => {
      commit('setMembers', querySnapshot)
    }))
    commit('addUnsubscriber', state.db.collection('accounts').doc(me.id).onSnapshot(async doc => {
      commit('setMe', doc.exists ? doc : null)
    }))
  } else {
    state.user = null
    await signOut({ state })
  }
}

const onSignOut = async ({ commit, state }) => {
  state.unsubscribers.forEach(unsubscriber => {
    unsubscriber()
  })
  commit('resetUnsubscribers')
  commit('resetProperties')
  commit('resetStreets')
  commit('resetMembers')
  commit('resetMe')
  commit('resetAccounts')
}

export const onAuthStateChanged = async ({ state, commit }, router) => {
  state.firebase.auth().onAuthStateChanged(async user => {
    if (user) {
      if (state.firebase.auth().isSignInWithEmailLink(window.location.href)) {
        const savedSessionState = window.localStorage.getItem('sessionState')
        const sessionState = savedSessionState ? JSON.parse(savedSessionState) : null
        if (sessionState) {
          await user.linkWithCredential(
            Firebase.auth.EmailAuthProvider.credentialWithLink(
              sessionState.email,
              window.location.href
            )
          )
          window.localStorage.removeItem('sessionState')
          window.location.href = window.location.href.replace(/\?.*/, '') + '?v=' + version + '#/'
        }
      } else {
        await onSignIn({ commit, state }, { user })
        commit('resetLoading')
        router.push('/')
      }
    } else {
      if (state.me) {
        await onSignOut({ commit, state })
      }
      commit('resetLoading')
      router.push('/signin')
    }
  })
}

export const signInWithFacebook = ({ state, commit }) => {
  commit('setLoading')
  state.firebase.auth().signInWithRedirect(new Firebase.auth.FacebookAuthProvider())
}

export const signInWithTwitter = ({ state, commit }) => {
  commit('setLoading')
  state.firebase.auth().signInWithRedirect(new Firebase.auth.TwitterAuthProvider())
}

export const linkWithFacebook = ({ commit, state }) => {
  commit('setLoading')
  state.firebase.auth().currentUser.linkWithRedirect(new Firebase.auth.FacebookAuthProvider())
}

export const linkWithTwitter = ({ commit, state }) => {
  commit('setLoading')
  state.firebase.auth().currentUser.linkWithRedirect(new Firebase.auth.TwitterAuthProvider())
}

export const unlinkFacebook = async ({ commit, state }) => {
  commit('setLoading')
  await state.firebase.auth().currentUser.unlink(Firebase.auth.FacebookAuthProvider.PROVIDER_ID)
  window.location.reload()
}

export const unlinkTwitter = async ({ commit, state }) => {
  commit('setLoading')
  await state.firebase.auth().currentUser.unlink(Firebase.auth.TwitterAuthProvider.PROVIDER_ID)
  window.location.reload()
}

const topUrl = version => window.location.href.replace(/\?.*/, '') + '?v=' + version + '#/'
const signInUrl = version => window.location.href.replace(/\?.*/, '') + '?v=' + version + '#/signin'
const generateState = seed => crypto.createHash('sha256').update((new Date()).toISOString() + seed).digest('base64').substr(0, 20)
const generateNonce = seed => crypto.createHash('sha256').update(seed + (new Date()).toISOString()).digest('base64').substr(0, 20)
// const generateFakePassword = seed => crypto.createHash('sha256').update((new Date()).toISOString() + seed).digest('base64')

const redirectToLineAuth = ({ commit }, link = null) => {
  commit('setLoading')
  const request = {
    response_type: 'code',
    client_id: '1623814635',
    scope: 'profile openid',
    redirect_uri: window.location.href.replace(/\/[?#].*/, '/?signinwith=line'),
    state: generateState(LINE_AUTH_URL),
    nonce: generateNonce(LINE_AUTH_URL)
  }
  window.localStorage.setItem('sessionState', JSON.stringify({ link, ...request }))
  window.location.href = LINE_AUTH_URL + '?' + querystring.stringify(request)
}

export const signInWithLine = ({ commit }) => redirectToLineAuth({ commit })

export const linkWithLine = ({ state, commit }) => redirectToLineAuth({ commit }, state.me.id)

export const verifyRedirectFromLine = async ({ state, commit }) => {
  commit('setLoading')
  // Parse GET parameters.
  var params = {}
  location.search.substr(1).split('&').forEach(function (item) {
    params[item.split('=')[0]] = decodeURIComponent(item.split('=')[1])
  })
  // Get session state.
  let savedSsessionState = window.localStorage.getItem('sessionState')
  let sessionState = savedSsessionState ? JSON.parse(savedSsessionState) : null
  // Validate parameters and session state.
  if (!sessionState) {
    window.location.href = topUrl(version)
  } else if (params.state !== sessionState.state) {
    alert(
      'ログインをもう一度やり直してください。' + '\n' +
      '２回以上やり直してもログインできない場合は番号「 11 」をシステム管理者に伝えてください。'
    )
    window.location.href = signInUrl(version)
  } else if (params['error']) {
    alert(
      'ログインをもう一度やり直してください。' + '\n' +
      '２回以上やり直してもログインできない場合は番号「 12 」をシステム管理者に伝えてください。'
    )
    window.location.href = signInUrl(version)
  } else if (!params['code']) {
    alert(
      'ログインをもう一度やり直してください。' + '\n' +
      '２回以上やり直してもログインできない場合は番号「 13 」をシステム管理者に伝えてください。'
    )
    window.location.href = signInUrl(version)
  } else {
    let result = await state.firebase.functions().httpsCallable('signInWithLine')({
      code: params.code,
      ...sessionState
    })
    window.localStorage.removeItem('sessionState')
    if (!result.data.token) {
      window.location.href = topUrl(version)
    } else {
      try {
        await state.firebase.auth().signInWithCustomToken(result.data.token)
      } catch (err) { alert(err) }
    }
  }
}

export const unlinkLine = ({ commit, state }) => {
  commit('setLoading')
  return state.db.collection('accounts').doc(state.me.id).update({
    lineUid: null
  })
}

const sendEmailLink = async (state, { link, email }) => {
  await state.firebase.auth().sendSignInLinkToEmail(email, {
    url: window.location.href,
    handleCodeInApp: true
  })
  window.localStorage.setItem('sessionState', JSON.stringify({ link, email }))
  alert('入力したメールアドレス宛にご案内を送信しました。このページは閉じてください。')
}

export const signInWithEmailLink = async ({ state }, email) => sendEmailLink(state, { link: null, email })

export const linkWithEmail = async ({ state }, email) => sendEmailLink(state, { link: state.me.id, email })

const onServiceUpdated = ({ commit, state }, querySnapshot) => {
  commit('setService', querySnapshot)
  if (state.service.status.version > version) {
    window.location.href = topUrl(serviceStatus.version)
  }
}

export const onServiceChanged = async ({ commit, state }) => {
  onServiceUpdated({ commit, state }, await state.db.collection('service').get())
  state.db.collection('service').onSnapshot(querySnapshot => {
    onServiceUpdated({ commit, state }, querySnapshot)
  })
}

export const releaseUiSoftware = ({ state }) => state.db.collection('service').doc('status').update({ version })
