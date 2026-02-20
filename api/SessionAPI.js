import BaseAPI from './BaseAPI'

export default class SessionAPI extends BaseAPI {
  fetch(params) {
    return this.$getv2('/session', params)
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
    return this.$postv2('/session', { action: 'LostPassword', email }, log)
  }

  unsubscribe(email, log) {
    return this.$postv2('/session', { action: 'Unsubscribe', email }, log)
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
    // ModTools - no V2 handler yet
    return this.$post('/session', {
      yahoocodelogin,
    })
  }
}
