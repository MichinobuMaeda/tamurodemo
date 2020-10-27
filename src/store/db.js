/**
 * { id, data() } => { id, ...data }
 * Firestore Timestamp => Date
 */
export const simplifyDoc = doc => ({
  id: doc.id,
  ...Object.keys(doc.data()).reduce(
    (ret, cur) => ({
      ...ret,
      [cur]: (doc.data()[cur] && doc.data()[cur].toDate ? doc.data()[cur].toDate() : doc.data()[cur])
    }), ({}))
})

export const getById = (list, id) => (list || []).reduce(
  (ret, cur) => cur.id === id ? { ...cur } : ret,
  {}
)

export const add = db => (collection, data) => {
  const ts = new Date()
  return db.collection(collection)
    .add({
      ...data,
      createdAt: ts,
      updatedAt: ts
    })
}

export const update = db => (collection, id, data) => db.collection(collection)
  .doc(id).update({
    ...data,
    updatedAt: new Date()
  })

export const remove = db => (collection, id) => db.collection(collection)
  .doc(id).update({
    deletedAt: new Date()
  })

export const restore = db => (collection, id) => db.collection(collection)
  .doc(id).update({
    deletedAt: null
  })
