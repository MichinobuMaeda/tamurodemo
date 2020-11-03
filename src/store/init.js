import { computed, inject, provide, reactive } from '@vue/composition-api'
import moment from 'moment-timezone'
import { icon, locales, defaults, validators } from '../conf'
import { clearServiceData, clearUserData, findItem } from './state'
import { myPriv } from './accounts'
import { ioHelpers } from './io'

export const StoreSymbol = Symbol('store')
export const useStore = () => inject(StoreSymbol)

export const createStore = (firebase, root) => {
  const { db } = firebase

  const state = reactive(clearUserData(clearServiceData({
    ...defaults,
    loading: true
  })))

  const store = {
    state,
    ...firebase,
    ...ioHelpers(db, state),
    ...validators(state, root),
    icon,
    withTz: date => moment(date).tz(state.tz),
    myName: computed(() => findItem(state.users, state.me.id).name || 'Guest'),
    priv: computed(() => myPriv(state))
  }

  store.sortedGroups = state => state.categories
    .filter(category => !category.deletedAt)
    .reduce((ret, cur) => [
      ...ret,
      ...state.groups.filter(group => group.id !== 'all' && !group.deletedAt && (cur.groups || []).includes(group.id))
    ], [])

  provide(StoreSymbol, store)
  return store
}

export const overrideDefaults = (store, root) => {
  const { state, auth } = store
  Object.keys(defaults).forEach(key => {
    state[key] = myPriv(state).user
      ? state.me[key]
      : state.service.defaults
        ? state.service.defaults[key]
        : defaults[key]
  })
  root.$vuetify.theme.dark = state.darkTheme
  root.$i18n.locale = state.locale
  const lang = locales.find(item => item.value === state.locale).lang
  moment.locale(lang)
  auth.languageCode = lang
}
