import { defineStore } from 'pinia'
import api from '~/api'

export const useMemberStore = defineStore({
  id: 'member',
  state: () => ({
    list: [],
    // The context from the last fetch, used for fetchMore.
    context: null,
    // For spotting when we clear under the feet of an outstanding fetch
    instance: 1,
    ratings: [],
  }),
  actions: {
    init(config) {
      this.config = config
    },
    clear() {
      this.list = []
      this.context = null
      this.instance = 1
      this.ratings = []
    },
    async remove(params) {
      // Remove approved  member.
      await api(this.config).memberships.remove(params.userid, params.groupid)

      // TODO: Remove from list
      /*commit('remove', {
        userid: params.userid
      })*/

      /*dispatch(
        'auth/fetchUser',
        {
          components: ['work'],
          force: true
        },
        {
          root: true
        }
      )*/
    },
    async update( params) {
      const data = await api(this.config).memberships.update(params)
  
      if (!data.deleted) {
        // Fetch back the updated version.
        /* TODO await dispatch('fetch', {
          userid: params.userid,
          groupid: params.groupid
        })*/
      }
  
      return data
    },
  },
  getters: {
    /*get: (state) => (id) => {
      return state.listById(id)
    },
    getByUserId: (state) => (id) => {
      return null // TODO
    },*/
  },
})
