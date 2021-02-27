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
  console.log('redirectToLineAuth', link)
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
    try {
      console.log(window.location.href)
      // Parse GET parameters.
      var params = {}
      location.search.substr(1).split('&').forEach(item => {
        params[item.split('=')[0]] = decodeURIComponent(item.split('=')[1])
      })
      console.log('params', params)
      // Get session state.
      const sessionState = restoreOAuthData()
      console.log('sessionState', sessionState)
      // Validate parameters and session state.
      if (!sessionState) {
        window.location.href = topUrl()
      } else if (params.state !== sessionState.state) {
        storeOAuthMessage({ key: 'retryOAuth', param: { err: '11' } })
        window.location.href = signInUrl()
      } else if (params.error) {
        storeOAuthMessage({ key: 'retryOAuth', param: { err: '12' } })
        window.location.href = signInUrl()
      } else if (!params.code) {
        storeOAuthMessage({ key: 'retryOAuth', param: { err: '13' } })
        window.location.href = signInUrl()
      } else {
        const result = await functions.httpsCallable('signInWithLine')({
          code: params.code,
          ...sessionState
        })
        eraseOAuthData()
        if (result.data.token) {
          try {
            await auth.signInWithCustomToken(result.data.token)
          } catch (err) {
            alert(err)
            window.location.href = signInUrl()
          }
        }
        window.location.href = topUrl()
      }
    } catch (err) {
      alert(err)
      window.location.href = topUrl()
    }
  }
}
