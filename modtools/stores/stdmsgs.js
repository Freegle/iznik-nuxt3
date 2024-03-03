import { defineStore } from 'pinia'
//import { nextTick } from 'vue'
//import api from '~/api'
// TODO

export const useStdmsgsStore = defineStore({
  id: 'stdmsgs',
  state: () => ({
    list: [],
    // The context from the last fetch, used for fetchMore.
    context: null,
  // For spotting when we clear under the feet of an outstanding fetch
    //instance: 1
    fetching: null,
  }),
  actions: {
    init(config) {
      this.config = config
    },
    async fetch(id, force) {
      /*if (id) {
        // Specific address which may or may not be ours.  If it's not, we'll get an error, which is a bug.  But we
        // also get an error if it's been deleted.  So don't log
        try {
          if (!this.listById[id] || force) {
            this.listById[id] = await api(this.config).address.fetchByIdv2(
              id,
              false
            )
          }
          return this.listById[id]
        } catch (e) {
          console.log('Failed to get address', e)
          return null
        }
      } else if (this.fetching) {
        await this.fetching
        await nextTick()
      } else {
        this.fetching = api(this.config).address.fetchv2()
        this.list = await this.fetching
        this.list = this.list || []

        this.list.forEach((address) => {
          this.listById[address.id] = address
        })

        this.fetching = null
      }*/
    },
    async delete(id) {
      /*await api(this.config).address.del(id)
      delete this.listById[id]
      await this.fetch()*/
    },
    /*async fetchProperties(postcodeid) {
      const { addresses } = await api(this.config).address.fetchv1({
        postcodeid,
      })

      addresses.forEach((address) => {
        this.properties[address.id] = address
      })
    },*/
    async update(params) {
      ///await api(this.config).address.update(params)
      //this.fetch(params.id, true)
    },
    async add(params) {
      return 0
      //const { id } = await api(this.config).address.add(params)
      //await this.fetch()
      //return id
    },
  },
  getters: {
    get: (state) => (id) => {
      return state.listById(id)
    },
  },
})
