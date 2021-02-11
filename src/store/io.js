import { defaults } from '../conf'

const firestoreTimestampToDate = val => {
  return val && val.toDate
    ? val.toDate()
    : (Array.isArray(val)
      ? val.map(item => firestoreTimestampToDate(item))
      : ((val && typeof val === 'object')
        ? Object.keys(val).reduce(
          (ret, cur) => ({
            ...ret,
            [cur]: firestoreTimestampToDate(val[cur])
          }), ({}))
        : val
      )
    )
}

/**
 * { id, data() } => { id, ...data }
 * Firestore Timestamp => Date
 */
export const castDoc = doc => ({
  _ref: doc.ref,
  id: doc.id,
  ...firestoreTimestampToDate(doc.data())
})

export const waitFor = state => async (proc, next = null) => {
  const ts = new Date().getTime()
  state.waitProc = ts
  setTimeout(
    () => {
      if (state.waitProc === ts) {
        state.waitProc = null
      }
    },
    defaults.waitProcTimeout
  )
  try {
    const ret = await proc()
    if (next) { await next() }
    return ret
  } finally {
    state.waitProc = null
  }
}

export const add = (collection, data) => {
  const ts = new Date()
  return collection.add({
    ...data,
    createdAt: ts,
    updatedAt: ts
  })
}

export const update = (item, data) => item._ref.update({
  ...data,
  updatedAt: new Date()
})

export const remove = item => item._ref.update({
  deletedAt: new Date()
})

export const restore = item => item._ref.update({
  deletedAt: null
})
