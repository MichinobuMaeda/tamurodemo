/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

export const initGoogleApi = () => {
  const scripts = document.getElementsByTagName('script')
  let api = document.createElement('script')
  api.src = '//apis.google.com/js/client:platform.js'
  scripts[0].parentNode.insertBefore(api, scripts[0])
  api.onload = () => {
    window.gapi.load('auth2', () => {
      window.gapi.auth2.init({
        client_id: "1098406676005-l2v5e161qkcmcphhd6dc2o09cv4r2fhe.apps.googleusercontent.com",
      })
    })
  }
}

export const signInWithGoogle = (dispatch, onSuccess, onFailure) => async () => {
  try {
    const auth2 = window.gapi.auth2.getAuthInstance()
    let res = await auth2.signIn({})
    dispatch(onSuccess(res))
  } catch (e) {
    dispatch(onFailure())
  }
}
