import { defineStore } from 'pinia'
import axios from 'axios'
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

    // For APIv2
    jwt: null,

    // For APIv2,
    persistent: null,

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
        //
        // Save the persistent session token.
        this.persistent = persistent

        // Save the JWT, so that we can use the faster API next time.
        this.jwt = jwt

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

        // Save the persistent session token.
        this.persistent = persistent

        // Save the JWT, so that we can use the faster API next time.
        this.jwt = jwt

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

      if (this.jwt) {
        // We have a JWT which we can use with the new, faster API.
        try {
          me = await this.$api.session.fetchv2({})
        } catch (e) {
          console.log('exception')
        }

        if (me) {
          groups = me.memberships
          delete me.memberships
        } else {
          // Any JWT must be invalid.
          this.jwt = null
        }
      }

      if (!me) {
        // Fall back to the older API which will authenticate via the persistent token and PHP session.
        const ret = await this.$api.session.fetch({
          components: ['me'],
        })

        let persistent = null
        let jwt = null

        console.log('Old API', ret)
        if (ret) {
          ;({ me, persistent, jwt } = ret)

          if (me) {
            // Save the persistent session token.
            this.persistent = persistent

            // Save the JWT, so that we can use the faster API next time.
            this.jwt = jwt
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
            } else {
              // Any JWT must be invalid.
              this.jwt = null
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
