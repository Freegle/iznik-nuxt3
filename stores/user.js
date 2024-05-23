import { defineStore } from 'pinia'
import { nextTick } from 'vue'
import api from '~/api'

export const useUserStore = defineStore({
  id: 'user',
  state: () => ({
    list: {},
    locationList: {},
  }),
  actions: {
    init(config) {
      this.config = config
      this.fetching = {}
      this.fetchingLocation = {}
    },
    clear() { // ModTools
      this.list = {}
      this.locationList = {}
      this.fetching = {}
      this.fetchingLocation = {}
    },
    async emailIsInUse(email) {
      const ret = await api(this.config).user.fetchByEmail(email, false)
      return ret?.user?.id
    },
    async fetchMT(params){
      const { user, users } = await api(this.config).user.fetchMT(params)
      if( user){
        console.log("Got ONE users",user.id)
        this.list[user.id] = user
      }
      if( users){
        console.log("Got MANY users",users.length)
        for( const user of users){
          console.log("user.id",user.id)
          this.list[user.id] = user
        }
      }
    },
    async fetch(id, force) {
      id = parseInt(id)

      if (force || !this.list[id]) {
        if (this.fetching[id]) {
          await this.fetching[id]
          await nextTick()
        } else {
          this.fetching[id] = api(this.config).user.fetch(id)
          const user = await this.fetching[id]

          if (user) {
            this.list[id] = user
          }

          this.fetching[id] = null
        }
      }

      return this.list[id]
    },
    async fetchPublicLocation(id, force) {
      id = parseInt(id)

      if (force || !this.locationList[id]) {
        if (this.fetchingLocation[id]) {
          await this.fetchingLocation[id]
          await nextTick()
        } else {
          this.fetchingLocation[id] = api(this.config).user.fetchPublicLocation(
            id
          )
          const location = await this.fetchingLocation[id]

          if (location) {
            this.locationList[id] = location
          }

          this.fetchingLocation[id] = null
        }
      }

      return this.locationList[id]
    },
    async rate(id, rating, reason, text) {
      await api(this.config).user.rate(id, rating, reason, text)
      await this.fetch(id, true)
    },
    async engaged(engageid) {
      await api(this.config).user.engaged(engageid)
    },
  },
  getters: {
    byId: (state) => {
      return (id) => state.list[id]
    },
    publicLocationById: (state) => {
      return (id) => state.locationList[id]
    },
  },
})
