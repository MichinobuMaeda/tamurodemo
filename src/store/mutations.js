export const setService = (state, querySnapshot) => {
  querySnapshot.forEach(doc => {
    state.service[doc.id] = doc.data()
  })
}
export const setMe = (state, me) => { state.me = me }
export const resetMe = state => { state.me = null }
