import { defineStore } from 'pinia'
import { nextTick } from 'vue'
import api from '~/api'

export const useGroupStore = defineStore({
  id: 'group',
  state: () => ({
    list: {},
    messages: {},
    allGroups: {},
    _remember: {},
  }),
  actions: {
    init(config) {
      this.config = config
      this.fetching = {}
    },
    
    async listMT(params){
      const groups = await api(this.config).group.listMT(params)
      this.list = {}
      this.allGroups = {}
      if (groups) {
        groups.forEach((g) => {
          this.allGroups[g.nameshort.toLowerCase()] = g
          this.list[g.id] = g
        })
      }
  },

    async fetchMT({ id, polygon, showmods, sponsors, tnkey }) {
      console.log('useGroupStore fetchMT', id)
      if (!id) return null
      polygon = Object.is(polygon, undefined) ? false : polygon
      sponsors = Object.is(sponsors, undefined) ? false : sponsors
      showmods = Object.is(showmods, undefined) ? false : showmods
      tnkey = Object.is(tnkey, undefined) ? false : tnkey

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
          const g = ret.groups.find((g)=> g.id===group.id)
          if( g && g.work){
            this.list[group.id].work = g.work
          }
        }
      }
    },
    async updateMT(params) {
      console.log('updateMT TODO')
      /*await api(this.config).group.patch(params)
      await this.fetchMT({
        id: params.id,
        polygon: true
      })*/
    },


      async fetch(id, force) {
        console.log('useGroupStore fetch', id)
        if (id) {
        if (isNaN(id)) {
          // Get by name.  Case-insensitive.
          id = id.toLowerCase()

          if (!this.allGroups[id]) {
            // Fetch all the groups.
            const groups = await api(this.config).group.list()

            if (groups) {
              groups.forEach((g) => {
                this.allGroups[g.nameshort.toLowerCase()] = g
              })
            }
          }

          if (!this.allGroups[id]) {
            return null
          }

          id = this.allGroups[id].id
        }

        id = parseInt(id)

        // If we don't have the settings, then we only have the copy of group data from list(), not the whole thing.
        if (force || !this.list[id] || !this.list[id].settings) {
          if (this.fetching[id]) {
            // Already fetching
            await this.fetching[id]
            await nextTick()
          } else {
            this.fetching[id] = api(this.config).group.fetch(
              id,
              function (data) {
                if (data && data.ret === 10) {
                  // Not hosting a group isn't worth logging.
                  return false
                } else {
                  return true
                }
              }
            )

            const group = await this.fetching[id]
            this.fetching[id] = null

            if (group) {
              this.list[group.id] = group
            }
          }
        }

        return this.list[id]
      } else {
        // Fetching all groups.
        const groups = await api(this.config).group.list()

        if (groups) {
          groups.forEach((g) => {
            this.allGroups[g.nameshort.toLowerCase()] = g
            this.list[g.id] = g
          })
        }
      }
    },
    remember(id, val) {
      this._remember[id] = val
    },
    async fetchMessagesForGroup(id) {
      id = parseInt(id)
      const messages = await api(this.config).group.fetchMessagesForGroup(id)

      if (messages) {
        this.messages[id] = messages
      }
    },
    async confirmAffiliation(params) {
      await api(this.config).group.patch({
        id: params.id,
        affiliationconfirmed: new Date().toISOString()
      })
      await this.fetch(params.id)
    }
  },
  getters: {
    get: (state) => (idOrName) => {
      let ret = null

      if (!isNaN(idOrName)) {
        // Numeric - find by id
        idOrName = parseInt(idOrName)
        return state.list[idOrName] ? state.list[idOrName] : null
      } else {
        // Not - scan for match
        const lower = (idOrName + '').toLowerCase()

        Object.keys(state.list).forEach((key) => {
          const group = state.list[key]
          if (group) {
            if (group.nameshort.toLowerCase() === lower) {
              ret = group
            }
          }
        })
      }

      return ret
    },
    getMessages: (state) => (id) => {
      if (id in state.messages) {
        return state.messages[id]
      } else {
        return []
      }
    },
    remembered: (state) => (id) => state._remember[id],
  },
})
