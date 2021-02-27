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

const redirectToLineAuth = async ({ db }, link = null) => {
  console.log('redirectToLineAuth', link)
  const params = (await db.collection('service').doc('auth').get()).data()
  const request = {
    response_type: 'code',
    client_id: params.line_me_client_id,
    scope: params.line_me_scope,
    redirect_uri: window.location.href.replace(/\/[?#].*/, '/?signinwith=line_me'),
    state: generateState(params.line_me_auth_url),
    nonce: generateNonce(params.line_me_auth_url)
  }
  storeOAuthData({ link, ...request })
  window.location.href = params.line_me_auth_url + '?' + querystring.stringify(request)
}

export const link = ({ db }, link) => redirectToLineAuth({ db }, link)
export const sighIn = ({ db }) => redirectToLineAuth({ db })

export const verifyRedirectFromLineMe = async ({ functions, auth }) => {
  if (window.location.href.includes('?signinwith=line')) {
    try {
      // Parse GET parameters.
      var params = {}
      location.search.substr(1).split('&').forEach(item => {
        params[item.split('=')[0]] = decodeURIComponent(item.split('=')[1])
      })
      // Get session state.
      const sessionState = restoreOAuthData()
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
