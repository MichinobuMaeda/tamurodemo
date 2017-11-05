/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

'use strict'

const pathMatcher = (t, p) => {
  return t.length === p.length &&
    t.reduce((ret, cur, i) => cur.match(/^\(:(.+)\)$/) || cur === p[i]
      ? ret : false, true)
}

const getParams = (t, p) => {
  return t.reduce((ret, cur, i) => {
    let param = cur.match(/^\(:(.+)\)$/)
    if (param) {
      ret[param[1]] = p[i]
    }
    return ret
  }, {})
}

const router = (routes) => async (ctx, next) => {
  let {method, path} = ctx.request
  if (path !== ctx.conf.basePath &&
      !path.startsWith(`${ctx.conf.basePath}/`)) {ctx.throw(404)}
  path = path.replace(ctx.conf.basePath, '')
  let p = path.match(/[^/]+/g) || []
  let route = routes.reduce(
    (ret, cur) => cur.method === method && pathMatcher(cur.path.match(/[^/]+/g) || [], p)
      ? cur : ret, null)
  if (!route)  {ctx.throw(404)}
  ctx.route = route
  ctx.request.params = getParams(route.path.match(/[^/]+/g) || [], p)
  await next()
}

export default router
