import {
  waitRealtimeUpdate
} from '../_testUtils'
import {
  msecToDaysAndTime,
  waitFor
} from '../../../src/store/ui'
import { defaults } from '../../../src/conf'

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

test('waitFor()' +
  ' should set timeout and call the given function and the given next function.', async () => {
  // prepare
  defaults.waitProcTimeout = 450
  const state = {}
  const counter = {
    func: 0,
    next: 0
  }
  const func = async () => {
    await waitRealtimeUpdate(100)
    counter.func++
  }
  const next = () => { counter.next++ }
  const testFunc = waitFor(state)

  // run #1
  const ret = testFunc(func, next)

  // evaluate #1
  expect(state.waitProc).not.toBeNull()
  expect(counter).toEqual({
    func: 0,
    next: 0
  })

  // run #2
  await Promise.resolve(ret)

  // evaluate #2
  expect(state.waitProc).toBeNull()
  expect(counter).toEqual({
    func: 1,
    next: 1
  })
})

test('waitFor()' +
  ' should set timeout and call the given function and the given next function.', async () => {
  // prepare
  defaults.waitProcTimeout = 450
  const state = {}
  const counter = {
    func: 0,
    next: 0
  }
  const func = async () => {
    await waitRealtimeUpdate(750)
    counter.func++
  }
  const next = () => { counter.next++ }
  const testFunc = waitFor(state)

  // run #1
  const ret = testFunc(func, next)

  // evaluate #1
  expect(state.waitProc).not.toBeNull()
  expect(counter).toEqual({
    func: 0,
    next: 0
  })

  // run #2
  await waitRealtimeUpdate(500)

  // evaluate #2
  expect(state.waitProc).toBeNull()
  expect(counter).toEqual({
    func: 0,
    next: 0
  })

  // run #3
  await Promise.resolve(ret)

  // evaluate #3
  expect(state.waitProc).toBeNull()
  expect(counter).toEqual({
    func: 1,
    next: 1
  })
})
