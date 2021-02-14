import { castDoc } from './firestore'

export const subscribeGroupChats = ({ db, state }) => {
  var changed = false
  const groupChats = { ...state.groupChats }
  const groups = state.groups.filter(group => !group.deletedAt && group.members.includes(state.me.id))
  Object.keys(state.unsubscribers)
    .filter(key => key.slice(0, 5) === 'chat_' && !groups.map(item => item.id).includes(key.slice(5)))
    .forEach(key => {
      state.unsubscribers[key]()
      delete state.unsubscribers[key]
      delete groupChats[key.slice(5)]
      changed = true
    })
  groups
    .filter(group => !Object.keys(groupChats).includes(group.id))
    .forEach(group => {
      const id = group.id
      groupChats[id] = []
      state.unsubscribers[`chat_${id}`] = db.collection('groups').doc(id)
        .collection('chat').orderBy('createdAt', 'asc')
        .onSnapshot(querySnapshot => {
          groupChats[id] = querySnapshot.docs.map(doc => castDoc(doc))
        })
      changed = true
    })
  if (changed) {
    state.groupChats = groupChats
  }
}

export const subscribeHotlines = ({ db, state }) => {
  var changed = false
  const hotlines = { ...state.hotlines }
  Object.keys(state.unsubscribers)
    .filter(key => key.slice(0, 8) === 'hotline_' && !state.accounts.map(item => item.id).includes(key.slice(8)))
    .forEach(key => {
      state.unsubscribers[key]()
      delete state.unsubscribers[key]
      delete hotlines[key.slice(8)]
      changed = true
    })
  state.accounts
    .filter(account => !Object.keys(hotlines).includes(account.id))
    .forEach(account => {
      const { id } = account
      hotlines[id] = []
      state.unsubscribers[`hotline_${id}`] = db.collection('accounts').doc(id)
        .collection('hotline').orderBy('createdAt', 'asc')
        .onSnapshot(querySnapshot => {
          hotlines[id] = querySnapshot.docs.map(doc => castDoc(doc))
        })
      changed = true
    })
  if (changed) {
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
