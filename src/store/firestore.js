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

export const add = (collection, data) => {
  const ts = new Date()
  return collection.add({
    ...data,
    createdAt: ts,
    updatedAt: ts
  })
}

export const update = (item, data, ts) => item._ref.update({
  ...data,
  updatedAt: ts || new Date()
})

export const remove = (item, ts) => item._ref.update({
  deletedAt: ts || new Date()
})

export const restore = item => item._ref.update({
  deletedAt: null
})
