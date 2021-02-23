const {
  admin
} = require('./env')

const prefix = process.argv[2] || ''

const listStorage = async () => {
  const bucket = admin.storage().bucket()
  const [files] = await bucket.getFiles(prefix ? { prefix } : {})
  files.forEach(file => {
    console.log(file.name)
  })
}

listStorage()
  .then(() => {
    return admin.app().delete()
  })
  .catch(e => {
    console.error(e)
    return admin.app().delete()
  })
