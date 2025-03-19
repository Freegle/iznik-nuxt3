import cloneDeep from 'lodash.clonedeep'
import { useAuthStore } from '~/stores/auth'
import { defineStore } from 'pinia'
import api from '~/api'

export const useModGroupStore = defineStore({
  id: 'modgroups',
  state: () => ({
    list: {},
  }),
  actions: {
    init(config) {
      this.config = config
      this.$api = api(config)
    },
    clear() {
      this.list = {}
    },
    async getModGroups() {
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


      this.clear()
      for (const g of myGroups) {
        await this.fetchGroupMT(g.id)
      }
    },
    async fetchGroupMT(id) {
      if (typeof id !== 'number') {
        console.error('fetchGroupMT has duff parameters')
        return null
      }
      //console.log('--- uMGS fetchGroupMT', id)
      const polygon = true
      const sponsors = true
      const showmods = true
      const tnkey = true

      const group = await api(this.config).group.fetchMT(id, polygon, showmods, sponsors, tnkey)
      if (group) {
        this.list[group.id] = group
      }
      //console.log('=== uMGS fetchGroupMT',group!==null)
    },
    async listMT(params) {
      console.error('uMGS listMT not implemented')
      /*const groups = await api(this.config).group.listMT(params)
      this.list = {}
      this.allGroups = {}
      if (groups) {
        groups.forEach((g) => {
          this.allGroups[g.nameshort.toLowerCase()] = g
          this.list[g.id] = g
        })
      }*/
    },
    async fetchMT({ id, polygon, showmods, sponsors, tnkey }) {
      console.log('TODO useModGroupStore fetchMT', id)
      if (!id) return null
      polygon = Object.is(polygon, undefined) ? false : polygon
      sponsors = Object.is(sponsors, undefined) ? false : sponsors
      showmods = Object.is(showmods, undefined) ? false : showmods
      tnkey = Object.is(tnkey, undefined) ? true : tnkey // Always get tnkey

      const group = await api(this.config).group.fetchMT(
        id,
        polygon,
        showmods,
        sponsors,
        tnkey
        /*,
        function (data) {
          console.log('fetchMT log',data?.ret)
          if (data && data.ret === 10) {
            // Not hosting a group isn't worth logging.
            return false
          } else {
            return true
          }
        }*/
      )
      if (group) {
        this.list[group.id] = group

        const ret = await api(this.config).session.fetch({
          webversion: this.config.public.BUILD_DATE,
          components: ['groups'],
        })
        if (ret && ret.groups) {
          const g = ret.groups.find((g) => g.id === group.id)
          if (g && g.work) {
            //console.log('useGroupStore g.work',g.work)
            this.list[group.id].work = g.work
          }
        }
      }
    },
    async updateMT(params) {
      console.log('useModGroupStore updateMT', params)
      await api(this.config).group.patch(params)
      await this.fetchMT({
        id: params.id,
        polygon: true
      })
    },
  },
  getters: {
    get: (state) => (id) => {
      id = parseInt(id)
      if (!id) return null
      //const g = state.list[id] ? state.list[id] : null
      //console.log('uMGS get', id, g)
      return state.list[id] ? state.list[id] : null
    }
  }
})
