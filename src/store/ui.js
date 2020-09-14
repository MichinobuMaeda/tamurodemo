import { db } from '../plugins/firebase'

export const clearUi = state => {
  state.loading = true
  state.toolChip = false
  state.toolChipTimer = null
  state.waitUpdate = false
  state.history = []
  state.menuOpened = false
  state.menuPosition = 'bottom-right'
}

export const initUi = async () => {}

// データ更新待機ステータスを有効にしてデータ処理をする。
export const waitUpdateForProc = async (state, proc, next = null) => {
  // データ更新待機開始
  state.waitUpdate = true
  try {
    await proc()
    if (next) { await next() }
  } finally {
    // データ更新待機終了
    state.waitUpdate = false
  }
}

export const toolChipAnchor = state => state.menuPosition.includes('left') ? 'center right' : 'center left'
export const toolChipSelf = state => state.menuPosition.includes('left') ? 'center left' : 'center right'

// メニュー項目の ToolChip を表示する。
export const showToolChip = state => {
  state.toolChip = false
  state.toolChipTimer = setTimeout(() => { state.toolChip = true }, 500)
}

// メニュー項目の ToolChip を隠す。
export const hideToolChip = state => {
  if (state.toolChipTimer) {
    clearTimeout(state.toolChipTimer)
    state.toolChipTimer = null
  }
  state.toolChip = false
}

// メニューの位置の変更先
const menuPositionDirs = {
  'bottom-right': {
    left: 'bottom-left',
    up: 'top-right'
  },
  'top-right': {
    left: 'top-left',
    down: 'bottom-right'
  },
  'top-left': {
    right: 'top-right',
    down: 'bottom-left'
  },
  'bottom-left': {
    right: 'bottom-right',
    up: 'top-left'
  }
}

// メニューのスワイプ時の処理。
export const handleMenuSwipe = (state, menu) => async info => {
  hideToolChip(state)
  menu.hide()
  const currPosition = state.menuPosition
  const menuPosition = menuPositionDirs[currPosition][info.direction]
  if (menuPosition) {
    state.menuPosition = menuPosition
    if (state.me && state.me.id) {
      await db.collection('accounts').doc(state.me.id).update({
        menuPosition,
        updatedAt: new Date()
      })
    }
  }
}

const setPage = (state, router, route) => {
  router.push(route).catch(() => {})
  if (!['signin', 'preferences', 'raw', 'devices'].includes(route.name)) {
    window.localStorage.setItem('tamuroPage', JSON.stringify(route))
  }
}

export const goPage = (state, router, name, params = {}) => {
  const route = { name, params }
  state.history.push(route)
  setPage(state, router, route)
}

export const backPage = (state, router) => {
  state.history.pop()
  const route = state.history.length ? state.history[state.history.length - 1] : { name: 'top' }
  setPage(state, router, route)
}
