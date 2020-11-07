const {
  admin,
  backupDir,
  authJson,
  firestoreJson
} = require('./env')
const { execSync } = require('child_process')
const fs = require('fs')
const { stat, mkdir, writeFile } = fs.promises

const db = admin.firestore()

const mkdirBackup = async () => {
  try {
    await stat(backupDir)
  } catch (e) {
    await mkdir(backupDir, { recursive: true })
  }
}

const backup = async () => {
  await mkdirBackup()
  execSync(`firebase auth:export ${authJson}`)
  const docs = await getDocs(db)
  await writeFile(firestoreJson, JSON.stringify(docs, 0, 2))
}

backup()
  .then(() => {
    console.log('complete')
    return admin.app().delete()
  })
  .catch(e => {
    console.error(e)
    admin.app().delete()
  })

const getDocs = async (parent, base = null) => {
  const docs = []
  const collections = (await parent.listCollections()).map(collection => collection.id)
  await Promise.all(
    collections.map(
      collection => db.collection(collection).get()
        .then(querySnapshot => {
          querySnapshot.forEach(
            doc => {
              const parent = base ? `${base}/${collection}` : collection
              docs.push(castDoc(parent, doc))
            }
          )
        })
    )
  )
  await Promise.all(
    docs.map(async doc => {
      (await getDocs(doc.ref, doc.path)).forEach(doc => {
        docs.push(doc)
      })
      delete doc.ref
    })
  )
  return docs
}

const castDoc = (parent, doc) => ({
  path: `${parent}/${doc.id}`,
  data: firestoreTimestampToISOString(doc.data()),
  ref: doc.ref
})

const firestoreTimestampToISOString = val => {
  return val && val.toDate
    ? val.toDate().toISOString()
    : (Array.isArray(val)
      ? val.map(item => firestoreTimestampToISOString(item))
      : (typeof val === 'object'
        ? Object.keys(val).reduce(
          (ret, cur) => ({
            ...ret,
            [cur]: firestoreTimestampToISOString(val[cur])
          }), ({}))
        : val
      )
    )
}
