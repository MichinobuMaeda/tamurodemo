const moment = require('moment-timezone')
const axios = require('axios')
const { initialData } = require('./initialData')

const updateService = async ({ db, logger }, initialData) => {
  const ts = new Date()
  const createdAt = ts
  const updatedAt = ts
  await Promise.all(
    initialData(ts).map(async item => {
      const { collection, id, data } = item
      const docRef = db.collection(collection).doc(id)
      const doc = await docRef.get()
      if (doc && doc.exists) {
        if (Object.keys(data).some(
          key => !doc.data()[key] &&
            doc.data()[key] !== false &&
            doc.data()[key] !== ''
        )) {
          logger.log(`Update: ${collection}.${id}`)
          await docRef.set({
            ...data,
            ...doc.data(),
            updatedAt
          })
        }
      } else {
        logger.log(`Create: ${collection}.${id}`)
        await docRef.set({
          ...data,
          updatedAt,
          createdAt
        })
      }
    })
  )
}

const updateVersion = async ({ db, logger }) => {
  const confRef = db.collection('service').doc('conf')
  const conf = await confRef.get()
  const response = await axios.get(`${conf.data().hosting}/version.json`)
  const version = response.data.version
  if (conf.data().version !== response.data.version) {
    logger.log(`update from ${conf.data().version} to ${version}`)
    await updateService({ db }, initialData)
    await confRef.update({ version })
  }
  return version
}

module.exports = {
  updateService,
  updateVersion
}
