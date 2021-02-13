import { defaults } from '../conf'

export const msecToDaysAndTime = val => {
  if (val < 0) {
    const d = Math.floor(-val / (24 * 60 * 60 * 1000))
    return `-${d}d ${new Date(-val % (24 * 60 * 60 * 1000)).toISOString().slice(11, 19)}`
  } else {
    const d = Math.floor(val / (24 * 60 * 60 * 1000))
    return `${d}d ${new Date(val % (24 * 60 * 60 * 1000)).toISOString().slice(11, 19)}`
  }
}

export const waitFor = state => async (proc, next = null) => {
  const ts = new Date().getTime()
  state.waitProc = ts
  setTimeout(
    () => {
      if (state.waitProc === ts) {
        state.waitProc = null
      }
    },
    defaults.waitProcTimeout
  )
  try {
    const ret = await proc()
    if (next) { await next() }
    return ret
  } finally {
    state.waitProc = null
  }
}
