import { defineStore } from 'pinia'
import dayjs from 'dayjs'
import api from '~/api'
import { earliestDate, addStrings } from '~/composables/useTimeFormat'

export const useCommunityEventStore = defineStore({
  id: 'communityevent',
  state: () => ({
    config: null,
    list: {},
    fetching: {},
    forUser: [],
  }),
  actions: {
    init(config) {
      this.config = config
    },
    async fetch(id, force) {
      if (force || !this.list[id]) {
        if (this.fetching[id]) {
          await this.fetching[id]
        } else {
          this.fetching[id] = api(this.config).communityevent.fetch(id)
          let item = await this.fetching[id]
          item = addStrings(item)
          item.earliestDate = earliestDate(item.dates)
          item.earliestDateOfAll = earliestDate(item.dates, true)
          this.list[id] = item
          this.fetching[id] = null
        }
      }

      return this.list[id]
    },
    async fetchList(id) {
      this.forUser = await api(this.config).communityevent.list(id)
    },
    async setPhoto(id, photoid) {
      await api(this.config).communityevent.setPhoto(id, photoid)
      await this.fetch(id, true)
    },
    async addGroup(id, groupid) {
      await api(this.config).communityevent.addGroup(id, groupid)
      await this.fetch(id, true)
    },
    async removeGroup(id, groupid) {
      await api(this.config).communityevent.removeGroup(id, groupid)
      await this.fetch(id, true)
    },
    async delete(id) {
      await api(this.config).address.del(id)
    },
    async setDates(params) {
      const promises = []

      for (const date of params.olddates) {
        promises.push(
          api(this.config).communityevent.removeDate(params.id, date.id)
        )
      }

      for (const date of params.newdates) {
        promises.push(
          api(this.config).communityevent.addDate(
            params.id,
            dayjs(date.start + ' ' + date.starttime).toISOString(),
            dayjs(date.end + ' ' + date.endtime).toISOString()
          )
        )
      }

      await Promise.all(promises)
      await this.fetch(params.id, true)
    },
    async add(data) {
      const id = await api(this.config).communityevent.add(data)

      if (id) {
        await this.fetch(id, true)
      }

      return id
    },
    async save(data) {
      await api(this.config).communityevent.save(data)
      await this.fetch(data.id, true)
    },
    async renew(id) {
      await api(this.config).communityevent.renew(id)
      await this.fetch(id, true)
    },
    async expire(id) {
      await api(this.config).communityevent.expire(id)
      await this.fetch(id, true)
    },
  },
  getters: {
    byId: (state) => (id) => {
      return state.list[id]
    },
  },
})
