import { computed, inject, reactive } from '@vue/composition-api'
import moment from 'moment-timezone'
import { icon, locales, defaults, validators } from '../conf'
import { clearServiceData, clearUserData, findItem } from './state'
import { myPriv, accountStatus } from './accounts'
import { add, update, remove, restore } from './firestore'
import { waitFor, msecToDaysAndTime } from './ui'

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
    add,
    update,
    remove,
    restore,
    msecToDaysAndTime,
    waitFor: waitFor(state),
    ...validators(root),
    icon,
    withTz: date => moment(date).tz(state.tz),
    accountStatus: id => accountStatus(state, id),
    nameOf: id => findItem(state.users, id).name || 'Unknown',
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
