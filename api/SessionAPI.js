import BaseAPI from './BaseAPI'

export default class SessionAPI extends BaseAPI {
  fetch(params) {
    // Add the build date to the call.  This is used by the server to spot out of date apps, but we need
    // to make it clear that we're not an app at all.
    const runtimeConfig = useRuntimeConfig()
    params.webversion = runtimeConfig.public.BUILD_DATE
    return this.$get('/session', params)
  }

  fetchv2(params) {
    const runtimeConfig = useRuntimeConfig()
    params.webversion = runtimeConfig.public.BUILD_DATE
    return this.$getv2('/user', params)
  }

  save(data) {
    return this.$patch('/session', data)
  }

  login({
    email,
    password,
    fblogin,
    fbaccesstoken,
    googlelogin,
    googleauthcode,
    googlejwt,
    u,
    k,
    mobile,
    appversion,
    applecredentials,
    applelogin,
  }) {
    return this.$post('/session', {
      email,
      password,
      fblogin,
      fbaccesstoken,
      googlelogin,
      googleauthcode,
      googlejwt,
      u,
      k,
      mobile,
      appversion,
      applecredentials,
      applelogin,
    })
  }

  logout() {
    return this.$del('/session')
  }

  forget() {
    return this.$post('/session', { action: 'Forget' })
  }

  related(userlist) {
    return this.$post('/session', {
      action: 'Related',
      userlist,
    })
  }
}
