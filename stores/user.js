import { defineStore } from 'pinia'
import { nextTick } from 'vue'
import { useMiscStore } from '~/stores/misc'
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
    clear() {
      // ModTools
      console.log('uUS clear')
      this.list = {}
      this.locationList = {}
      this.fetching = {}
      this.fetchingLocation = {}
    },
    async emailIsInUse(email) {
      const ret = await api(this.config).user.fetchByEmail(email, false)
      return ret?.user?.id
    },
    async fetchMT(params) {
      if (!params.id && !params.search) {
        console.log('useUserStore params id and search not set')
        console.trace()
        return
      }
      if (typeof params.search === 'number') {
        params.search = params.search.toString()
      }
      // id, info, search, emailhistory
      params.info = true
      const { user, users } = await api(this.config).user.fetchMT(params)
      if (user) {
        this.list[user.id] = user
        return user
      }
      if (users) {
        for (const user of users) {
          this.list[user.id] = user
        }
        return users
      }
    },
    async fetch(id, force) {
      id = parseInt(id)
      if (isNaN(id)) {
        console.log('USEUSERSTORE FETCH ID NULL')
        console.trace()
        return
      }
      const miscStore = useMiscStore()
      if (miscStore.modtools) {
        await this.fetchMT({
          id,
          info: true,
          emailhistory: true,
        })
        return this.list[id]
      }

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
    async muteOnChitChat(userid) {
      await api(this.config).user.muteOnChitChat(userid)
    },
    async unMuteOnChitChat(userid) {
      await api(this.config).user.unMuteOnChitChat(userid)
    },
    async deleteComment(id) {
      await api(this.config).comment.del(id)
    },
    async saveComment(comment) {
      await api(this.config).comment.save(comment)
    },
    async edit(params) {
      await api(this.config).user.save(params)
    },
    async addEmail(params) {
      await api(this.config).user.addEmail(
        params.id,
        params.email,
        params.primary
      )
      await this.fetch(params.id, true)
    },
    async add(params) {
      const ret = await api(this.config).user.add(params.email)
      return ret.id
    },
    async purge(id) {
      await api(this.config).user.purge(id)
    },
    async ratingReviewed(params) {
      await api(this.config).user.ratingReviewed(params.id)
    },
  },
  getters: {
    byId: (state) => {
      return (id) => {
        if (!id) return null
        const user = state.list[id]
        if (user && user.spammer && user.spammer.collection === 'Whitelisted')
          user.spammer = false
        return user
      }
    },
    publicLocationById: (state) => {
      return (id) => state.locationList[id]
    },
  },
})
