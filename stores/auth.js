import { defineStore } from 'pinia'
import axios from 'axios'
import { LoginError, SignUpError } from '../api/BaseAPI'
import { useComposeStore } from '../stores/compose'
import api from '~/api'
import { useCookie } from '#imports'
import { mobilestate, pushstate } from '@/plugins/app-init'

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
              paths: [
                'jwt',
                'persistent',
                'userlist',
                'loginCount',
                'loggedInEver',
              ],
            },
          ],
  },
  state: () => ({
    config: null,

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

      // See if we have auth info in cookies.  This is useful to know early on during SSR because we can return
      // info to the client, which means we won't flicker from the logged out to logged in views.
      const jwt = useCookie('jwt')?.value
      if (!this.auth.jwt && jwt) {
        console.log('Got JWT cookie', jwt)
        this.auth.jwt = jwt
      }

      const persistent = useCookie('persistent')?.value
      if (!this.auth.persistent && persistent) {
        console.log('Got persistent cookie', persistent)
        this.auth.persistent = persistent
      }
    },
    setAuth(jwt, persistent) {
      this.auth.jwt = jwt
      this.auth.persistent = persistent

      if (process.client) {
        // Store the values in cookies.  This means they are accessible during SSR.
        const j = useCookie('jwt')
        const p = useCookie('persistent')
        j.value = jwt
        p.value = JSON.stringify(persistent)
      }
    },
    setUser(value) {
      if (value) {
        // Remember that we have successfully logged in at some point.
        this.loggedInEver = true
        this.user = value

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

          // Logged in as multiple users.  Let the server know.
          await this.$api.session.related(this.userlist)
        }
      }
    },
    clearRelated() {
      this.userlist = []
    },
    async logout() {
      try {
        console.log('Disable Google autoselect')
        window?.google?.accounts?.id?.disableAutoSelect()
      } catch (e) {
        console.log('Ignore Google autoselect error', e)
      }

      this.logoutPushId() // CC

      await this.$api.session.logout()

      // We are going to reset the store, but there are a few things we want to preserve.
      const loginCount = this.loginCount
      const config = this.config
      const api = this.$api
      this.$reset()
      this.loginCount = loginCount
      this.config = config
      this.$api = api
    },
    async forget() {
      const { ret } = await this.$api.session.forget()
      await this.logout()
      return ret
    },
    async login(params) {
      const res = await this.$api.session.login(params)
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

      this.loginCount++
    },
    async lostPassword(params) {
      const runtimeConfig = useRuntimeConfig()
      const api = runtimeConfig.APIv1

      const res = await axios.post(api + '/session', {
        action: 'LostPassword',
        email: params.email,
      })

      return res
    },
    async unsubscribe(params) {
      const runtimeConfig = useRuntimeConfig()
      const api = runtimeConfig.APIv1

      const res = await axios.post(api + '/session', {
        action: 'Unsubscribe',
        email: params.email,
      })

      return res.data
    },
    async signUp(params) {
      const runtimeConfig = useRuntimeConfig()
      const api = runtimeConfig.APIv1

      const res = await axios.put(api + '/user', params)
      const { ret, status, jwt, persistent } = res.data

      if (res.status === 200 && res.data.ret === 0) {
        this.forceLogin = false

        this.setAuth(jwt, persistent)

        // We need to fetch the user to get the groups, persistent token etc.
        await this.fetchUser()
      } else {
        // Register failed.
        throw new SignUpError(ret, status)
      }

      this.loginCount++
    },
    async fetchUser() {
      // We're so vain, we probably think this call is about us.
      let me = null
      let groups = null

      console.log('Consider got auth')
      if (this.auth.jwt || this.auth.persistent) {
        console.log('Got auth')
        // We have auth info.  The new API can authenticate using either the JWT or the persistent token.
        try {
          me = await this.$api.session.fetchv2({})
          console.log('Done fetchv2')
        } catch (e) {
          // Failed.  This can validly happen with a 404 if the JWT is invalid.
          console.log('Exception fetching user')
        }

        if (me) {
          groups = me.memberships
          delete me.memberships
        }
      }

      if (!me) {
        // Try the older API which will authenticate via the persistent token and PHP session.
        console.log('Try older')
        const ret = await this.$api.session.fetch({
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
              me = await this.$api.session.fetchv2({})
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

        await this.savePushId() // Tell server our mobile push notification id, if available // CC

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
      const data = await this.$api.session.save(params)
      await this.fetchUser()
      return data
    },
    async unbounce(id) {
      await this.$api.user.unbounce(id)
      this.user.bouncing = 0
    },
    async saveAndGet(params) {
      await this.$api.session.save(params)
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
    async joinGroup(userid, groupid) {
      await this.$api.memberships.joinGroup({
        userid,
        groupid,
      })
      await this.fetchUser()
      return this.user
    },
    async addRelatedUserUser(params) {
      this.addRelatedUser(params.id)

      if (this.userlist.length > 1) {
        // Logged in as multiple users.  Let the server know.
        await this.$api.session.related(this.userlist)
      }
    },
    async savePushId(){ // CC
      // Tell server our push notification id if logged in
      if( this.user !== null) {
        if (pushstate.acceptedMobilePushId !== pushstate.mobilePushId) {
          console.log('sending mobilePushId', pushstate.mobilePushId)
          const params = {
            notifications: {
              push: {
                type: mobilestate.isiOS ? 'FCMIOS' : 'FCMAndroid',
                subscription: pushstate.mobilePushId
              }
            }
          }
          const data = await this.$api.session.save(params)
          if (data.ret === 0) {
            pushstate.acceptedMobilePushId = pushstate.mobilePushId
            console.log('savePushId: saved OK')
          } else { // 1 === Not logged in
            console.log('savePushId: Not logged in: OK will try again when signed in')
          }
        }
      }
    },
    // Remember that we've logged out
    // It could tell the server to invalidate pushid
    // However we simply zap acceptedMobilePushId so it is sent when logged in
    logoutPushId() { // TODO
      pushstate.acceptedMobilePushId = false
      console.log('logoutPushId')
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
