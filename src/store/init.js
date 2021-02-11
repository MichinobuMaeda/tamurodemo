import { computed, inject, reactive } from '@vue/composition-api'
import moment from 'moment-timezone'
import { icon, locales, defaults, validators } from '../conf'
import { clearServiceData, clearUserData, findItem } from './state'
import { myPriv } from './accounts'
import { waitFor, add, update, remove, restore } from './io'

export const StoreSymbol = Symbol('store')
export const useStore = () => inject(StoreSymbol)

export const createStore = (firebase, root) => {
  const state = reactive(clearUserData(clearServiceData({
    ...defaults,
    loading: true
  })))

  const store = {
    state,
    ...firebase,
    waitFor: waitFor(state),
    add,
    update,
    remove,
    restore,
    ...validators(state, root),
    icon,
    withTz: date => moment(date).tz(state.tz),
    myName: computed(() => findItem(state.users, state.me.id).name || 'Guest'),
    priv: computed(() => myPriv(state))
  }

  return store
}

export const overrideDefaults = (store, root) => {
  const { state, auth } = store
  Object.keys(defaults).forEach(key => {
    state[key] = myPriv(state).user && state.me[key] !== undefined
      ? state.me[key]
      : state.service.defaults && state.service.defaults[key] !== undefined
        ? state.service.defaults[key]
        : defaults[key]
  })
  root.$vuetify.theme.dark = state.darkTheme
  root.$i18n.locale = state.locale
  const lang = locales.find(item => item.value === state.locale).lang
  moment.locale(lang)
  auth.languageCode = lang
}
