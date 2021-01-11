import { findItem } from './state'

export const accountIsValid = account => !!(account && account.id && !account.deletedAt && account.valid)
export const isMemberOf = (account, group) => account && account.id && group && (group.members || []).includes(account.id)
export const accountPriv = ({ service, groups, hidePrivilegedItems }, account) => {
  const valid = accountIsValid(account)
  const managerReal = valid && isMemberOf(account, findItem(groups, 'managers'))
  const adminReal = valid && isMemberOf(account, findItem(groups, 'admins'))
  const testerReal = valid && isMemberOf(account, findItem(groups, 'testers'))
  return {
    guest: !valid,
    invited: !!(valid &&
      account.invitedAs &&
      account.invitedAt &&
      account.invitedAt.getTime() >= (new Date().getTime() - service.conf.invitationExpirationTime)),
    user: valid,
    manager: managerReal && !hidePrivilegedItems,
    admin: adminReal && !hidePrivilegedItems,
    tester: testerReal && !hidePrivilegedItems,
    managerReal,
    adminReal,
    testerReal
  }
}
export const myPriv = state => accountPriv(state, state.me)

export const accountStatus = (state, id) => {
  const account = (state.accounts && state.accounts.find(account => account.id === id)) || null
  return (!account || account.deletedAt)
    ? 'Account deleted'
    : !account.valid
      ? 'Account locked'
      : account.invitedAs
        ? account.invitedAt
          ? account.signedInAt && account.invitedAt.getTime() < account.signedInAt.getTime()
            ? 'Invitation accepted'
            : account.invitedAt.getTime() < (new Date().getTime() - state.service.conf.invitationExpirationTime)
              ? 'Invitation timeout'
              : 'Invited'
          : account.signedInAt
            ? 'Account active'
            : 'Account inactive'
        : account.signedInAt
          ? 'Account active'
          : 'Account inactive'
}
