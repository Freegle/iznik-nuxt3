// Checked logged in. If not, go to /login
// On very first load of session, authStore user will not be valid yet as layout setup() has not been called to check
// In this case, go to the login page and bounce back if need be

import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware((to, from) => {
  // console.log('authuser.global.ts',to.path)
  const authStore = useAuthStore()
  if (to.path === '/login' || to.path === '/forgot') {
    // Accessing login and forgot pages always OK
    return
  }
  const me = authStore.user
  if (me === null || !me.id) {
    // If me not set yet, then go to login page and bounce back if need be
    return navigateTo('/login?return=' + to.path)
  }
})
