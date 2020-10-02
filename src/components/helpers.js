export const evalRules = (rules, v) => (rules || []).reduce(
  (ret, cur) => !!ret && cur(v) === true,
  true
)
