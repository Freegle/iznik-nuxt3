import { defineStore } from 'pinia'
import api from '~/api'

export const useGroupStore = defineStore({
  id: 'group',
  state: () => ({
    list: {},
    _remember: {},
  }),
  actions: {
    async fetch(id) {
      id = parseInt(id)
      console.log('Fetch', id, api())
      this.list[id] = await api().group.fetch(
        id,
        true,
        true,
        true,
        true,
        function (data) {
          if (data && data.ret === 10) {
            // Not hosting a group isn't worth logging.
            return false
          } else {
            return true
          }
        }
      )
    },
    remember(id, val) {
      this._remember[id] = val
    },
  },
  getters: {
    get: (state) => (idOrName) => {
      console.log('Get group', idOrName, state.list)
      let ret = null

      if (!isNaN(idOrName)) {
        // Numeric - find by id
        idOrName = parseInt(idOrName)
        console.log(
          'Find by id',
          state.list[idOrName] ? 'present' : 'absent',
          state.list[idOrName]
        )
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
    remembered: (state) => (id) => state._remember[id],
  },
})
