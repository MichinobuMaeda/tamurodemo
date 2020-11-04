import { findItem } from './state'

export const sortedGroups = state => state.categories
  .filter(category => !category.deletedAt)
  .reduce((ret, cur) => [
    ...ret,
    ...state.groups.filter(group => group.id !== 'all' && !group.deletedAt && (cur.groups || []).includes(group.id))
  ], [])

export const groupsOfMe = state => [
  findItem(state.groups, 'all'),
  ...sortedGroups(state).filter(group => group.members.includes(state.me.id))
]
