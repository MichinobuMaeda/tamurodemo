export const initializeMessaging = async (
  { standalone, webPushCertificateKey, messaging, db, state }
) => {
  if (standalone && webPushCertificateKey && process.env.NODE_ENV === 'production') {
    const token = await messaging.getToken({ vapidKey: webPushCertificateKey })
    messaging.onMessage(payload => {
      console.log('Message received. ', payload)
    })
    if (token && state.me.id) {
      const ts = new Date()
      await db.runTransaction(async transaction => {
        const accountRef = db.collection('accounts').doc(state.me.id)
        const account = await transaction.get(accountRef)
        await transaction.update(accountRef, {
          messagingTokens: [
            ...(account.data().messagingTokens || []).filter(item => item.token !== token),
            { token, ts }
          ],
          updatedAt: ts
        })
      })
    }
  }
}

const messageId = ts => ts.toISOString().replace(/[^0-9]/g, '').slice(0, 17)

export const postGroupChat = async ({ db, state }, id, message) => {
  const ts = new Date()
  await db.collection('groups').doc(id)
    .collection('chat').doc(messageId(ts))
    .set({
      sender: state.me.id,
      message,
      likes: [],
      createdAt: ts,
      updatedAt: ts
    })
}

export const postHotline = async ({ db, state }, id, message) => {
  const ts = new Date()
  await db.collection('accounts').doc(id)
    .collection('hotline').doc(messageId(ts))
    .set({
      sender: state.me.id,
      message,
      likes: [],
      createdAt: ts,
      updatedAt: ts
    })
}
