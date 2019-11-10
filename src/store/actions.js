import crypto from 'crypto'
import querystring from 'querystring'
import Firebase from 'firebase'

const topUrl = version => window.location.href.replace(/\?.*/, '') + '?v=' + version + '#/'
const signInUrl = version => window.location.href.replace(/\?.*/, '') + '?v=' + version + '#/signin'
const generateState = seed => crypto.createHash('sha256').update((new Date()).toISOString() + seed).digest('base64').substr(0, 20)
const generateNonce = seed => crypto.createHash('sha256').update(seed + (new Date()).toISOString()).digest('base64').substr(0, 20)
// const generateFakePassword = seed => crypto.createHash('sha256').update((new Date()).toISOString() + seed).digest('base64')

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

export const signInWithTwitter = context => signInWith(context, new Firebase.auth.TwitterAuthProvider())
export const linkWithTwitter = context => linkWithRedirect(context, new Firebase.auth.TwitterAuthProvider())
export const unlinkFacebook = context => unlinkProvider(context, Firebase.auth.FacebookAuthProvider.PROVIDER_ID)

export const signInWithGithub = context => signInWith(context, new Firebase.auth.GithubAuthProvider())
export const linkWithGithub = context => linkWithRedirect(context, new Firebase.auth.GithubAuthProvider())
export const unlinkGithub = context => unlinkProvider(context, Firebase.auth.GithubAuthProvider.PROVIDER_ID)

export const signInWithGoogle = context => signInWith(context, new Firebase.auth.GoogleAuthProvider())
export const linkWithGoogle = context => linkWithRedirect(context, new Firebase.auth.GoogleAuthProvider())
export const unlinkGoogle = context => unlinkProvider(context, Firebase.auth.GoogleAuthProvider.PROVIDER_ID)

export const signInWithFacebook = context => signInWith(context, new Firebase.auth.FacebookAuthProvider())
export const linkWithFacebook = context => linkWithRedirect(context, new Firebase.auth.FacebookAuthProvider())
export const unlinkTwitter = context => unlinkProvider(context, Firebase.auth.TwitterAuthProvider.PROVIDER_ID)

const redirectToLineAuth = async ({ commit, state }, link = null) => {
  commit('setLoading')
  const result = await state.firebase.functions().httpsCallable('getAuthIds')()
  const request = {
    response_type: 'code',
    client_id: result.data.line.client_id,
    scope: result.data.line.scope,
    redirect_uri: window.location.href.replace(/\/[?#].*/, '/?signinwith=line'),
    state: generateState(result.data.line.auth_url),
    nonce: generateNonce(result.data.line.auth_url)
  }
  window.localStorage.setItem('sessionState', JSON.stringify({ link, ...request }))
  window.location.href = result.data.line.auth_url + '?' + querystring.stringify(request)
}

export const signInWithLine = ({ state, commit }) => redirectToLineAuth({ state, commit })
export const linkWithLine = ({ state, commit }) => redirectToLineAuth({ state, commit }, state.me.id)
export const unlinkLine = ({ commit, state }) => {
  commit('setLoading')
  return state.db.collection('accounts').doc(state.me.id).update({
    lineUid: null
  })
}

const sendEmailLink = async ({ commit, state }, { link, email }) => {
  await state.firebase.auth().sendSignInLinkToEmail(email, {
    url: window.location.href,
    handleCodeInApp: true
  })
  window.localStorage.setItem('sessionState', JSON.stringify({ link, email }))
  commit('setMessage', 'sendEmailLink')
}

export const signInWithEmailLink = async (context, email) => sendEmailLink(context, { link: null, email })
export const linkWithEmail = async (context, email) => sendEmailLink(context, { link: context.state.me.id, email })

export const signOut = ({ state }) => state.firebase.auth().signOut()

export const releaseUiNewVersion = ({ state }) => state.db.collection('service').doc('status').update({ version: state.conf.version })

const verifyInvitationUrl = async ({ state, commit }) => {
  let token = window.location.href.replace(/.*&invitation=/, '').replace(/#\/.*/, '')
  await state.firebase.auth().signInWithCustomToken(token)
  commit('setMessage', 'oneOrMoreSignInMethod')
  window.location.href = topUrl(state.conf.version)
}

const verifyEmailLink = async ({ state }) => {
  const savedSessionState = window.localStorage.getItem('sessionState')
  const sessionState = savedSessionState ? JSON.parse(savedSessionState) : null
  if (sessionState && sessionState.email) {
    if (!sessionState.link) {
      await state.firebase.auth().signInWithEmailLink(
        sessionState.email,
        window.location.href
      )
      window.localStorage.removeItem('sessionState')
      window.location.href = topUrl(state.conf.version)
    }
  } else {
    window.location.href = signInUrl(state.conf.version)
  }
}

const verifyRedirectFromLine = async ({ state, commit }) => {
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
    commit('setMessage', { key: 'retryOAuth', param: { err: '11' } })
    window.location.href = signInUrl(state.conf.version)
  } else if (params['error']) {
    commit('setMessage', { key: 'retryOAuth', param: { err: '12' } })
    window.location.href = signInUrl(state.conf.version)
  } else if (!params['code']) {
    commit('setMessage', { key: 'retryOAuth', param: { err: '13' } })
    window.location.href = signInUrl(state.conf.version)
  } else {
    let result = await state.firebase.functions().httpsCallable('signInWithLine')({
      code: params.code,
      ...sessionState
    })
    window.localStorage.removeItem('sessionState')
    if (result.data.token) {
      try {
        await state.firebase.auth().signInWithCustomToken(result.data.token)
      } catch (err) { alert(err) }
    }
    window.location.href = topUrl(state.conf.version)
  }
}

const onSignIn = async ({ commit, state }, { user }) => {
  let me = await state.db.collection('accounts').doc(user.uid).get()
  if (me && me.exists && me.data().valid) {
    commit('resetMessage')
    commit('setMe', me)
    let admin = await state.db.collection('groups').doc('admin').get()
    if (admin.data().members.includes(me.id)) {
      commit('addUnsubscriber', state.db.collection('accounts').onSnapshot(querySnapshot => {
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
  commit('resetMessage')
}

// On app created
export const onAppCreated = async ({ commit, state }, router) => {
  // Set defaults.
  state.firebase.auth().languageCode = 'ja'

  // Evaluate HTTP request path.
  if (state.firebase.auth().isSignInWithEmailLink(window.location.href)) {
    await verifyEmailLink({ state, commit })
  } else if (window.location.href.includes('?signinwith=line')) {
    await verifyRedirectFromLine({ state, commit })
  } else if (window.location.href.includes('&invitation=')) {
    await verifyInvitationUrl({ state, commit })
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
    commit('setLoading')
    if (user) {
      await onSignIn({ commit, state }, { user })
    } else if (state.me) {
      await onSignOut({ commit, state })
    }
    commit('resetLoading')
    router.push(user ? '/' : '/signin').catch(() => {})
  })
}
