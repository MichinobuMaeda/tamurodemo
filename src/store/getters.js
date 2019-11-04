export const conf = state => state.conf
export const isValidUser = state => state.me && state.me.data().valid
export const isAdmin = state => state.me && state.me.data().valid && state.me.data().admin
export const isManager = state => state.me && state.me.data().valid && state.me.data().manager
