import * as service from './service'
import * as ui from './ui'
import * as utils from './utils'

const { clearService, initService, ...serviceFunctions } = service
const { clearUi, initUi, ...uiFunctions } = ui
const { ...utilsFunctions } = utils

// 保持データ
const storeState = {}

// 保持データをクリアする。
export const clearStore = state => {
  state.unsubscribers = state.unsubscribers || {}
  Object.keys(state.unsubscribers).forEach(key => {
    state.unsubscribers[key]()
  })
  clearUi(state)
  clearService(state)
}

clearStore(storeState)

// 保持データを初期化する。
export const initStore = async state => {
  state.unsubscribers = {}
  await initUi(state)
  await initService(state)
}

// Raw data ページ表示用データ
const rawTree = state => [...Object.keys(state)].sort().map(
  key => utils.obj2RawTree('top', key, JSON.parse(JSON.stringify(state))[key])
)

export default {
  initStore,
  storeState,
  ...serviceFunctions,
  ...uiFunctions,
  ...utilsFunctions,
  rawTree
}
