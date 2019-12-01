import crypto from 'crypto'
import querystring from 'querystring'

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

export const signInWithProvider = async (context, { provider, email }) => {
  let { state, commit } = context
  commit('startLoading')
  if (provider === 'line.me') {
    await redirectToLineAuth(context)
  } else if (provider === 'email') {
    await sendEmailLink(context, { link: null, email })
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

export const signOut = ({ state }) => state.firebase.auth().signOut()
