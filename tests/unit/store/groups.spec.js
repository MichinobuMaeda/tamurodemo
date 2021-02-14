import {
  deleteApp,
  store
} from '../utils'
import {
  sortedGroups,
  accountGroups
} from '../../../src/store/groups'

beforeEach(async () => {
  store.auth.clear()
  store.functions.clear()
})

afterAll(async () => {
  await deleteApp()
})

test('sortedGroups()' +
  ' should return the list of groups sorted by categories without group id: "all".', async () => {
  // prepare
  const state = {
    categories: [
      { id: 'deleted', groups: ['group1'], deletedAt: new Date() },
      { id: 'cat0' },
      { id: 'cat1', groups: ['group2', 'group3'] },
      { id: 'cat2', groups: ['group1', 'group3', 'group4'] }
    ],
    groups: [
      { id: 'all' },
      { id: 'group1' },
      { id: 'group2' },
      { id: 'group3' },
      { id: 'group4' },
      { id: 'group5' }
    ]
  }

  // run
  const ret = sortedGroups(state)

  // evaluate
  expect(ret).toEqual([
    { id: 'group2' },
    { id: 'group3' },
    { id: 'group1' },
    { id: 'group4' },
    { id: 'group5' }
  ])
})

test('accountGroups()' +
  ' should return the list of groups which has me as member.', async () => {
  // prepare #0
  const state = {
    categories: [],
    groups: [
      { id: 'all' }
    ],
    me: { id: 'id01' }
  }

  // run #0
  const ret0 = accountGroups(state, 'id01')

  // evaluate #0
  expect(ret0).toEqual([
    { id: 'all' }
  ])

  // prepare #1
  state.categories = [
    { id: 'cat1', groups: ['group2', 'group3'] },
    { id: 'cat2', groups: ['group1', 'group3', 'group4'] }
  ]
  state.groups = [
    { id: 'all', members: ['id01', 'id02'] },
    { id: 'group1', members: ['id01', 'id02'] },
    { id: 'group2', members: ['id01'] },
    { id: 'group3', members: ['id01'] },
    { id: 'group4', members: ['id02'] },
    { id: 'group5', members: ['id01'] }
  ]

  // run #1
  const ret1 = accountGroups(state, 'id01')

  // evaluate #1
  expect(ret1).toEqual([
    { id: 'all', members: ['id01', 'id02'] },
    { id: 'group2', members: ['id01'] },
    { id: 'group3', members: ['id01'] },
    { id: 'group1', members: ['id01', 'id02'] },
    { id: 'group5', members: ['id01'] }
  ])
})
