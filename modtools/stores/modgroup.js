import cloneDeep from 'lodash.clonedeep'
import { defineStore } from 'pinia'
import { useAuthStore } from '~/stores/auth'
import { useGroupStore } from '~/stores/group'
import api from '~/api'

export const useModGroupStore = defineStore({
  id: 'modgroups',
  state: () => ({
    list: {},
    getting: [], // To avoid repeat gettings
    allGroups: {},
    received: false,
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
    },
    getModGroups() {
      // Do not clear groups info but (start to) get all again
      // console.log('--- uMGS getModGroups')
      const authStore = useAuthStore()
      const me = authStore.user
      let myGroups = []

      if (me) {
        myGroups = authStore.groups.map((g) => {
          // Memberships have an id of the membership whereas we want the groups to have the id of the group.
          const g2 = cloneDeep(g)
          g2.id = g.groupid
          delete g2.groupid
          return g2
        })

        // Sort by namedisplay case insensitive
        myGroups.sort((a, b) => {
          const aName = a.namedisplay.toLowerCase()
          const bName = b.namedisplay.toLowerCase()
          return aName < bName ? -1 : aName > bName ? 1 : 0
        })
      }

      // this.clear()
      this.getting = []
      const self = this
      for (const g of myGroups) {
        this.getting.push(g.id)
      }
      for (const g of myGroups) {
        this.fetchGroupMT(g.id) // This returns immediately so non-blocking
      }
      // console.log('--- uMGS getModGroups DONE', this.getting)
    },

    // Called by getModGroups at page mount to get mod's groups
    // Also called if need be fetchIfNeedBeMT
    // And called to reload after any changes
    // (still may have duplicate requests at page start if fetchIfNeedBeMT too quick)
    async fetchGroupMT(id) {
      if (!id) {
        console.error('fetchGroupMT with zero id')
        return
      }
      const groupStore = useGroupStore()
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
        const ret = await api(this.config).session.fetch({
          webversion: this.config.public.BUILD_DATE,
          components: ['groups'],
        })
        if (ret && ret.groups) {
          const g = ret.groups.find((g) => g.id === group.id)
          if (g && g.work) {
            // console.log('useGroupStore g.work',g.work)
            group.work = g.work
          }
        }
        this.list[group.id] = group
        groupStore.list[group.id] = group // Set in root group store as well
      }
      // console.log('=== uMGS fetchGroupMT', id, group !== null)
      const gettingix = this.getting.indexOf(id)
      if (gettingix !== -1) this.getting.splice(gettingix, 1)
      if (this.getting.length === 0) {
        this.received = true
      }
    },
    async listMT(params) {
      console.log('uMGS listMT implemented: getting allGroups')
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
        // console.error('uMGS fetchIfNeedBeMT getting', id)
        const until = (predFn) => {
          const poll = (done) =>
            predFn() ? done() : setTimeout(() => poll(done), 100)
          return new Promise(poll)
        }
        const self = this
        await until(() => self.list[id]) // Wait until group has arrived
        // console.error('uMGS fetchIfNeedBeMT GOT', this.list[id])
        return
      }
      // console.error('uMGS fetchIfNeedBeMT get', id)
      this.getting.push(id)
      await this.fetchGroupMT(id)
    },

    async updateMT(params) {
      // console.log('useModGroupStore updateMT', params)
      await api(this.config).group.patch(params)
      await this.fetchGroupMT(params.id)
    },
  },
  getters: {
    get: (state) => (id) => {
      const idwas = id
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
