import { defineStore } from 'pinia'
import api from '~/api'

export const useGroupStore = defineStore({
  id: 'group',
  state: () => ({
    config: {},
    list: {},
    messages: {},
    allGroups: {},
    _remember: {},
    fetching: {},
  }),
  actions: {
    init(config) {
      this.config = config
    },
    async fetch(id, force) {
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
    async fetchMessages(id) {
      id = parseInt(id)
      const messages = await api(this.config).group.fetchMessages(id)

      if (messages) {
        this.messages[id] = messages
      }
    },
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
