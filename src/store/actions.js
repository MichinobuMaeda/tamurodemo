import crypto from 'crypto'
import querystring from 'querystring'
import Firebase from 'firebase'

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
    commit('addUnsubscriber', state.db.collection('groups').orderBy('name', 'asc').onSnapshot(querySnapshot => {
      commit('setGroups', querySnapshot)
    }))
    commit('addUnsubscriber', state.db.collection('users').orderBy('name', 'asc').onSnapshot(querySnapshot => {
      commit('setUsers', querySnapshot)
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
  commit('resetAccounts')
  commit('resetUsers')
  commit('resetGroups')
  commit('resetMe')
}

const signInWith = ({ state, commit }, provider) => {
  commit('setLoading')
  state.firebase.auth().signInWithRedirect(provider)
}

const linkWithRedirect = ({ state, commit }, provider) => {
  commit('setLoading')
  state.firebase.auth().currentUser.linkWithRedirect(provider)
}

const unlinkProvider = async ({ commit, state }, providerID) => {
  commit('setLoading')
  await state.firebase.auth().currentUser.unlink(providerID)
  window.location.reload()
}

export const signInWithFacebook = context => signInWith(context, new Firebase.auth.FacebookAuthProvider())
export const signInWithTwitter = context => signInWith(context, new Firebase.auth.TwitterAuthProvider())

export const linkWithFacebook = context => linkWithRedirect(context, new Firebase.auth.FacebookAuthProvider())
export const linkWithTwitter = context => linkWithRedirect(context, new Firebase.auth.TwitterAuthProvider())

export const unlinkFacebook = context => unlinkProvider(context, Firebase.auth.FacebookAuthProvider.PROVIDER_ID)
export const unlinkTwitter = context => unlinkProvider(context, Firebase.auth.TwitterAuthProvider.PROVIDER_ID)

const topUrl = version => window.location.href.replace(/\?.*/, '') + '?v=' + version + '#/'
const signInUrl = version => window.location.href.replace(/\?.*/, '') + '?v=' + version + '#/signin'
const generateState = seed => crypto.createHash('sha256').update((new Date()).toISOString() + seed).digest('base64').substr(0, 20)
const generateNonce = seed => crypto.createHash('sha256').update(seed + (new Date()).toISOString()).digest('base64').substr(0, 20)
// const generateFakePassword = seed => crypto.createHash('sha256').update((new Date()).toISOString() + seed).digest('base64')

const redirectToLineAuth = async ({ commit, state }, link = null) => {
  commit('setLoading')
  const ids = await state.firebase.functions().httpsCallable('getAuthIds')()
  const request = {
    response_type: 'code',
    client_id: ids.line.client_id,
    scope: ids.line.scope,
    redirect_uri: window.location.href.replace(/\/[?#].*/, '/?signinwith=line'),
    state: generateState(ids.line.auth_url),
    nonce: generateNonce(ids.line.auth_url)
  }
  window.localStorage.setItem('sessionState', JSON.stringify({ link, ...request }))
  window.location.href = ids.line.auth_url + '?' + querystring.stringify(request)
}

export const signInWithLine = ({ state, commit }) => redirectToLineAuth({ state, commit })

export const linkWithLine = ({ state, commit }) => redirectToLineAuth({ state, commit }, state.me.id)

const verifyRedirectFromLine = async ({ state, commit }) => {
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
    window.location.href = topUrl(state.conf.version)
  } else if (params.state !== sessionState.state) {
    alert(
      'ログインをもう一度やり直してください。' + '\n' +
      '２回以上やり直してもログインできない場合は番号「 11 」をシステム管理者に伝えてください。'
    )
    window.location.href = signInUrl(state.conf.version)
  } else if (params['error']) {
    alert(
      'ログインをもう一度やり直してください。' + '\n' +
      '２回以上やり直してもログインできない場合は番号「 12 」をシステム管理者に伝えてください。'
    )
    window.location.href = signInUrl(state.conf.version)
  } else if (!params['code']) {
    alert(
      'ログインをもう一度やり直してください。' + '\n' +
      '２回以上やり直してもログインできない場合は番号「 13 」をシステム管理者に伝えてください。'
    )
    window.location.href = signInUrl(state.conf.version)
  } else {
    let result = await state.firebase.functions().httpsCallable('signInWithLine')({
      code: params.code,
      ...sessionState
    })
    window.localStorage.removeItem('sessionState')
    if (!result.data.token) {
      window.location.href = topUrl(state.conf.version)
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

// Release new version of UI.
export const releaseUiSoftware = ({ state }) => state.db.collection('service').doc('status').update({ version: state.conf.version })

// On app created
export const onAppCreated = async ({ commit, state }, router) => {
  // Set defaults.
  state.firebase.auth().languageCode = 'ja'

  // Evaluate HTTP request path.
  if (state.firebase.auth().isSignInWithEmailLink(window.location.href)) {
    const savedSessionState = window.localStorage.getItem('sessionState')
    const sessionState = savedSessionState ? JSON.parse(savedSessionState) : null
    if (sessionState && sessionState.email) {
      if (!sessionState.link) {
        await state.firebase.auth().signInWithEmailLink(
          sessionState.email,
          window.location.href
        )
        window.localStorage.removeItem('sessionState')
        window.location.href = window.location.href.replace(/\?.*/, '') + '?v=' + state.conf.version + '#/'
      }
    } else {
      window.location.href = window.location.href.replace(/\?.*/, '') + '?v=' + state.conf.version + '#/signin'
    }
  } else if (window.location.href.includes('?signinwith=line')) {
    await verifyRedirectFromLine({ state, commit })
  } else if (window.location.href.includes('&invitation=')) {
    let token = window.location.href.replace(/.*&invitation=/, '').replace(/#\/.*/, '')
    await state.firebase.auth().signInWithCustomToken(token)
    window.location.href = window.location.href.replace(/&invitation=.*/, '')
  }

  // On service status changed
  const onServiceStatusChanged = ({ commit, state }, doc) => {
    commit('setService', doc)
    if (state.service.status.version > state.conf.version) {
      window.location.href = topUrl(state.service.status.version)
    }
  }
  onServiceStatusChanged({ commit, state }, await state.db.collection('service').doc('status').get())
  state.db.collection('service').doc('status').onSnapshot(doc => {
    onServiceStatusChanged({ commit, state }, doc)
  })

  // On auth status changed
  state.firebase.auth().onAuthStateChanged(async user => {
    if (user) {
      await onSignIn({ commit, state }, { user })
      commit('resetLoading')
      router.push('/').catch(() => {})
    } else {
      if (state.me) {
        await onSignOut({ commit, state })
      }
      commit('resetLoading')
      router.push('/signin').catch(() => {})
    }
  })
}
