const moment = require('moment-timezone')

const tz = 'Asia/Tokyo'
const initialData = ts => [
  {
    collection: 'service',
    id: 'conf',
    data: {
      version: moment.tz(ts, tz).format('SSSssmmHHDDMMYYYY'),
      name: 'Tamuro',
      policy: `
## h2

p

### h3

- item
- item

p

1. item
2. item
`
    }
  },
  {
    collection: 'service',
    id: 'defaults',
    data: {
      tz,
      locale: 'ja_JP',
      menuPosition: 'br'
    }
  },
  {
    collection: 'groups',
    id: 'admins',
    data: {
      name: 'System admins',
      members: []
    }
  },
  {
    collection: 'groups',
    id: 'managers',
    data: {
      name: 'Managers',
      members: []
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
