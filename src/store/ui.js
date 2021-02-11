export const msecToDaysAndTime = val => {
  if (val < 0) {
    const d = Math.floor(-val / (24 * 60 * 60 * 1000))
    return `-${d}d ${new Date(-val % (24 * 60 * 60 * 1000)).toISOString().slice(11, 19)}`
  } else {
    const d = Math.floor(val / (24 * 60 * 60 * 1000))
    return `${d}d ${new Date(val % (24 * 60 * 60 * 1000)).toISOString().slice(11, 19)}`
  }
}
