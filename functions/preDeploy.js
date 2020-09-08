const moment = require('moment-timezone')

const tz = 'Asia/Tokyo'
const initialData = ts => [
  {
    collection: 'service',
    id: 'conf',
    data: {
      version: moment.tz(ts, tz).format('SSSssmmHHDDMMYYYY'),
      name: 'Tamuro'
    }
  },
  {
    collection: 'service',
    id: 'defaults',
    data: {
      tz,
      locale: 'ja_JP'
    }
  }
]

const preDeploy = async (db, ts) => {
  await Promise.all(
    initialData(ts).map(async item => {
      const { collection, id, data } = item
      const docRef = db.collection(collection).doc(id)
      const doc = await docRef.get()
      if (doc && doc.exists) {
        if (Object.keys(data).some(key => !doc.data()[key])) {
          console.log(`Update: ${collection}.${id}`)
          await docRef.set({
            ...data,
            ...doc.data(),
            updatedAt: ts
          })
        }
      } else {
        console.log(`Create: ${collection}.${id}`)
        await docRef.set({
          ...data,
          createdAt: ts,
          updatedAt: ts
        })
      }
    })
  )
}

module.exports = preDeploy
