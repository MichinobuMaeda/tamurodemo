import {
  router,
  setFakeWindow,
  deleteApp
} from '../utils'
import {
  routePermission,
  compareRoutes,
  guardRoute,
  guardMenuItem,
  detectPrivilegesChanged,
  goPage
} from '../../../src/auth/guard'
import {
  restoreRequestedRoute
} from '../../../src/auth/localStrage'
import { defaults } from '../../../src/conf'

beforeEach(async () => {
  setFakeWindow()
})

afterAll(async () => {
  await deleteApp()
})

test('routePermission()' +
  ' should return that the given route matches the geven priviliges or not.', async () => {
  // prepare #1
  const route = {
    matched: [
      { meta: { privs: ['user'] } },
      { meta: { privs: ['user', 'tester'] } }
    ]
  }
  const priv = {
    guest: true,
    user: false,
    manager: false,
    admin: false,
    tester: false
  }

  // run #1
  const ret1 = routePermission(priv, route)

  // evaluate #1
  expect(ret1).toBeFalsy()

  // prepare #2
  priv.tester = true

  // run #2
  const ret2 = routePermission(priv, route)

  // evaluate #2
  expect(ret2).toBeTruthy()
})

test('compareRoutes()' +
  ' should return the given routes have same name and params or not.', async () => {
  // prepare
  const r0 = { name: 'name1', params: { p1: 'v1' } }
  const r1 = { name: 'name1', params: { p1: 'v1' } }
  const r2 = { name: 'name1', params: { p1: 'v2' } }
  const r3 = { name: 'name3', params: { p1: 'v1' } }
  const r4 = { name: 'name1', params: { p1: 'v1', p2: 'v2' } }
  const r5 = { name: 'name1', params: { p2: 'v2' } }
  const r6 = { name: 'name1', params: {} }
  const r7 = { name: 'name1' }
  const r8 = { name: 'name1' }

  // run
  const ret1 = compareRoutes(r0, r1)
  const ret2 = compareRoutes(r0, r2)
  const ret3 = compareRoutes(r0, r3)
  const ret4 = compareRoutes(r0, r4)
  const ret5 = compareRoutes(r0, r5)
  const ret6 = compareRoutes(r0, r6)
  const ret7 = compareRoutes(r0, r7)
  const ret8 = compareRoutes(r7, r8)

  // evaluate
  expect(ret1).toBeTruthy()
  expect(ret2).toBeFalsy()
  expect(ret3).toBeFalsy()
  expect(ret4).toBeFalsy()
  expect(ret5).toBeFalsy()
  expect(ret6).toBeFalsy()
  expect(ret7).toBeFalsy()
  expect(ret8).toBeTruthy()
})

test('guardRoute()' +
  ' should push the route of top page if user does not have any privilige for the given route.', async () => {
  // prepare #1
  router.clear()
  const state = {
    loading: true,
    me: {
      id: 'id01',
      valid: true
    },
    groups: []
  }
  const route = {
    name: 'name1',
    matched: [
      { meta: { privs: ['user'] } }
    ]
  }
  router.match = route => ({
    ...route,
    matched: [
      { meta: { privs: route.name === 'name1' ? ['user'] : ['manager'] } }
    ]
  })

  // run #1
  guardRoute(router, route, state)

  // evaluate #1
  expect(router.data.push).not.toBeDefined()

  // prepare #2
  router.clear()
  state.loading = false

  // run #2
  guardRoute(router, null, state)

  // evaluate #3
  expect(router.data.push).not.toBeDefined()

  // prepare #3
  router.clear()
  route.name = null

  // run #3
  guardRoute(router, route, state)

  // evaluate #3
  expect(router.data.push).not.toBeDefined()

  // prepare #4
  router.clear()
  route.name = 'name1'

  // run #4
  guardRoute(router, route, state)

  // evaluate #4
  expect(router.data.push).not.toBeDefined()

  // prepare #5
  router.clear()
  route.name = 'top'
  route.matched[0].meta.privs = ['admin']

  // run #5
  guardRoute(router, route, state)

  // evaluate #5
  expect(router.data.push).not.toBeDefined()

  // prepare #6
  router.clear()
  state.me.valid = false
  route.name = 'signin'
  route.matched[0].meta.privs = ['user']

  // run #6
  guardRoute(router, route, state)

  // evaluate #6
  expect(router.data.push).not.toBeDefined()

  // prepare #7
  router.clear()
  state.me.valid = false
  route.name = 'top'
  route.matched[0].meta.privs = ['user']

  // run #7
  guardRoute(router, route, state)
  router.onRejected()

  // evaluate #7
  expect(router.data.push).toEqual({ name: 'signin' })

  // prepare #8
  router.clear()
  state.me.valid = true
  route.name = 'signin'
  route.matched[0].meta.privs = ['guest']

  // run #8
  guardRoute(router, route, state)
  router.onRejected()

  // evaluate #8
  expect(router.data.push).toEqual({ name: 'top' })
})

test('guardMenuItem()' +
  ' should .', async () => {
  // prepare
  const data = {
    route: null,
    action: null
  }
  const menuItems = [
    {
      name: 'item1',
      route: { name: 'name1' }
    },
    {
      name: 'item2',
      privs: ['user'],
      action: () => { data.action = 'item2' }
    },
    {
      name: 'item3',
      route: { name: 'name3' }
    },
    {
      name: 'item4',
      privs: ['manager'],
      action: () => { data.action = 'item4' }
    }
  ]
  router.match = route => ({
    ...route,
    matched: [
      { meta: { privs: route.name === 'name1' ? ['user'] : ['manager'] } }
    ]
  })
  const priv = {
    guest: false,
    user: true,
    manager: false,
    admin: false,
    tester: false
  }
  const goPage = route => { data.route = route }

  // run
  const ret = guardMenuItem(menuItems, router, priv, goPage)
  ret[0].action()
  ret[1].action()

  // evaluate
  expect(ret).toHaveLength(2)
  expect(ret[0].name).toEqual('item1')
  expect(ret[1].name).toEqual('item2')
  expect(data).toEqual({
    route: { name: 'name1' },
    action: 'item2'
  })
})

test('detectPrivilegesChanged()' +
  ' should detect modification of membership of "managers", "admins" or "testers".', async () => {
  // prepare #0
  const me = { id: 'id01', valid: true }
  const groupsPrev = [
    { id: 'managers', members: [] },
    { id: 'admins', members: [] },
    { id: 'managers', testers: [] }
  ]
  const groupsCurr = [
    { id: 'managers', members: [] },
    { id: 'admins', members: [] },
    { id: 'managers', testers: [] }
  ]

  // run / evaluate #0
  expect(detectPrivilegesChanged(me, groupsCurr, groupsPrev)).toBeFalsy()

  // prepare #1
  groupsPrev[0].members = [me.id]
  groupsCurr[0].members = [me.id]

  // run / evaluate #1
  expect(detectPrivilegesChanged(me, groupsCurr, groupsPrev)).toBeFalsy()

  // prepare #2
  groupsPrev[1].members = [me.id]
  groupsCurr[1].members = [me.id]

  // run / evaluate #2
  expect(detectPrivilegesChanged(me, groupsCurr, groupsPrev)).toBeFalsy()

  // prepare #3
  groupsPrev[2].members = [me.id]
  groupsCurr[2].members = [me.id]

  // run / evaluate #3
  expect(detectPrivilegesChanged(me, groupsCurr, groupsPrev)).toBeFalsy()

  // prepare #4
  groupsPrev[0].members = []
  groupsCurr[0].members = [me.id]

  // run / evaluate #4
  expect(detectPrivilegesChanged(me, groupsCurr, groupsPrev)).toBeTruthy()

  // prepare #5
  groupsPrev[1].members = []
  groupsCurr[1].members = [me.id]

  // run / evaluate #5
  expect(detectPrivilegesChanged(me, groupsCurr, groupsPrev)).toBeTruthy()

  // prepare #6
  groupsPrev[2].members = []
  groupsCurr[2].members = [me.id]

  // run / evaluate #6
  expect(detectPrivilegesChanged(me, groupsCurr, groupsPrev)).toBeTruthy()

  // prepare #7
  groupsPrev[0].members = [me.id]
  groupsCurr[0].members = []

  // run / evaluate #7
  expect(detectPrivilegesChanged(me, groupsCurr, groupsPrev)).toBeTruthy()

  // prepare #8
  groupsPrev[1].members = [me.id]
  groupsCurr[1].members = []

  // run / evaluate #8
  expect(detectPrivilegesChanged(me, groupsCurr, groupsPrev)).toBeTruthy()

  // prepare #9
  groupsPrev[2].members = [me.id]
  groupsCurr[2].members = []

  // run / evaluate #9
  expect(detectPrivilegesChanged(me, groupsCurr, groupsPrev)).toBeTruthy()

  // run / evaluate #10
  expect(detectPrivilegesChanged(me, groupsCurr, null)).toBeFalsy()

  // run / evaluate #11
  expect(detectPrivilegesChanged(me, groupsCurr, [])).toBeFalsy()
})

test('goPage()' +
  ' should store the geven route except conf.defaults.routeExcludeFromStorage' +
  ' and push to router.', async () => {
  // prepare #1
  defaults.routeExcludeFromStorage = ['name2']
  const state = {
    loading: false,
    me: {
      id: 'id01',
      valid: true
    },
    groups: []
  }
  router.match = route => ({
    ...route,
    matched: [
      { meta: { privs: route.name === 'name3' ? ['manager'] : ['user'] } }
    ]
  })
  window.clear()

  // run #1
  goPage(state, router)({ name: 'name1' })

  // evaluate #1
  expect(router.data.push).toEqual({ name: 'name1' })
  expect(restoreRequestedRoute()).toEqual({ name: 'name1' })

  // prepare #2
  window.clear()

  // run #2
  goPage(state, router)({ name: 'name2' })

  // evaluate #2
  expect(router.data.push).toEqual({ name: 'name2' })
  expect(restoreRequestedRoute()).toBeNull()

  // prepare #3
  window.clear()

  // run #3
  goPage(state, router)({ name: 'name3' })

  // evaluate #3
  expect(router.data.push).toEqual({ name: 'top' })
  expect(restoreRequestedRoute()).toBeNull()

  // prepare #4
  window.clear()

  // run #4
  goPage(state, router)({ name: 'testRouteName' })
  router.onRejected()

  // evaluate #4
  expect(router.data.push).toEqual({ name: 'testRouteName' })
  expect(restoreRequestedRoute()).toEqual({ name: 'testRouteName' })
})
