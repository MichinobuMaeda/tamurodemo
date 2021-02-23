import { baseUrl } from '../conf'

export const invite = async ({ functions, state }, id) => functions.httpsCallable('invite')({ id })
//   const result = await functions.httpsCallable('invite')({ id })
//   state.invitations[id] = result.data.invitation
// }

const urlOfRoute = (router, route) => baseUrl() + '#' + router.resolve(route).resolved.path

export const invitationUrl = (state, router, id) =>
  urlOfRoute(
    router,
    {
      name: 'invitation',
      params: { invitation: (state.accounts.find(account => account.id === id) || {}).invitation }
    }
  )

export const validateInvitation = async ({ functions, auth }, invitation) => {
  try {
    const result = await functions.httpsCallable('validateInvitation')({ invitation })
    await auth.signInWithCustomToken(result.data.token)
  } catch (e) {
    return { status: 'error' }
  }
  return { status: 'ok' }
}

export const updateInvitationStatus = async ({ db, auth, state, update }) => {
  if (state.me.invitedAs &&
    (
      auth.currentUser.email ||
      (auth.currentUser.providerData && auth.currentUser.providerData.length) ||
      state.me.line_me ||
      state.me.yahoo_co_jp ||
      state.me.mixi_jp
    )
  ) {
    await update(state.me, {
      invitedAs: null
    })
  }
}
