const path = require('path')
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
  const docs = await getDocs(db, [])
  await writeFile(firestoreJson, JSON.stringify(docs, 0, 2))
  const bucket = admin.storage().bucket()
  await bucket.upload(authJson, { destination: `backup/${path.basename(authJson)}` })
  await bucket.upload(firestoreJson, { destination: `backup/${path.basename(firestoreJson)}` })
}

backup()
  .then(() => {
    console.log('complete')
    return admin.app().delete()
  })
  .catch(e => {
    console.error(e)
    return admin.app().delete()
  })

const getDocs = async (parent, docs) => {
  const collections = await parent.listCollections()
  await Promise.all(
    collections.map(
      async collectionRef => {
        console.log(collectionRef.path)
        const stapshot = await collectionRef.get()
        stapshot.forEach(
          async doc => {
            docs.push(castDoc(doc))
          }
        )
        await Promise.all(stapshot.docs.map(doc => getDocs(doc.ref, docs)))
      }
    )
  )
  return docs
}

const castDoc = doc => ({
  path: doc.ref.path,
  data: firestoreTimestampToISOString(doc.data())
})

const firestoreTimestampToISOString = val => {
  return val && val.toDate
    ? val.toDate().toISOString()
    : (Array.isArray(val)
      ? val.map(item => firestoreTimestampToISOString(item))
      : ((val && typeof val === 'object')
        ? Object.keys(val).reduce(
          (ret, cur) => ({
            ...ret,
            [cur]: firestoreTimestampToISOString(val[cur])
          }), ({}))
        : val
      )
    )
}
