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
  }),
  actions: {
    init(config) {
      this.config = config
    },
    async fetch(id, force) {
      if (isNaN(id)) {
        // Get by name.  Case-insensitive.
        id = id.toLowerCase()

        if (!this.allGroups[id]) {
          // Fetch all the groups.
          const groups = await api(this.config).group.list()

          groups.forEach((g) => {
            this.allGroups[g.nameshort.toLowerCase()] = g
          })
        }

        if (!this.allGroups[id]) {
          return null
        }

        id = this.allGroups[id].id
      }

      id = parseInt(id)

      if (force || !this.list[id]) {
        const group = await api(this.config).group.fetch(id, function (data) {
          if (data && data.ret === 10) {
            // Not hosting a group isn't worth logging.
            return false
          } else {
            return true
          }
        })

        if (group) {
          this.list[group.id] = group
        }
      }

      return this.list[id]
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
