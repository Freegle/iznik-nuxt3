import { defineStore } from 'pinia'
import { LoginError, SignUpError } from '../api/BaseAPI'
import { useComposeStore } from '../stores/compose'
import api from '~/api'

export const useAuthStore = defineStore({
  id: 'auth',
  persist: {
    enabled: true,
    strategies:
      typeof localStorage === 'undefined'
        ? []
        : [
            {
              storage: localStorage,

              // We don't persist much about the user, to avoid data getting 'stuck'.  All we need is enough to log us
              // in, and information about which users have been used on this device.
              paths: ['auth', 'userlist', 'loginCount', 'loggedInEver'],
            },
          ],
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
      await this.$api.session.logout()

      this.disableGoogleAutoselect()

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
        console.log('exception', e.response.data)
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

        const composeStore = useComposeStore()
        const email = composeStore.email

        if (me.email && email !== me.email) {
          // Save off our current email from the account for use in post composing.  Old values might be stuck
          // because persisted.
          composeStore.email = me.email
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
    async saveAndGet(params) {
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
      await this.fetchUser()
      return this.user
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
    async makeEmailPrimary(email) {
      await api(this.config).user.addEmail(this.user?.id, email, true)
      return await this.fetchUser()
    },
    async yahooCodeLogin(code) {
      return await this.$api.session.yahooCodeLogin(code)
    },
    async removeEmail(email) {
      if (this.user) {
        await api(this.config).user.removeEmail(this.user.id, email)
        await this.fetchUser()
      }
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
