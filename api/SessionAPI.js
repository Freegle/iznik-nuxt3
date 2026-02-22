import BaseAPI from './BaseAPI'

export default class SessionAPI extends BaseAPI {
  fetch(params) {
    // Add the build date to the call.  This is used by the server to spot out of date apps, but we need
    // to make it clear that we're not an app at all.
    // Keep on V1 — ModTools fallback needs work/discourse fields not in Go response
    return this.$get('/session', params)
  }

  fetchv2(params, log = true) {
    return this.$getv2('/user', params, log)
  }

  save(data, log) {
    return this.$patchv2('/session', data, log)
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
    return this.$postv2(
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
    return this.$delv2('/session')
  }

  lostPassword(email, log) {
    // Keep on V1 — caller uses log callback side effects for unknown email detection
    return this.$post('/session', { action: 'LostPassword', email }, log)
  }

  unsubscribe(email, log) {
    // Keep on V1 — caller uses log callback side effects for unknown email detection
    return this.$post('/session', { action: 'Unsubscribe', email }, log)
  }

  forget() {
    return this.$postv2('/session', { action: 'Forget' })
  }

  restore() {
    return this.$patchv2('/session', { deleted: null })
  }

  related(userlist) {
    return this.$postv2('/session', {
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
