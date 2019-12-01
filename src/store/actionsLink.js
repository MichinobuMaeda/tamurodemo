import Firebase from 'firebase'

const topUrl = version => window.location.href.replace(/\?.*/, '').replace(/#.*/, '') + '?v=' + version + '#/'
const signInUrl = version => window.location.href.replace(/\?.*/, '').replace(/#.*/, '') + '?v=' + version + '#/signin'

export const verifyInvitationUrl = async ({ state, commit }) => {
  if (window.location.href.includes('&invitation=')) {
    let token = window.location.href.replace(/.*&invitation=/, '').replace(/#\/.*/, '')
    await state.firebase.auth().signInWithCustomToken(token)
    commit('setMessage', 'oneOrMoreSignInMethod')
    window.location.href = topUrl(state.conf.version)
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
        await state.currentUser.linkWithCredential(credential)
      }
      window.localStorage.removeItem('sessionState')
      window.location.href = topUrl(state.conf.version)
    } else {
      window.location.href = signInUrl(state.conf.version)
    }
  }
}
