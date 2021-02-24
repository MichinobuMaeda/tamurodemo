import { computed, inject, reactive } from '@vue/composition-api'
import moment from 'moment-timezone'
import * as confAll from '../conf'
import { clearServiceData, clearUserData, findItem } from './state'
import { accountStatus, accountPriv } from './accounts'
import { accountGroups } from './groups'
import { add, update, remove, restore } from './firestore'
import { waitFor, msecToDaysAndTime, formatText } from './ui'
import * as profiles from './profiles'

const { validators, defaults, ...conf } = confAll

export const StoreSymbol = Symbol('store')
export const useStore = () => inject(StoreSymbol)

export const createStore = (firebase, root) => {
  const state = reactive(clearUserData(clearServiceData({
    ...defaults,
    loading: true
  })))

  const account = (state, id) => {
    const account = state.me.id === id ? state.me : findItem(state.accounts, id)
    const user = findItem(state.users, id)
    return {
      ...account,
      status: accountStatus(state, id),
      name: user.name || 'Unknown',
      groups: accountGroups(state, id),
      priv: accountPriv(state, account)
    }
  }

  const store = {
    state,
    ...firebase,
    add,
    update,
    remove,
    restore,
    msecToDaysAndTime,
    waitFor: waitFor(state),
    formatText,
    ...validators(root),
    conf,
    withTz: date => moment(date).tz(state.tz),
    me: computed(() => account(state, state.me.id)),
    account: id => account(state, id),
    user: id => findItem(state.users, id),
    profile: id => findItem(state.profiles, id),
    group: id => findItem(state.groups, id),
    category: id => findItem(state.categories, id)
  }

  profiles.init(store)

  return store
}

export const overrideDefaults = (store, root) => {
  const { state, auth } = store
  Object.keys(defaults).forEach(key => {
    if (accountPriv(state, state.me).user && state.me[key] !== undefined) {
      state[key] = state.me[key]
    } else if (state.service.defaults && state.service.defaults[key] !== undefined) {
      state[key] = state.service.defaults[key]
    }
  })
  root.$vuetify.theme.dark = state.darkTheme
  root.$i18n.locale = state.locale
  const lang = conf.locales.find(item => item.value === state.locale).lang
  moment.locale(lang)
  auth.languageCode = lang
}
