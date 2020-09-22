import { db } from '../plugins/firebase'

export const clearUi = state => {
  state.loading = true
  state.waitUpdate = false
  state.menuPosition = 'br'
}

export const initUi = async () => {}

export const waitUpdateForProc = async (state, proc, next = null) => {
  state.waitUpdate = true
  try {
    await proc()
    if (next) { await next() }
  } finally {
    state.waitUpdate = false
  }
}

export const onMenuMoved = state => position => {
  state.menuPosition = position
  if (state.me && state.me.valid) {
    db.collection('accounts').doc(state.me.id).update({
      menuPosition: position
    })
  }
}
