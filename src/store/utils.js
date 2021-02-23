export const isoFormatToDate = val => {
  return typeof val === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d+/.test(val)
    ? new Date(val)
    : (Array.isArray(val)
      ? val.map(item => isoFormatToDate(item))
      : ((val && typeof val === 'object')
        ? Object.keys(val).reduce(
          (ret, cur) => ({
            ...ret,
            [cur]: isoFormatToDate(val[cur])
          }), ({}))
        : val
      )
    )
}
