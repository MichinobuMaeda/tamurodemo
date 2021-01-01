import { findItem } from './state'

export const sortedGroups = state => {
  const categorizedGroups = state.categories
    .filter(category => !category.deletedAt)
    .reduce((ret, cur) => [
      ...ret,
      ...state.groups.filter(group => group.id !== 'all' && !group.deletedAt && !ret.some(comp => comp.id === group.id) && (cur.groups || []).includes(group.id))
    ], [])
  return [
    ...categorizedGroups,
    ...state.groups.filter(group => group.id !== 'all' && !group.deletedAt && !categorizedGroups.some(comp => comp.id === group.id))
  ]
}

export const groupsOfMe = state => [
  findItem(state.groups, 'all'),
  ...sortedGroups(state).filter(group => group.members.includes(state.me.id))
]
