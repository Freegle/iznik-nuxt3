import BaseAPI from './BaseAPI'

export default class SessionAPI extends BaseAPI {
  fetch(params) {
    // Add the build date to the call.  This is used by the server to spot out of date apps, but we need
    // to make it clear that we're not an app at all.
    return this.$get('/session', params)
  }

  fetchv2(params, log = true) {
    return this.$getv2('/user', params, log)
  }

  save(data, log) {
    return this.$patch('/session', data, log)
  }

  login(
    {
      email,
      password,
      fblogin,
      fbaccesstoken,
      fblimited,
      googlelogin,
      googleauthcode,
      googlejwt,
      u,
      k,
      mobile,
      appversion,
      applecredentials,
      applelogin,
    },
    log
  ) {
    return this.$post(
      '/session',
      {
        email,
        password,
        fblogin,
        fbaccesstoken,
        fblimited,
        googlelogin,
        googleauthcode,
        googlejwt,
        u,
        k,
        mobile,
        appversion,
        applecredentials,
        applelogin,
      },
      log
    )
  }

  logout() {
    return this.$del('/session')
  }

  lostPassword(email, log) {
    return this.$post('/session', { action: 'LostPassword', email }, log)
  }

  unsubscribe(email, log) {
    return this.$post('/session', { action: 'Unsubscribe', email }, log)
  }

  forget() {
    return this.$post('/session', { action: 'Forget' })
  }

  restore() {
    return this.$patch('/session', { deleted: null })
  }

  related(userlist) {
    return this.$post('/session', {
      action: 'Related',
      userlist,
    })
  }

  yahooCodeLogin(yahoocodelogin) {
    // ModTools
    return this.$post('/session', {
      yahoocodelogin,
    })
  }
}
