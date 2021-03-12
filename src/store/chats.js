import { castDoc } from './firestore'

export const requestImageUrl = (state, messages) => {
  var changed = false
  const images = { ...state.images }
  Object.keys(messages).map(key => {
    messages[key].map(item => {
      item.images && item.images.map(image => {
        if (image.path && images[image.path] === undefined) {
          images[image.path] = null
          changed = true
        }
        if (image.tn && images[image.tn] === undefined) {
          images[image.tn] = null
          changed = true
        }
      })
    })
  })
  if (changed) {
    state.images = images
  }
}

export const getImageUrl = async ({ storage, state }) => Promise.all(
  Object.keys(state.images).filter(key => !state.images[key]).map(async key => {
    state.images[key] = await storage.ref(key).getDownloadURL()
  })
)

export const subscribeGroupChats = ({ db, state }) => {
  const myGroups = state.groups.filter(group => !group.deletedAt && group.members.includes(state.me.id))
  const unsubscribers = { ...state.unsubscribers }
  const groupChats = { ...state.groupChats }
  var changed = false
  Object.keys(unsubscribers)
    .filter(key => key.slice(0, 5) === 'chat_' && !myGroups.map(item => item.id).includes(key.slice(5)))
    .forEach(key => {
      unsubscribers[key]()
      delete unsubscribers[key]
      delete groupChats[key.slice(5)]
      changed = true
    })
  myGroups
    .filter(group => !Object.keys(state.groupChats).includes(group.id))
    .forEach(group => {
      changed = true
      const id = group.id
      groupChats[id] = []
      unsubscribers[`chat_${id}`] = db.collection('groups').doc(id)
        .collection('chat').orderBy('createdAt', 'asc')
        .onSnapshot(querySnapshot => {
          const groupChats = { ...state.groupChats }
          groupChats[id] = querySnapshot.docs.map(doc => castDoc(doc))
          state.groupChats = groupChats
        })
    })
  if (changed) {
    state.unsubscribers = unsubscribers
    state.groupChats = groupChats
  }
}

export const subscribeHotlines = ({ db, state }) => {
  const unsubscribers = { ...state.unsubscribers }
  const hotlines = { ...state.hotlines }
  var changed = false
  Object.keys(state.unsubscribers)
    .filter(key => key.slice(0, 8) === 'hotline_' && !state.accounts.map(item => item.id).includes(key.slice(8)))
    .forEach(key => {
      unsubscribers[key]()
      delete unsubscribers[key]
      delete hotlines[key.slice(8)]
      changed = true
    })
  state.accounts
    .filter(account => !Object.keys(hotlines).includes(account.id))
    .forEach(account => {
      changed = true
      const { id } = account
      hotlines[id] = []
      unsubscribers[`hotline_${id}`] = db.collection('accounts').doc(id)
        .collection('hotline').orderBy('createdAt', 'asc')
        .onSnapshot(querySnapshot => {
          const hotlines = { ...state.hotlines }
          hotlines[id] = querySnapshot.docs.map(doc => castDoc(doc))
          state.hotlines = hotlines
        })
    })
  if (changed) {
    state.unsubscribers = unsubscribers
    state.hotlines = hotlines
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
