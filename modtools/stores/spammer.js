import { defineStore } from 'pinia'
import api from '~/api'
import { fetchMe } from '~/composables/useMe'

export const useSpammerStore = defineStore({
  id: 'spammer',
  state: () => ({
    // Use array because we need to store them in the order returned by the server.
    list: [],

    // The context from the last fetch, used for fetchMore.
    context: null,

    // For spotting when we clear under the feet of an outstanding fetch
    instance: 1,
  }),
  actions: {
    init(config) {
      this.config = config
    },
    clear() {
      this.list = []
      this.context = null

      if (this.instance) {
        this.instance++
      } else {
        this.instance = 1
      }
    },

    async fetch(params) {
      // Watch out for the store being cleared under the feet of this fetch. If that happens then we throw away the
      // results.
      const instance = this.instance

      delete params.context
      if (this.context) {
        params['context[id]'] = this.context.id
      }

      const { spammers, context } = await api(this.config).spammers.fetch(
        params
      )
      if (this.instance === instance) {
        this.addAll(spammers)
        this.context = context
      }
    },

    addAll(items) {
      items.forEach((item) => {
        item.user.userid = item.user.id

        const existing = this.list.findIndex((obj) => {
          return parseInt(obj.id) === parseInt(item.id)
        })

        if (existing !== -1) {
          this.list[existing] = item
        } else {
          this.list.push(item)
        }
      })
    },
    removeFromList(itemid) {
      this.list = this.list.filter((obj) => {
        return parseInt(itemid) !== parseInt(obj.id)
      })
    },

    async report(params) {
      await api(this.config).spammers.add({
        userid: params.userid,
        collection: 'PendingAdd',
        reason: params.reason,
      })

      await fetchMe(true)
    },
    async confirm(params) {
      await api(this.config).spammers.patch({
        id: params.id,
        userid: params.userid,
        collection: 'Spammer',
      })

      await fetchMe(true)

      this.removeFromList(params.id)
    },

    async requestremove(params) {
      await api(this.config).spammers.add({
        id: params.id,
        userid: params.userid,
        collection: 'PendingRemove',
      })

      this.removeFromList(params.id)

      await fetchMe(true)
    },
    async remove(params) {
      await api(this.config).spammers.del({
        id: params.id,
        userid: params.userid,
      })

      await fetchMe(true)

      this.removeFromList(params.id)
    },
    async safelist(params) {
      await api(this.config).spammers.add({
        id: params.id,
        userid: params.userid,
        reason: params.reason,
        collection: 'Whitelisted',
      })

      await fetchMe(true)

      this.removeFromList(params.id)
    },

    async hold(params) {
      await api(this.config).spammers.patch({
        id: params.id,
        userid: params.userid,
        reason: params.reason,
        collection: 'PendingAdd',
        heldby: params.myid,
      })

      this.context = null

      this.fetch({
        collection: 'PendingAdd',
      })
    },

    async release(params) {
      // Omitting heldby results in NULL on server.
      await api(this.config).spammers.patch({
        id: params.id,
        userid: params.userid,
        reason: params.reason,
        collection: 'PendingAdd',
      })

      this.context = null

      this.fetch({
        collection: 'PendingAdd',
      })
    },
  },
  getters: {
    getList: (state) => (collection) => {
      return state.list.filter((s) => s.collection === collection)
    },

    getContext: (state) => () => {
      let ret = null

      if (state.context && state.context.id) {
        ret = state.context
      }

      return ret
    },
  },
})
