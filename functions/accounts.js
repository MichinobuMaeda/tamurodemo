
const createAccount = async (db, auth, name) => {
  const ts = new Date()
  const defaults = await db.collection('service').doc('defaults').get()
  const account = await db.collection('accounts').add({
    ...defaults.data(),
    valid: true,
    createdAt: ts,
    updatedAt: ts
  })
  const uid = account.id
  await db.collection('users').doc(uid).set({
    name,
    createdAt: ts,
    updatedAt: ts
  })
  await db.collection('profiles').doc(uid).set({
    createdAt: ts,
    updatedAt: ts
  })
  await auth.createUser({ uid })
  console.log(`Create account "${uid}"`)
  return uid
}

const setEmail = async (db, auth, uid, email) => {
  const ts = new Date()
  await auth.updateUser(uid, { email })
  await db.collection('accounts').doc(uid).update({
    email,
    updatedAt: ts
  })
  console.log(`Update account "${uid}" set email "${email}"`)
}

const setPassword = async (db, auth, uid, password) => {
  await auth.updateUser(uid, { password })
  console.log(`Update account "${uid}" set password`)
}

module.exports = {
  createAccount,
  setEmail,
  setPassword
}
