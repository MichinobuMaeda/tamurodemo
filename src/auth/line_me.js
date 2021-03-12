import querystring from 'querystring'
import {
  topUrl,
  signInUrl,
  generateState,
  generateNonce
} from './utils'
import {
  storeOAuthData,
  restoreOAuthData,
  eraseOAuthData,
  storeOAuthMessage
} from './localStrage'

const redirectToLineAuth = async ({ state }, link = null) => {
  const request = {
    response_type: 'code',
    client_id: state.service.auth.line_me_client_id,
    scope: state.service.auth.line_me_scope,
    redirect_uri: state.service.auth.line_me_redirect_uri,
    state: generateState(state.service.auth.line_me_auth_url),
    nonce: generateNonce(state.service.auth.line_me_auth_url)
  }
  storeOAuthData({ link, ...request })
  window.location.href = state.service.auth.line_me_auth_url + '?' + querystring.stringify(request)
}

export const link = (store, link) => redirectToLineAuth(store, link)
export const sighIn = (store) => redirectToLineAuth(store)

export const verifyRedirectFromLineMe = async ({ functions, auth, state }) => {
  if (window.location.href.includes(state.service.auth.line_me_redirect_uri)) {
    // Get session state.
    const sessionState = restoreOAuthData()
    try {
      // Parse GET parameters.
      var params = {}
      location.search.substr(1).split('&').forEach(item => {
        params[item.split('=')[0]] = decodeURIComponent(item.split('=')[1])
      })
      // Validate parameters and session state.
      if (!sessionState) {
        window.location.href = topUrl()
        storeOAuthMessage({ key: 'OAuth Error', param: { err: '10' } })
      } else if (params.state !== sessionState.state) {
        storeOAuthMessage({ key: 'OAuth Error', param: { err: '11' } })
        window.location.href = signInUrl()
      } else if (params.error) {
        storeOAuthMessage({ key: 'OAuth Error', param: { err: '12' } })
        window.location.href = signInUrl()
      } else if (!params.code) {
        storeOAuthMessage({ key: 'OAuth Error', param: { err: '13' } })
        window.location.href = signInUrl()
      } else {
        const result = await functions.httpsCallable('signInWithLineMe')({
          code: params.code,
          ...sessionState
        })
        eraseOAuthData()
        if (result.data.token) {
          try {
            await auth.signInWithCustomToken(result.data.token)
          } catch (err) {
            storeOAuthMessage({ key: 'OAuth Error', param: { err: '14' } })
            window.location.href = signInUrl()
          }
        }
        window.location.href = topUrl()
      }
    } catch (err) {
      storeOAuthMessage({ key: 'OAuth Error', param: { err: '15' } })
      window.location.href = sessionState.link ? topUrl() : signInUrl()
    }
  }
}
