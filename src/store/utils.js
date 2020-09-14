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

// state to tree for Raw Page
const obj2RawTree = (parent, key, val) => typeof val === 'undefined'
  ? {
    id: `${parent}_${key}`,
    name: key,
    value: 'undefined'
  }
  : typeof val === 'function'
    ? {
      id: `${parent}_${key}`,
      name: key,
      value: 'function () {...}'
    }
    : typeof val === 'symbol'
      ? {
        id: `${parent}_${key}`,
        name: key,
        value: val.toString()
      }
      : (
        typeof val === 'boolean' ||
        typeof val === 'number' ||
        typeof val === 'bigint' ||
        typeof val === 'string' ||
        !val
      ) ? {
          id: `${parent}_${key}`,
          name: key,
          value: JSON.stringify(val)
        }
        : Array.isArray(val)
          ? val.length
            ? {
              id: `${parent}_${key}`,
              name: key,
              value: `[ ${val.length} ]`,
              children: val.map((item, index) => obj2RawTree(
                `${parent}_${key}`,
                (item && item.id) ? item.id : index,
                item)
              )
            }
            : {
              id: `${parent}_${key}`,
              name: key,
              value: '[ ]'
            }
          : Object.keys(val).length
            ? {
              id: `${parent}_${key}`,
              name: key,
              value: '{...}',
              children: [...Object.keys(val).filter(item => item !== 'id' || val[item] !== key)].sort().map(
                item => obj2RawTree(
                  `${parent}_${key}`,
                  item,
                  val[item]
                )
              )
            }
            : {
              id: `${parent}_${key}`,
              name: key,
              value: '{ }'
            }

export const rawTree = state => [...Object.keys(state)].sort().map(
  key => obj2RawTree('top', key, JSON.parse(JSON.stringify(state))[key])
)
