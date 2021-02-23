const {
  db,
  auth,
  // logger,
  clearDb,
  deleteApp,
  testData
} = require('./_testUtils')
const {
  castDoc
} = require('../../../functions/utils')

beforeEach(async () => {
  auth.clear()
  await clearDb()
  await testData()
})

afterAll(async () => {
  await clearDb()
  await deleteApp()
})

test('castDoc()' +
  ' should return the plain object of the given firebase document.', async () => {
  // prepare
  const id = 'test'
  const data = {
    obj1: {
      str11: 'String 11',
      dt12: new Date('2020-12-31T01:23:45.012Z'),
      obj13: {
        str131: 'String 131',
        dt132: new Date('2020-12-31T01:23:45.132Z')
      },
      arr14: [
        'String 141',
        new Date('2020-12-31T01:23:45.142Z')
      ]
    },
    arr2: [
      'String 21',
      new Date('2020-12-31T01:23:45.022Z'),
      {
        str231: 'String 231',
        dt232: new Date('2020-12-31T01:23:45.232Z')
      }
    ],
    createdAt: new Date('2020-12-31T01:23:45.001Z')
  }
  const docRef = db.collection('tests').doc(id)
  await docRef.set(data)
  const doc = await docRef.get()

  // run
  const ret = castDoc(doc)

  // evaluate
  expect(ret).toMatchObject({
    id,
    obj1: {
      str11: 'String 11',
      dt12: '2020-12-31T01:23:45.012Z',
      obj13: {
        str131: 'String 131',
        dt132: '2020-12-31T01:23:45.132Z'
      },
      arr14: [
        'String 141',
        '2020-12-31T01:23:45.142Z'
      ]
    },
    arr2: [
      'String 21',
      '2020-12-31T01:23:45.022Z',
      {
        str231: 'String 231',
        dt232: '2020-12-31T01:23:45.232Z'
      }
    ],
    createdAt: '2020-12-31T01:23:45.001Z'
  })
})
