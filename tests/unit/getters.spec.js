import * as getters from '../../src/store/getters'

test('me', () => {
  const me = { id: 'a' }
  const state = { me }
  expect(getters.me(state)).toEqual(me);
})
