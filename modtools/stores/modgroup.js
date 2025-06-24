import { defineStore } from 'pinia'
import { useAuthStore } from '~/stores/auth'
import { useGroupStore } from '~/stores/group'
import api from '~/api'

// authStore.work has total work counts across all group - re-got every 30s in modme->checkWork
// this.list has all mod groups, with group.work updated in getModGroups() ie on route change and every 30s

export const useModGroupStore = defineStore({
  id: 'modgroups',
  state: () => ({
    list: {},
    getting: [], // To avoid repeat gettings
    allGroups: {},
    received: false,
    sessionGroups: false,
    failedGroups: [],
  }),
  actions: {
    init(config) {
      this.config = config
      this.$api = api(config)
    },
    clear() {
      this.list = {}
      this.getting = []
      this.received = false
      this.failedGroups = []
    },
    // Called from default layout at every route change
    // And by modme->checkWork every 30s
    // Start by getting latest per-group work counts
    // Do not clear groups info but get any extra again
    async getModGroups() {
      try {
        // console.log('--- uMGS getModGroups A')

        // Get all base groups once - but clear if not logged in
        const groupStore = useGroupStore()
        const authStore = useAuthStore()
        // console.log('--- uMGS getModGroups AA', authStore.groups.length)
        if (authStore.groups.length === 0) {
          groupStore.clear()
          this.clear()
        }
        if (Object.keys(groupStore.list).length === 0) {
          await groupStore.fetch()
        }
        // console.log('--- uMGS getModGroups AAAA', Object.keys(groupStore.list).length)

        // Get work for each group
        // console.log('--- uMGS getModGroups B')
        const me = authStore.user
        this.sessionGroups = false
        if (me && me.id) {
          const ret = await this.$api.session.fetch({
            components: ['groups'],
          })
          if (ret && ret.groups) {
            // console.log('uMGS getModGroups work', ret.groups)
            this.sessionGroups = ret.groups

            for (const group of Object.values(this.list)) {
              const g = this.sessionGroups.find((g) => g.id === group.id)
              if (g && g.work) {
                group.work = g.work
              }
            }
          }
        }

        // console.log('--- uMGS getModGroups C')
        // Go through all our groups, load the full MT group info if need be.
        // Do not clear our store first: this.clear()
        this.getting = []
        for (const g of Object.values(authStore.groups)) {
          // console.log('--- uMGS getModGroups g', g.groupid)
          this.fetchIfNeedBeMT(g.groupid)
        }
      } catch (e) {
        console.error('getModGroups() fail', e.message)
      }
    },

    // Actually get full group infor for MT
    // Called by fetchIfNeedBeMT and when group needs reloading after changes
    async fetchGroupMT(id) {
      // console.error('uMGS fetchGroupMT', id)
      if (!id) {
        console.error('fetchGroupMT with zero id')
        return
      }
      // console.log('--- uMGS fetchGroupMT', id)
      const polygon = true
      const sponsors = true
      const showmods = true
      const tnkey = true

      const group = await api(this.config).group.fetchGroupMT(
        id,
        polygon,
        showmods,
        sponsors,
        tnkey
      )
      if (group) {
        if (!this.sessionGroups) {
          const ret = await this.$api.session.fetch({
            components: ['groups'],
          })
          if (ret && ret.groups) {
            this.sessionGroups = ret.groups
          }
        }
        // Get work and role from session info received when route first called in layout default.vue watch $route handler
        if (this.sessionGroups) {
          const g = this.sessionGroups.find((g) => g.id === group.id)
          if (g) {
            if (g.work) {
              group.work = g.work
            }
            if (g.role) {
              group.role = g.role
            }
          }
        }
        this.list[group.id] = group
      }
      const gettingix = this.getting.indexOf(id)
      if (gettingix !== -1) this.getting.splice(gettingix, 1)
      if (this.getting.length === 0) {
        this.received = true
      }
    },
    async listMT(params) {
      console.error('uMGS listMT implemented: getting allGroups')
      // console.trace()
      const groups = await api(this.config).group.listMT(params)
      // this.list = {}
      this.allGroups = {}
      if (groups) {
        groups.forEach((g) => {
          this.allGroups[g.id] = g
        })
      }
    },
    async fetchIfNeedBeMT(id) {
      // console.log('uMGS fetchIfNeedBeMT A', id)
      if (!id) return
      if (this.list[id]) return
      if (this.getting.includes(id)) {
        // console.log('uMGS fetchIfNeedBeMT B', id)
        const until = (predFn) => {
          const poll = (done) =>
            predFn() ? done() : setTimeout(() => poll(done), 100)
          return new Promise(poll)
        }
        const self = this
        await until(() => self.list[id]) // Wait until group has arrived
        // console.log('uMGS fetchIfNeedBeMT GOT', id)
        return
      }
      // console.error('uMGS fetchIfNeedBeMT CCC', id)
      this.getting.push(id)
      await this.fetchGroupMT(id)
    },

    async updateMT(params) {
      await api(this.config).group.patch(params)
      await this.fetchGroupMT(params.id)
    },
  },
  getters: {
    get: (state) => (id) => {
      // const idwas = id
      id = parseInt(id)
      if (!id) {
        // console.error('uMGS id not present', idwas)
        return null
      }
      const g = state.list[id] ? state.list[id] : null
      // console.log('uMGS get', id, g)
      // OK if not found initially as it should appear soon enough
      // if (!g) console.error('uMGS group not found for id', id)
      return g
    },
    getfromall: (state) => (id) => {
      if (!id) return null
      return state.allGroups[id] ? state.allGroups[id] : null
    },
  },
})
