export const initializeMessaging = async (
  { standalone, webPushCertificateKey, messaging, db, FieldValue, state }
) => {
  if (standalone && webPushCertificateKey && process.env.NODE_ENV === 'production') {
    const token = await messaging.getToken({ vapidKey: webPushCertificateKey })
    messaging.onMessage((payload) => {
      console.log('Message received. ', payload)
    })
    if (token && state.me.id) {
      const ts = new Date()
      await db.runTransaction(async transaction => {
        const accountRef = db.collection('accounts').doc(state.me.id)
        const account = await transaction.get(accountRef)
        await transaction.update(accountRef, {
          messagingTokens: [
            ...account.data().messagingTokens.filter(item => item.token !== token),
            { token, ts }
          ],
          updatedAt: ts
        })
      })
    }
  }
}

export const ioHelpers = (db, state) => {
  const setProcForWait = async (proc, next = null) => {
    const ts = new Date().getTime()
    state.waitProc = ts
    setTimeout(
      () => {
        if (state.waitProc === ts) {
          state.waitProc = null
        }
      },
      10 * 1000
    )
    try {
      const ret = await proc()
      if (next) { await next() }
      return ret
    } finally {
      state.waitProc = null
    }
  }

  const add = (collection, data) => {
    const ts = new Date()
    return db.collection(collection)
      .add({
        ...data,
        createdAt: ts,
        updatedAt: ts
      })
  }

  const update = (collection, id, data) => db.collection(collection)
    .doc(id).update({
      ...data,
      updatedAt: new Date()
    })

  const remove = (collection, id) => db.collection(collection)
    .doc(id).update({
      deletedAt: new Date()
    })

  const restore = (collection, id) => db.collection(collection)
    .doc(id).update({
      deletedAt: null
    })

  const waitForAdd = (collection, data) =>
    setProcForWait(() => add(collection, data))

  const waitForUpdate = (collection, id, data) =>
    setProcForWait(() => update(collection, id, data))

  const waitForRemove = (collection, id) =>
    setProcForWait(() => remove(collection, id))

  const waitForRestore = (collection, id) =>
    setProcForWait(() => restore(collection, id))

  return {
    setProcForWait,
    add,
    update,
    remove,
    restore,
    waitForAdd,
    waitForUpdate,
    waitForRemove,
    waitForRestore
  }
}
