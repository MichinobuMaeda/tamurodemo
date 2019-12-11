import crypto from 'crypto'
import querystring from 'querystring'
import Firebase from 'firebase'

const topUrl = () => window.location.href.replace(/\?.*/, '').replace(/#.*/, '#/')
const signInUrl = () => window.location.href.replace(/\?.*/, '').replace(/#.*/, '#/signin')
const generateRnadome = seed => crypto.createHash('sha256').update(seed).digest('base64').substr(0, 20)
const generateState = seed => generateRnadome((new Date()).toISOString() + seed)
const generateNonce = seed => generateRnadome(seed + (new Date()).toISOString())

const redirectToLineAuth = async ({ commit, state }, link = null) => {
  commit('startLoading')
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

const removeProvider = ({ state }, provider) => state.db.collection('accounts').doc(state.me.id).update({
  [provider.replace('.', '_')]: null
})

const sendEmailLink = async ({ commit, state }, { link, email }) => {
  await state.firebase.auth().sendSignInLinkToEmail(email, {
    url: window.location.href,
    handleCodeInApp: true
  })
  window.localStorage.setItem('sessionState', JSON.stringify({ link, email }))
  commit('setMessage', 'sendEmailLink')
}

export const signInWithProvider = async (context, { provider, email, password }) => {
  let { state, commit } = context
  commit('startLoading')
  if (provider === 'line.me') {
    await redirectToLineAuth(context)
  } else if (provider === 'email') {
    await sendEmailLink(context, { link: null, email })
    commit('clearLoading')
  } else if (provider === 'password') {
    await state.firebase.auth().signInWithEmailAndPassword(email, password)
    commit('clearLoading')
  } else {
    let Provider = provider
    await state.firebase.auth().signInWithRedirect(new Provider())
  }
}

export const linkProvider = async ({ state, commit }, { provider, email }) => {
  commit('startLoading')
  if (provider === 'line.me') {
    await redirectToLineAuth({ state, commit }, state.me.id)
  } else if (provider === 'email') {
    await sendEmailLink({ state, commit }, { link: state.me.id, email })
    commit('clearLoading')
  } else {
    let Provider = provider
    await state.firebase.auth().currentUser.linkWithRedirect(new Provider())
  }
}

export const unlinkProvider = async ({ state, commit }, { provider }) => {
  if (provider === 'line.me') {
    await removeProvider({ state }, provider)
  } else if (provider === 'email') {
    return null
  } else {
    await state.firebase.auth().currentUser.unlink(provider.PROVIDER_ID)
    await state.firebase.auth().currentUser.reload()
    commit('setCurrentUser')
  }
}

export const verifyInvitationUrl = async ({ state, commit }) => {
  if (window.location.href.includes('&invitation=')) {
    let token = window.location.href.replace(/.*&invitation=/, '').replace(/#\/.*/, '')
    await state.firebase.auth().signInWithCustomToken(token)
    commit('setMessage', 'oneOrMoreSignInMethod')
    window.location.href = topUrl()
  }
}

export const verifyRedirectFromLine = async ({ state, commit }) => {
  if (window.location.href.includes('?signinwith=line')) {
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
      window.location.href = topUrl()
    } else if (params.state !== sessionState.state) {
      commit('setMessage', { key: 'retryOAuth', param: { err: '11' } })
      window.location.href = signInUrl()
    } else if (params['error']) {
      commit('setMessage', { key: 'retryOAuth', param: { err: '12' } })
      window.location.href = signInUrl()
    } else if (!params['code']) {
      commit('setMessage', { key: 'retryOAuth', param: { err: '13' } })
      window.location.href = signInUrl()
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
      window.location.href = topUrl()
    }
  }
}

export const verifyEmailLink = async ({ state }) => {
  if (state.firebase.auth().isSignInWithEmailLink(window.location.href)) {
    const savedSessionState = window.localStorage.getItem('sessionState')
    const sessionState = savedSessionState ? JSON.parse(savedSessionState) : null
    if (sessionState && sessionState.email) {
      if (!sessionState.link) {
        await state.firebase.auth().signInWithEmailLink(
          sessionState.email,
          window.location.href
        )
      } else {
        const credential = Firebase.auth.EmailAuthProvider.credentialWithLink(sessionState.email, window.location.href)
        await state.firebase.auth().currentUser.linkWithCredential(credential)
      }
      window.localStorage.removeItem('sessionState')
      window.location.href = topUrl()
    } else {
      window.location.href = signInUrl()
    }
  }
}

export const signOut = ({ state }) => state.firebase.auth().signOut()

export const sendPasswordResetEmail = async ({ state, commit }, email) => {
  await state.firebase.auth().sendPasswordResetEmail(
    email,
    {
      url: state.me ? topUrl() : signInUrl(),
      handleCodeInApp: true
    }
  )
  commit('setMessage', 'sendEmailLink')
  await signOut({ state })
}
