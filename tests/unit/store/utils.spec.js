// import {
//   waitRealtimeUpdate
// } from '../_testUtils'
import {
  isoFormatToDate
} from '../../../src/store/utils'

test('isoFormatToDate()' +
  ' should cast ISO date time format String to date in the Object.', async () => {
  // prepare
  const data = {
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
  }

  // run
  const result = isoFormatToDate(data)

  // evaluate
  expect(result).toEqual({
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
  })
})
