// Checked logged in. If not, go to /login
// On very first load of session, authStore user will not be valid yet as layout setup() has not been called to check
// In this case, go to the login page and bounce back if need be

import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware((to, from) => {
  // console.log('authuser.global.ts',to.path)
  const authStore = useAuthStore()
  // if (to.path === '/login' || to.path === '/forgot' || to.path === '/yahoologin/') {
  if (
    to.path === '/login' ||
    to.path === '/forgot' ||
    to.path === '/yahoologin/' ||
    to.path === '/discourse'
  ) {
    // Accessing login, forgot, yahoologin and discourse pages always OK
    return
  }
  const me = authStore.user
  if (me === null || !me.id) {
    // If me not set yet, then go to login page and bounce back if need be
    let newTo = '/login?return=' + to.path
    const newParams = []

    console.log('To', to)
    for (const key in to.query) {
      if (Object.prototype.hasOwnProperty.call(to.query, key)) {
        newParams.push(key + '=' + encodeURIComponent(to.query[key]))
      }
    }

    console.log('newParams', newParams)

    if (newParams.length) {
      newTo += '&' + newParams.join('&')
    }

    return navigateTo(newTo)
  }
})