import Vue from 'vue'
import VueCompositionApi, { reactive, inject, provide } from '@vue/composition-api'
import store from '../store'

// Composit API を使用する。
Vue.use(VueCompositionApi)

const { storeState, ...storeFunctions } = store

// 保持データ
const state = reactive(storeState)
// 保持データのストアの識別
const StoreSymbol = Symbol('rootStore')
// 保持データのストアを供給する。
const provideStore = store => { provide(StoreSymbol, store) }
// 保持データのストアを使用する。
const useStore = () => inject(StoreSymbol)

export default {
  state,
  ...storeFunctions,
  provideStore,
  useStore
}
