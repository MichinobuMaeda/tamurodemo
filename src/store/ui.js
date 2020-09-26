import { db } from '../plugins/firebase'

export const clearUi = state => {
  state.loading = true
  state.waitUpdate = false
  state.rawData = false
}

export const initUi = async () => {}

export const waitProc = async (state, proc, next = null) => {
  state.waitUpdate = true
  try {
    await proc()
    if (next) { await next() }
  } finally {
    state.waitUpdate = false
  }
}

export const onMenuMoved = async (state, pos) => {
  if (state.me && state.me.valid) {
    await db.collection('accounts').doc(state.me.id).update({
      menuPosition: pos,
      updatedAt: new Date()
    })
  }
}
