import { ref, computed } from '@vue/composition-api'
import { isoFormatToDate } from './utils'

export const profileUtils = (store, props) => {
  const { conf, state, user, profile, group, waitFor, update } = store

  const itemPermittsion = props => key => props.edit ||
    props.preview === 'm' ||
    (props.preview === 'c' && ['a', 'c'].includes(profile(props.id)[`${key}_p`])) ||
    (props.preview === 'a' && profile(props.id)[`${key}_p`] === 'a')

  return {
    addressIndexes: computed(
      () => [
        ...Array(state.service.conf.profileAddressCount || 1).keys()
      ].map(key => `add${key + 1}`)
    ),
    itemPermittsion: itemPermittsion(props),
    socialItems: computed(() => conf.locales
      .find(item => item.value === state.me.locale).socialItems
      .filter(item => itemPermittsion(props)(item.key))
    ),
    contactItems: computed(() => prefix => conf.locales
      .find(item => item.value === state.me.locale).addressItems
      .map(item => ({ ...item, key: `${prefix}_${item.key}` }))
      .filter(item => itemPermittsion(props)(item.key))
    ),
    permittedGroups: computed(() => (profile(props.id).permittedGroups || [])
      .map(id => group(id))
      .filter(group => group && !group.deletedAt)
    ),
    permittedUsers: computed(() => (profile(props.id).permittedUsers || [])
      .map(id => user(id))
      .filter(user => user && !user.deletedAt)
    ),
    setProfile: (key, val, p) => waitFor(async () => {
      const ts = new Date()
      await update(user(props.id), {}, ts)
      await update(profile(props.id), { [key]: val, [`${key}_p`]: p || profile(props.id)[`${key}_p`] || 'm' }, ts)
    }),
    switchPermission: async key => {
      const ts = new Date()
      await update(user(props.id), {}, ts)
      await update(profile(props.id), {
        [`${key}_p`]: profile(props.id)[`${key}_p`] === 'c'
          ? 'a'
          : profile(props.id)[`${key}_p`] === 'a'
            ? 'm'
            : 'c'
      }, ts)
    }
  }
}

export const init = store => {
  const { functions, conf, state } = store

  store.previewProfile = ref(2)

  store.picon = computed(() => conf.permissions.reduce((ret, cur) => ({ ...ret, [cur.value]: cur.icon }), {}))

  store.getProfile = async id => {
    const result = await functions.httpsCallable('getProfile')({ id: id })
    state.profiles = [
      ...state.profiles.filter(item => item.id !== id),
      isoFormatToDate(result.data)
    ]
  }
}
