import Vue from 'vue'
import VueCompositionApi, { reactive, inject, provide } from '@vue/composition-api'
import store from '../store'

Vue.use(VueCompositionApi)

const RootStoreSymbol = Symbol('rootStore')
const state = {}

export default {
  state: reactive(store.clearState(state)),
  provideStore: store => { provide(RootStoreSymbol, store) },
  useStore: () => inject(RootStoreSymbol),
  ...store
}
