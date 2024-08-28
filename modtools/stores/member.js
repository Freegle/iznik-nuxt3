import cloneDeep from 'lodash.clonedeep'
import { defineStore } from 'pinia'
import api from '~/api'

export const useMemberStore = defineStore({
  id: 'member',
  state: () => ({
    list: {},
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
      this.list = {}
      this.context = null
      this.instance = 1
      this.ratings = []
    },
    async fetchMembers(params) {
      let received = 0
      // Watch out for the store being cleared under the feet of this fetch. If that happens then we throw away the
      // results.
      const instance = this.instance
  
      if (!params.context) {
        params.context = this.context
      }
      if (params.context) {
        // Ensure the context is a real object, in case it has been in the store.
        params.context = cloneDeep(params.context)
      }
  
      const {
        members,
        context,
        ratings
      } = await api(this.config).memberships.fetchMembers(params)
  
      if (this.instance === instance) {
        for (let i = 0; i < members.length; i++) {
          // The server doesn't return the collection but this is useful to have in the store.
          members[i].collection = params.collection
        }
        received += members.length
        members.forEach(member => {
          this.list[member.id] = member
        })
  
        if (ratings && ratings.length) {
          this.ratings = ratings
        }
  
        this.context = context
      }
      return received
    },
    async fetch(params) {
      // Don't log errors on fetches of individual members
      console.log('useMemberStore fetch',params)
      const { member } = await api(this.config).memberships.fetch(params)
      //const { member } = await this.$api.memberships.fetch(params, data => {
      //  return data.ret !== 3
      //})
      this.list[member.id] = member
    },
  
    async remove(params) {
      // Remove approved member.
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
    all: (state) => Object.values(state.list),
    getByGroup: (state) => (groupid) => {
      const ret = Object.values(state.list).filter(member => {
        return parseInt(member.groupid) === parseInt(groupid)
      })
      return ret
    },
  },
})
