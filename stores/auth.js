import { defineStore } from 'pinia'
import { SocialLogin } from '@capgo/capacitor-social-login'
import { LoginError, SignUpError } from '~/api/APIErrors'
import { useComposeStore } from '~/stores/compose'
import api from '~/api'
import { useMobileStore } from '@/stores/mobile'
import { useMiscStore } from '~/stores/misc'

export const useAuthStore = defineStore({
  id: 'auth',
  persist: {
    storage: piniaPluginPersistedstate.localStorage(),
    // We don't persist much about the user, to avoid data getting 'stuck'.  All we need is enough to log us
    // in, and information about which users have been used on this device.
    pick: ['auth', 'userlist', 'loginCount', 'loggedInEver'],
  },
  state: () => ({
    auth: {
      // For APIv2
      jwt: null,

      // For APIv2,
      persistent: null,
    },

    loginStateKnown: false,
    forceLogin: false,
    user: null,
    groups: [],
    loggedInEver: false,
    userlist: [],
    loginType: null,
    loginCount: 0,
    work: {}, // ModTools: moderator work counts
    discourse: {}, // ModTools: Discourse integration
  }),
  actions: {
    init(config) {
      this.config = config
      this.$api = api(config)

      // Don't get auth info via cookies.  That would mean that we rendered the page in SSR logged in, which
      // sounds good, but we would then return the store to the client for hydration.  That would include the
      // auth section which might lead to us being logged in as the wrong user.
    },
    setAuth(jwt, persistent) {
      this.auth.jwt = jwt
      this.auth.persistent = persistent
    },
    setUser(value) {
      if (value) {
        // Remember that we have successfully logged in at some point.
        this.loggedInEver = true
        this.user = value

        // Ensure we have a basic set of settings.
        if (!this.user.settings) {
          this.user.settings = {}
        }

        if (!this.user.settings.notifications) {
          this.user.settings.notifications = {
            email: true,
            emailmine: false,
            push: true,
            facebook: true,
            app: true,
          }
        }

        const miscStore = useMiscStore()
        if (!this.user.source && miscStore.source) {
          // Record that this user came from this source.
          console.log('Logged in and no source - update', value)
          this.saveAndGet({ source: miscStore.source })
        }

        // Ensure we don't store any password (it shouldn't get persisted anyway, but let's be careful).
        delete this.user.password

        this.addRelatedUser(value.id)

        if (this.forceLogin) {
          // We have logged in.
          this.forceLogin = false
        }
      } else {
        this.user = null
      }
    },
    async addRelatedUser(id) {
      if (id) {
        // Keep track of which users we log in as.
        if (!this.userlist) {
          this.userlist = []
        }

        if (!this.userlist.includes(id)) {
          if (this.userlist.length > 9) {
            this.userlist.pop()
          }

          this.userlist.unshift(id)

          if (this.userlist.length > 1) {
            try {
              // Logged in as multiple users.  Let the server know.  This can fail, but we don't care.
              await this.$api.session.related(this.userlist)
            } catch (e) {}
          }
        }
      }
    },
    clearRelated() {
      this.userlist = []
    },
    disableGoogleAutoselect() {
      if (
        window &&
        window.google &&
        window.google.accounts &&
        window.google.accounts.id
      ) {
        try {
          console.log('Disable Google autoselect')
          window?.google?.accounts?.id?.disableAutoSelect()
        } catch (e) {
          console.log('Ignore Google autoselect error', e)
        }
      } else {
        console.log("Google not yet loaded so can't disable")
        setTimeout(this.disableGoogleAutoselect, 100)
      }
    },
    async logout() {
      const mobileStore = useMobileStore()

      await this.$api.session.logout()

      if (!mobileStore.isApp) {
        this.disableGoogleAutoselect()
      }

      if (mobileStore.isApp) {
        try {
          console.log('Try Facebook logout')
          const runtimeConfig = useRuntimeConfig()
          await SocialLogin.initialize({
            facebook: {
              appId: runtimeConfig.public.FACEBOOK_APPID,
              clientToken: runtimeConfig.public.FACEBOOK_CLIENTID,
            },
          })
          await SocialLogin.logout({ provider: 'facebook' })
          console.log('Facebook logout OK')
        } catch (e) {
          console.log('Ignore Facebook logout error', e)
        }

        try {
          console.log('Try Google logout')
          const runtimeConfig = useRuntimeConfig()
          await SocialLogin.initialize({
            google: {
              webClientId: runtimeConfig.public.GOOGLE_CLIENT_ID, // the web client id for Android and Web
              iOSClientId: runtimeConfig.public.GOOGLE_IOS_CLIENT_ID, // for iOS
            },
          })
          await SocialLogin.logout({ provider: 'google' })
          console.log('Google logout OK')
        } catch (e) {
          console.log('Ignore Google logout error', e)
        }

        this.logoutPushId()
      }
      // We are going to reset the store, but there are a few things we want to preserve.
      const loginCount = this.loginCount
      const config = this.config
      const api = this.$api
      const loggedInEver = this.loggedInEver
      this.$reset()
      this.loginCount = loginCount
      this.config = config
      this.loggedInEver = loggedInEver
      this.$api = api
    },
    async forget() {
      const { ret } = await this.$api.session.forget()
      await this.logout()
      return ret
    },
    async restore() {
      const { ret } = await this.$api.session.restore()
      await this.fetchUser()
      return ret
    },
    async login(params) {
      try {
        const res = await this.$api.session.login(params, function (data) {
          let logIt

          if (data && (data.ret === 2 || data.ret === 3)) {
            // Don't log errors for wrong email/password.
            logIt = false
          } else {
            logIt = true
          }

          return logIt
        })

        const { ret, status, persistent, jwt } = res

        if (ret === 0) {
          // Successful login.
          this.setAuth(jwt, persistent)

          // Login succeeded.  Get the user from the new API.
          await this.fetchUser()
        } else {
          // Login failed.
          throw new LoginError(ret, status)
        }
      } catch (e) {
        if (e.response?.data?.ret) {
          throw new LoginError(e.response?.data?.ret, e.response?.data?.status)
        } else {
          throw e
        }
      }

      this.loginCount++
    },
    async lostPassword(email) {
      let unknown = false
      let worked = false

      try {
        await this.$api.session.lostPassword(email, function (data) {
          let logIt

          if (data && data.ret === 2) {
            // Don't log errors if the email is not recognised.
            logIt = false
            unknown = true
          } else {
            logIt = true
          }

          return logIt
        })

        worked = true
      } catch (e) {
        console.log('Lost password error', e)
      }

      return { unknown, worked }
    },
    async unsubscribe(email) {
      let unknown = false
      let worked = false

      try {
        await this.$api.session.unsubscribe(email, function (data) {
          let logIt

          if (data && data.ret === 2) {
            // Don't log errors if the email is not recognised.
            logIt = false
            unknown = true
          } else {
            logIt = true
          }

          return logIt
        })

        worked = true
      } catch (e) {
        console.log('Unsubscribe error', e)
      }

      return { unknown, worked }
    },
    async signUp(params) {
      try {
        const res = await this.$api.user.signUp(params, false)
        const { ret, status, jwt, persistent } = res

        if (res.ret === 0) {
          this.forceLogin = false

          this.setAuth(jwt, persistent)

          // We need to fetch the user to get the groups, persistent token etc.
          await this.fetchUser()
        } else {
          // Register failed.
          throw new SignUpError(ret, status)
        }
      } catch (e) {
        console.log('exception', e?.response?.data)
        if (e?.response?.data?.ret === 2) {
          throw new SignUpError(2, e.response.data.status)
        } else {
          throw new SignUpError(
            e?.response?.data?.ret,
            e?.response?.data?.status
          )
        }
      }

      this.loginCount++
    },
    async fetchUser() {
      // We're so vain, we probably think this call is about us.
      let me = null
      let groups = null

      if (this.auth.jwt || this.auth.persistent) {
        // We have auth info.  The new API can authenticate using either the JWT or the persistent token.
        try {
          me = await this.$api.session.fetchv2(
            {
              webversion: this.config.public.BUILD_DATE,
            },
            false
          )
        } catch (e) {
          // Failed.  This can validly happen with a 404 if the JWT is invalid.
          console.log('Exception fetching user')
        }

        if (me) {
          groups = me.memberships
          delete me.memberships

          if (process.client) {
            // Check the old API.  Partly in case we need a JWT, partly to check we are
            // logged in on both.  No need to wait, though.
            this.$api.session
              .fetch({
                webversion: this.config.public.BUILD_DATE,
                components: ['me'],
              })
              .then((ret) => {
                let persistent = null
                let jwt = null

                if (ret) {
                  ;({ me, persistent, jwt } = ret)
                  if (me) {
                    if (!this.auth.jwt) {
                      this.setAuth(jwt, persistent)
                    }
                  } else {
                    // We are logged in on the v2 API but not the v1 API.  Force ourselves to be logged out,
                    // which will then force a login when required and sort this out.
                    console.error('Logged in on v2 API but not v1 API, log out')
                    this.setAuth(null, null)
                    this.setUser(null)
                  }
                }
              })
              .catch((e) => {
                // Need to catch this to prevent a Sentry error when we're logged out - which is a perfectly normal
                // case.
                console.log('Exception on old API', e)
              })
          }
        }
      }

      if (!me) {
        // Try the older API which will authenticate via the persistent token and PHP session.
        const ret = await this.$api.session.fetch({
          webversion: this.config.public.BUILD_DATE,
          components: ['me'],
        })

        let persistent = null
        let jwt = null

        if (ret) {
          ;({ me, persistent, jwt } = ret)

          if (me) {
            this.setAuth(jwt, persistent)
          }

          if (jwt) {
            // Now use the JWT on the new API.
            try {
              me = await this.$api.session.fetchv2({
                webversion: this.config.public.BUILD_DATE,
              })
            } catch (e) {
              console.log('exception')
            }

            if (me) {
              groups = me.memberships
              delete me.memberships
            }
          }
        }
      }

      if (me) {
        if (groups && groups.length) {
          this.groups = groups
        } else {
          // We asked for groups but got none, so we're not a member of any.
          this.groups = []
        }

        // Set the user, which will trigger various re-rendering if we were required to be logged in.
        this.setUser(me)

        await this.savePushId() // Tell server our mobile push notification id, if available

        const composeStore = useComposeStore()
        const email = composeStore.email

        if (me.email && email !== me.email) {
          // Save off our current email from the account for use in post composing.  Old values might be stuck
          // because persisted.
          composeStore.email = me.email
        }

        if (process.client) {
          // Sync marketing consent from local storage to user profile if needed
          const miscStore = useMiscStore()

          if (miscStore.marketingConsent !== undefined) {
            const localConsent = !!miscStore.marketingConsent
            console.log(
              'Local marketing consent',
              localConsent,
              'User marketing consent',
              me.marketingconsent
            )

            if (me.marketingconsent !== localConsent) {
              try {
                await this.$api.session.save({
                  marketingconsent: localConsent,
                })

                me.marketingconsent = localConsent
                console.log("Sync'd marketing consent")
              } catch (e) {
                console.log('Failed to sync marketing consent', e)
              }
            } else {
              console.log("Marketing consent already sync'd")
            }
          } else {
            console.log('No local marketing consent to sync')
          }
        }
      } else {
        // Any auth info must be invalid.
        this.setAuth(null, null)
        this.setUser(null)
      }

      this.loginStateKnown = true

      return this.user
    },
    async saveAboutMe(value) {
      const data = await this.$api.session.save({
        aboutme: value,
      })
      await this.fetchUser()
      return data
    },
    async saveEmail(params) {
      let data = null

      try {
        data = await this.$api.session.save(params, function (data) {
          let logIt

          if (data && data.ret === 10) {
            // Don't log errors for verification mails
            logIt = false
          } else {
            logIt = true
          }

          return logIt
        })

        await this.fetchUser()
      } catch (e) {
        console.log('Save email error', e.response)
        if (e?.response?.data?.ret === 10) {
          // Return the error code for the verification mail.
          data = e?.response?.data
        } else {
          throw e
        }
      }

      return data
    },
    async saveMicrovolunteering(value) {
      const data = await this.$api.user.save({
        id: this.user?.id,
        trustlevel: value,
      })
      await this.fetchUser()
      return data
    },
    async unbounce(id) {
      await this.$api.user.unbounce(id)
      this.user.bouncing = 0
    },
    async unbounceMT(id) {
      // ModTools - unbounce for another user
      await this.$api.user.unbounce(id)
    },
    async saveAndGet(params) {
      console.log('Save and get', params)
      await this.$api.session.save(params, function (data) {
        let logIt

        if (data && data.ret === 10) {
          // Don't log errors for verification mails
          logIt = false
        } else {
          logIt = true
        }

        return logIt
      })
      console.log('Saved')
      const user = await this.fetchUser()
      console.log('Fetched user', JSON.stringify(user))
      return user
    },
    async setGroup(params, nofetch) {
      await this.$api.memberships.update(params)

      if (!nofetch) {
        await this.fetchUser()
      }
    },
    async leaveGroup(userid, groupid) {
      await this.$api.memberships.leaveGroup({
        userid,
        groupid,
      })
      await this.fetchUser()
      return this.user
    },
    async joinGroup(userid, groupid, manual) {
      await this.$api.memberships.joinGroup({
        userid,
        groupid,
        manual,
      })
      await this.fetchUser()
      return this.user
    },
    async savePushId() {
      const mobileStore = useMobileStore()
      if (mobileStore.mobilePushId === null)
        console.log('******************* mobileStore.mobilePushId===null')
      // Tell server our push notification id if logged in
      if (
        this.user !== null &&
        typeof mobileStore.mobilePushId === 'string' &&
        mobileStore.mobilePushId.length > 0
      ) {
        if (mobileStore.acceptedMobilePushId !== mobileStore.mobilePushId) {
          const params = {
            notifications: {
              push: {
                type: mobileStore.isiOS ? 'FCMIOS' : 'FCMAndroid',
                subscription: mobileStore.mobilePushId,
                deviceuserinfo: mobileStore.deviceuserinfo,
              },
            },
          }
          const data = await this.$api.session.save(params)
          if (data.ret === 0) {
            mobileStore.acceptedMobilePushId = mobileStore.mobilePushId
            console.log('savePushId: saved OK')
          } else {
            // 1 === Not logged in
            console.log(
              'savePushId: Not logged in: OK will try again when signed in'
            )
          }
        }
      }
    },
    // Remember that we've logged out
    // It could tell the server to invalidate pushid
    // However we simply zap acceptedMobilePushId so it is sent when logged in
    logoutPushId() {
      // TODO
      const mobileStore = useMobileStore()
      mobileStore.acceptedMobilePushId = false
      console.log('logoutPushId')
    },
    async makeEmailPrimary(email) {
      await api(this.config).user.addEmail(this.user?.id, email, true)
      return await this.fetchUser()
    },
    async removeEmail(email) {
      if (this.user) {
        await api(this.config).user.removeEmail(this.user.id, email)
        await this.fetchUser()
      }
    },
    async yahooCodeLogin(code) {
      // ModTools
      return await this.$api.session.yahooCodeLogin(code)
    },
    async merge(params) {
      // ModTools - merge two user accounts
      await api(this.config).user.merge(
        params.email1,
        params.email2,
        params.id1,
        params.id2,
        params.reason
      )
    },
  },
  getters: {
    member: (state) => (id) => {
      if (state.user) {
        for (const group of state.groups) {
          if (parseInt(group.groupid) === parseInt(id)) {
            return group.role
          }
        }
      }

      return false
    },
  },
})
