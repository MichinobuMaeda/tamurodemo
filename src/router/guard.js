import state from '../plugins/composition-api'
import { myPriv } from '../store/auth'

const defaultPageForUser = { name: 'top' }
const defaultPageForGuest = { name: 'signin' }

const getLastPage = () => {
  const saved = window.localStorage.getItem('tamuroPage')
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch (e) {
      return defaultPageForUser
    }
  } else {
    return null
  }
}

const guard = (to, from, next) => {
  const currentPriv = myPriv(state)
  const lastPage = getLastPage()
  if (currentPriv.user && lastPage) {
    window.localStorage.setItem('tamuroPage', '')
    if (to.path !== lastPage.path) {
      next(lastPage)
    } else {
      next()
    }
  } else if (Object.keys(currentPriv).some(
    priv => currentPriv[priv] && to.matched.some(
      record => record.meta.privs.includes(priv)
    )
  )) {
    next()
  } else {
    const target = currentPriv.user ? defaultPageForUser : defaultPageForGuest
    if (to.path !== target.path) {
      next(target)
    } else {
      next()
    }
  }
}

export default guard
