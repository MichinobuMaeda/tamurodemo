/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import {createStore, applyMiddleware} from 'redux'
import thunk from 'redux-thunk'

import {A, PAGE, PROVIDER} from '../../constants'
import reducers from '../../reducers'
import {
  setStatus, selectStartPage,
  init, gotoHome, signOut, signInWithPassword,
} from '../status'
import {setSignInId, setSignInPassword, setConfirm} from '../signin'
import {getTop, createSession, deleteMySession} from '../api'

jest.mock('../api')

var store = null

beforeEach(() => {
  global.document = {title: ''}
  getTop.mockClear()
  createSession.mockClear()
  deleteMySession.mockClear()
  store = createStore(
    reducers,
    applyMiddleware(thunk),
  )
})

test('setStatus', () => {
  const status = {top: {}, session: {}}
  store.dispatch(setStatus(status))
  expect(store.getState().status).toEqual(status)
})

test('selectStartPage', () => {
  expect(
    selectStartPage(null)
  ).toEqual(PAGE.GUEST)
  expect(
    selectStartPage({uid: null})
  ).toEqual(PAGE.GUEST)
  expect(
    selectStartPage({uid: 'uid001', provider: PROVIDER.TOKEN})
  ).toEqual(PAGE.WELCOME)
  expect(
    selectStartPage({uid: 'uid001', provider: PROVIDER.PASSWORD})
  ).toEqual(PAGE.TOP)
})

test('init', async () => {
  let status = {
    top: {name: 'Title'},
    session: {uid: 'uid001', provider: PROVIDER.TOKEN}
  }
  getTop.mockReturnValue(Promise.resolve(status))
  await init(store)
  expect(store.getState().status).toEqual(status)
  expect(store.getState().page).toEqual({
    history: [
      {name: PAGE.WELCOME, id: null},
    ],
    curr: 0,
  })
  expect(getTop.mock.calls).toEqual([
    [],
  ])
  expect(global.document.title).toEqual(status.top.name)
})

test('gotoHome', async () => {
  let status = {
    top: {name: 'Title'},
    session: {uid: 'uid001', provider: PROVIDER.TOKEN}
  }
  getTop.mockReturnValue(Promise.resolve(status))
  await store.dispatch(gotoHome())
  expect(store.getState().status).toEqual(status)
  expect(store.getState().page).toEqual({
    history: [
      {name: PAGE.GUEST, id: null},
      {name: PAGE.WELCOME, id: null},
    ],
    curr: 1,
  })
  expect(getTop.mock.calls).toEqual([
    [],
  ])
})

test('signOut', async () => {
  let status = {top: {name: 'Title'} }
  deleteMySession.mockReturnValue(Promise.resolve(status))
  store.dispatch(setSignInId('id0001'))
  store.dispatch(setSignInPassword('pass01'))
  store.dispatch(setConfirm('pass01'))
  expect(store.getState().signin).toEqual(
    {id: 'id0001', password: 'pass01', confirm: 'pass01'}
  )
  await store.dispatch(signOut())
  expect(store.getState().signin).toEqual({})
  expect(store.getState().status).toEqual(status)
  expect(store.getState().page).toEqual({
    history: [
      {name: PAGE.GOODBYE, id: null},
    ],
    curr: 0,
  })
  expect(deleteMySession.mock.calls).toEqual([
    [],
  ])
})

test('signInWithPassword: success', async () => {
  let status = {top: {name: 'Title'} }
  let signin = {id: 'id0001', password: 'pass01'}
  createSession.mockReturnValue(Promise.resolve(status))
  const dispatch = jest.fn()
  const getState = () => ({signin})
  await signInWithPassword()(dispatch, getState)
  expect(dispatch.mock.calls).toEqual([
    [{type: A.SET_STATUS, status}],
    [{type: A.RESET_PAGE, page: {name: PAGE.TOP, id: null} }]
  ])
  expect(createSession.mock.calls).toEqual([
    [{...signin, provider: PROVIDER.PASSWORD}],
  ])
})

test('signInWithPassword: error', async () => {
  let errors = {errors: [{}]}
  let signin = {id: 'id0001', password: 'pass01'}
  createSession.mockReturnValue(Promise.resolve(errors))
  const dispatch = jest.fn()
  const getState = () => ({signin})
  await signInWithPassword()(dispatch, getState)
  expect(dispatch.mock.calls).toEqual([
    [{type: A.SET_ERRORS, errors: errors.errors}],
    [{type: A.SET_PAGE, page: {name: PAGE.ERRORS, id: null} }]
  ])
  expect(createSession.mock.calls).toEqual([
    [{...signin, provider: PROVIDER.PASSWORD}],
  ])
})
