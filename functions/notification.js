const notifyMessage = async (doc, { db, messaging }) => {
  const conf = await db.collection('service').doc('conf').get()
  const pauseTs = new Date().getTime() - conf.data().notificationPauseRepetitionTime + 1
  const expTime = conf.data().notificationExpirationTime / 1000
  const icon = conf.data().hosting + conf.data().notificationIconPath
  const group = await db.collection('groups').doc(
    doc.ref.parent.id === 'hotline' ? 'managers' : doc.ref.parent.parent.id
  ).get()
  const members = (doc.ref.parent.id === 'hotline' && !(group.data().members || []).some(id => id === doc.ref.parent.parent.id))
    ? [...(group.data().members || []), doc.ref.parent.parent.id]
    : (group.data().members || [])
  const tokens = await Promise.all(members
    .filter(id => doc.data().sender !== id)
    .map(async id => {
      const accountRef = db.collection('accounts').doc(id)
      return db.runTransaction(async transaction => {
        const account = await transaction.get(accountRef)
        if (
          account &&
          account.exists &&
          account.data().valid &&
          !account.data().deletedAt &&
          account.data().messagingTokens &&
          account.data().messagingTokens.length &&
          (
            !account.data().notifiedAt ||
            !account.data().notifiedAt[group.id] ||
            account.data().notifiedAt[group.id].toDate().getTime() < pauseTs
          )
        ) {
          const notifiedAt = account.data().notifiedAt || {}
          notifiedAt[group.id] = new Date()
          await transaction.update(accountRef, { notifiedAt })
          return account.data().messagingTokens.map(item => item.token)
        } else {
          return []
        }
      })
    })
  ).then(results => results.reduce((ret, cur) => [...ret, ...cur], []))
  if (tokens.length) {
    await messaging.sendMulticast({
      notification: {
        title: 'New message',
        body: group.data().name,
        icon
      },
      tokens,
      webpush: {
        headers: {
          TTL: expTime
        }
      }
    })
  }
}

module.exports = {
  notifyMessage
}
