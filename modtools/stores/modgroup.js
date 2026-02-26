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
        // Get all base groups once - but clear if not logged in
        const groupStore = useGroupStore()
        const authStore = useAuthStore()

        // If user has changed then clear groupStore
        if (authStore.groups.length === 0) {
          groupStore.clear()
          this.clear()
        }
        // Get ALL groups into base groupStore once
        if (Object.keys(groupStore.summaryList).length === 0) {
          console.log('getModGroups fetch ALL base groups')
          await groupStore.fetch()
          console.log('getModGroups fetched ALL base groups')
        }

        // Get per-group work counts and update groups
        const me = authStore.user
        this.sessionGroups = authStore.groups || false
        if (me && me.id) {
          try {
            const workData = await this.$api.group.fetchWork()
            if (workData && Array.isArray(workData)) {
              // Update work for each of our groups
              for (const group of Object.values(this.list)) {
                const w = workData.find((w) => w.groupid === group.id)
                if (w) {
                  group.work = w
                }
              }
            }
          } catch (e) {
            console.error('Failed to fetch group work counts', e.message)
          }
        }

        // Go through all my groups, load the full MT group info if need be.
        // Do not clear our store first: this.clear()
        // this.getting = []
        for (const g of Object.values(authStore.groups)) {
          this.fetchIfNeedBeMT(g.groupid)
        }
      } catch (e) {
        console.error('getModGroups() fail', e.message)
      }
    },

    // Actually get full group info for MT
    // Called by fetchIfNeedBeMT and when group needs reloading after changes
    async fetchGroupMT(id) {
      if (!id) {
        console.error('fetchGroupMT with zero id')
        return
      }
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
        // Set group role from auth store's groups (V2 session memberships).
        const authStore = useAuthStore()
        if (!this.sessionGroups) {
          this.sessionGroups = authStore.groups || []
        }
        if (this.sessionGroups) {
          const g = this.sessionGroups.find(
            (g) => g.groupid === group.id || g.id === group.id
          )
          if (g) {
            if (g.role) {
              group.role = g.role
            }
          }
        }

        // Fetch per-group work counts if not already populated.
        if (!group.work) {
          try {
            const workData = await this.$api.group.fetchWork()
            if (workData && Array.isArray(workData)) {
              const w = workData.find((w) => w.groupid === group.id)
              if (w) {
                group.work = w
              }
            }
          } catch (e) {
            // Non-fatal — work counts are supplementary.
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
      console.log('uMGS listMT implemented: getting allGroups')
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
      if (!id) return
      if (this.list[id]) return
      if (this.getting.includes(id)) {
        const until = (predFn) => {
          const poll = (done) =>
            predFn() ? done() : setTimeout(() => poll(done), 100)
          return new Promise(poll)
        }
        const self = this
        await until(() => self.list[id]) // Wait until group has arrived
        return
      }
      this.getting.push(id)
      // Potential speed up could be using the base groups until modGroupStore populated
      // const groupStore = useGroupStore()
      // const basegroup = groupStore.get(id)
      // console.log('fINB',id, basegroup, basegroup?.role)
      // if( basegroup){
      //  this.list[id] = basegroup
      // }
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
