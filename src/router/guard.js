import { myPriv } from '../store/auth'

const defaultPageForUser = { name: 'top' }
const defaultPageForGuest = { name: 'signin' }

const getRequestedPage = () => {
  const saved = window.localStorage.getItem('tamuroRequestedPage')
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

const guard = (router, route, state) => {
  const currentPriv = myPriv(state)
  const lastPage = getRequestedPage()
  if (currentPriv.user && lastPage) {
    window.localStorage.setItem('tamuroRequestedPage', '')
    if (route.path !== lastPage.path) {
      router.push(lastPage).catch(() => {})
    }
  } else if (Object.keys(currentPriv).some(
    priv => currentPriv[priv] && route.matched.some(
      record => record.meta.privs.includes(priv)
    )
  )) {
    // to do nothing
  } else {
    const target = currentPriv.user ? defaultPageForUser : defaultPageForGuest
    if (route.path !== target.path) {
      if (currentPriv.guest) {
        window.localStorage.setItem('tamuroRequestedPage', JSON.stringify(route.path))
      }
      router.push(target).catch(() => {})
    }
  }
}

export default guard
