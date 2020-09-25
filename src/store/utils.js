export const goPage = (router, route) => {
  if (!['signin', 'policy'].includes(route.name)) {
    window.localStorage.setItem('tamuroRequestedPage', JSON.stringify(route))
  }
  router.push(route).catch(() => {})
}

// { id, data() } => { id, ...data }
// Firestore Timestamp => Date
export const simplifyDoc = doc => ({
  id: doc.id,
  ...Object.keys(doc.data()).reduce(
    (ret, cur) => ({
      ...ret,
      [cur]: (doc.data()[cur] && doc.data()[cur].toDate ? doc.data()[cur].toDate() : doc.data()[cur])
    }), ({}))
})

export const getById = (list, id) => (list ||[]).reduce(
  (ret, cur) => cur.id === id ? { ...cur } : ret,
  {}
)

export const linesToArray = lines => (lines || '').split('\n').map(
  line => (line || '').trim()
).filter(
  line => !!line
)

export const shortenName = name => (name || '').trim()
  .replace('　', ' ')
  .replace(/[\s].*/, '')

export const shortName = (state, id) => shortenName(
  (state.accounts.find(account => account.id === id) || {}).name
)

export const shortDate = (dt, def = '') => dt ? dt.toLocaleString().replace(/^\d+\//, '').replace(/\s.*/, '') : def

export const isCurrentTaskDate = (state, dt) => dt.toISOString().slice(0, 10) >= (new Date((new Date(state.orderListFrom)).getTime() + 9 * 3600 * 1000)).toISOString().slice(0, 10)
export const isToday = dt => dt.toISOString().slice(0, 10) === (new Date((new Date()).getTime() + 9 * 3600 * 1000)).toISOString().slice(0, 10)
export const beforeToday = dt => dt.toISOString().slice(0, 10) < (new Date((new Date()).getTime() + 9 * 3600 * 1000)).toISOString().slice(0, 10)
export const dateCellClass = dt => dt ? ((beforeToday(dt) ? 'bg-grey-5' : '') + (isToday(dt) ? 'bg-cyan-5' : '')) : ''

export const fixPoint2 = (n, def = '') => (n || n === 0) ? n.toFixed(2) : def

export const longDate = dt => (new Date((new Date(dt)).getTime() + 9 * 3600 * 1000)).toISOString().slice(0, 10).replace(/-/g, '/')
