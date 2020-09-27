import { db } from '../plugins/firebase'

export const clearUsers = (state) => {
  state.accounts = []
  state.users = []
  state.profiles = []
}

export const updateAccount =
  (id, name, val) => db.collection('accounts')
    .doc(id).update({
      [name]: val,
      updatedAt: new Date()
    })

export const updateUser =
  (id, name, val) => db.collection('users')
    .doc(id).update({
      [name]: val,
      updatedAt: new Date()
    })
