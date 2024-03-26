import { defineStore } from 'pinia'
import { nextTick } from 'vue'
import api from '~/api'

export const useTeamStore = defineStore({
  id: 'team',
  state: () => ({
    all: [],
    list: {},
  }),
  actions: {
    init(config) {
      this.config = config
      this.fetching = {}
    },
    async fetch(team) {
      if (!team) {
        this.all = await api(this.config).team.fetch()
        return
      }
      if (team in this.fetching) {
        await this.fetching[team]
        await nextTick()
      } else {
        this.fetching[team] = api(this.config).team.fetch({
          name: team,
        })
        this.list[team] = await this.fetching[team]
        delete this.fetching[team]
      }

      return this.list[team]
    },
    async add(params){
      await api(this.config).team.add(params)
    },
    async remove(params){
      await api(this.config).team.remove(params)
    }
  },
  getters: {
    get: (state) => (team, id) => {
      return state.list.find((i) => i.id === id)
    },
    getTeam: (state) => (team) => {
      return state.list[team]
    },
  },
})
