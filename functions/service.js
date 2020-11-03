const moment = require('moment-timezone')
const axios = require('axios')

const initialData = ts => [
  {
    collection: 'service',
    id: 'conf',
    data: {
      version: '0000000',
      name: 'Tamuro',
      hosting: 'https://tamuro-test01.web.app',
      invitationExpirationTime: 24 * 3600 * 1000,
      desc: {
        type: 'markdown',
        data: '',
      },
      policy: {
        type: 'markdown',
        data: `
## Headings level 2

### Headings level 3

- list item without number
- list item without number

paragraph paragraph paragraph paragraph paragraph paragraph
paragraph paragraph paragraph paragraph paragraph paragraph.
paragraph paragraph paragraph paragraph paragraph paragraph
paragraph paragraph paragraph paragraph paragraph paragraph.

1. list item with number
2. list item with number
`
      }
    }
  },
  {
    collection: 'service',
    id: 'defaults',
    data: {
      tz: 'Asia/Tokyo',
      locale: 'ja_JP',
      menuPosition: 'br',
      darkTheme: false
    }
  },
  {
    collection: 'service',
    id: 'auth',
    data: {
      invitation: true,
      emailLink: true,
      password: true,
      'google_com': {},
      'apple_com': false,
      'facebook_com': false,
      'github_com': false,
      'microsoft_com': false,
      'twitter_com': false,
      'line_me': false,
      'yahoo_co_jp': {},
      'mixi_jp': false
    }
  },
  {
    collection: 'groups',
    id: 'all',
    data: {
      name: 'All members',
      desc: {
        type: 'plain',
        data: ''
      },
      members: []
    }
  },
  {
    collection: 'groups',
    id: 'admins',
    data: {
      name: 'System admins',
      desc: {
        type: 'plain',
        data: ''
      },
      members: []
    }
  },
  {
    collection: 'groups',
    id: 'managers',
    data: {
      name: 'Managers',
      desc: {
        type: 'plain',
        data: ''
      },
      members: []
    }
  },
  {
    collection: 'groups',
    id: 'testers',
    data: {
      name: 'Testers',
      desc: {
        type: 'plain',
        data: ''
      },
      members: []
    }
  }
]

const updateService = async ({ db }) => {
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
          console.log(`Update: ${collection}.${id}`)
          await docRef.set({
            ...data,
            ...doc.data(),
            updatedAt
          })
        }
      } else {
        console.log(`Create: ${collection}.${id}`)
        await docRef.set({
          ...data,
          updatedAt,
          createdAt
        })
      }
    })
  )
}

const updateVersion = async ({ db }) => {
  const confRef = db.collection('service').doc('conf')
  const conf = await confRef.get()
  const response = await axios.get(`${conf.data().hosting}/version.json`)
  const version = response.data.version
  if (conf.data().version !== response.data.version) {
    console.log(`update from ${conf.data().version} to ${version}`)
    await updateService({ db })
    await confRef.update({ version })
  }
  return version
}

module.exports = {
  updateService,
  updateVersion
}
