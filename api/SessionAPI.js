import BaseAPI from './BaseAPI'

export default class SessionAPI extends BaseAPI {
  fetch(params) {
    return this.$getv2('/session', params)
  }

  fetchv2(params, log = true) {
    return this.$getv2('/session', params, log)
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
    // Use a dedicated AbortController so this call is not killed by
    // enterLogoutMode() which aborts the global controller.
    return this.$delv2('/session', null, true, {
      ownAbortController: new AbortController(),
    })
  }

  lostPassword(email) {
    // Suppress Sentry for expected 404s (unknown email, ret:2) but still log unexpected errors (e.g. 500).
    return this.$postv2(
      '/session',
      { action: 'LostPassword', email },
      (data) => data?.ret !== 2
    )
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
}
