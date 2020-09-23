import Vue from 'vue'
import VueCompositionApi, { reactive, inject, provide } from '@vue/composition-api'
import store from '../store'

Vue.use(VueCompositionApi)

const RootStoreSymbol = Symbol('rootStore')

export const initStore = () => {
  store.state = reactive(store.clearState({}))
  provide(RootStoreSymbol, store)
  return store
}

export const useStore = () => inject(RootStoreSymbol)
