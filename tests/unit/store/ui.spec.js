import {
  msecToDaysAndTime
} from '../../../src/store/ui'

test('msecToDaysAndTime()' +
  ' should convert millisecond to "Dd HH:MM:SS".', async () => {
  expect(msecToDaysAndTime(-1000)).toEqual('-0d 00:00:01')
  expect(msecToDaysAndTime(0)).toEqual('0d 00:00:00')
  expect(msecToDaysAndTime(999)).toEqual('0d 00:00:00')
  expect(msecToDaysAndTime(1 * 1000)).toEqual('0d 00:00:01')
  expect(msecToDaysAndTime(24 * 3600 * 1000 - 1000)).toEqual('0d 23:59:59')
  expect(msecToDaysAndTime(24 * 3600 * 1000)).toEqual('1d 00:00:00')
  expect(msecToDaysAndTime(24 * 3600 * 1000 + 1000)).toEqual('1d 00:00:01')
})
