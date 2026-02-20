import { defineStore } from 'pinia'
import dayjs from 'dayjs'
import { nextTick } from 'vue'
import api from '~/api'
import { earliestDate, addStrings } from '~/composables/useTimeFormat'
import { useAuthStore } from '~/stores/auth'

export const useCommunityEventStore = defineStore({
  id: 'communityevent',
  state: () => ({
    list: {},
    forUser: [],
    forGroup: [],
  }),
  actions: {
    init(config) {
      this.config = config
      this.fetching = {}
    },
    clear() {
      this.list = {}
      this.forUser = []
      this.forGroup = []
    },
    async fetchPending() {
      // V2 pattern: get IDs of pending events, then fetch each individually.
      const ids =
        (await api(this.config).communityevent.list({ pending: true })) || []

      await Promise.all(ids.map((id) => this.fetch(id, true)))
    },
    async fetch(id, force) {
      try {
        if (force || !this.list[id]) {
          if (this.fetching[id]) {
            await this.fetching[id]
            await nextTick()
          } else {
            this.fetching[id] = api(this.config).communityevent.fetch(id, false)
            let item = await this.fetching[id]
            item = addStrings(item, true)

            // API returns dates in ISO8601 but our code wants them split into date and time
            if (item.dates) {
              item.earliestDate = earliestDate(item.dates)
              item.earliestDateOfAll = earliestDate(item.dates, true)
              item.dates.forEach((date, index) => {
                item.dates[index].starttime = dayjs(date.start).format('HH:mm')
                item.dates[index].start = dayjs(date.start).format('YYYY-MM-DD')
                item.dates[index].endtime = dayjs(date.end).format('HH:mm')
                item.dates[index].end = dayjs(date.end).format('YYYY-MM-DD')
              })
            }

            this.list[id] = item
            this.fetching[id] = null
          }
        }
      } catch (e) {
        console.log('Failed to fetch event', id, e)
      }

      return this.list[id]
    },
    async fetchList(id) {
      this.forUser = (await api(this.config).communityevent.list(id)) || []
    },
    async fetchGroup(id) {
      this.forGroup = await api(this.config).communityevent.listGroup(id)
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
      await api(this.config).communityevent.del(id)
      this.list[id] = null
    },
    async setDates(params) {
      const promises = []

      if (params.olddates) {
        for (const date of params.olddates) {
          promises.push(
            api(this.config).communityevent.removeDate(params.id, date.id)
          )
        }
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
    count: (state) => {
      const lastCommunityEvent =
        useAuthStore().user?.settings?.lastCommunityEvent || 0

      return state.forUser.filter((item) => {
        return item.id > lastCommunityEvent
      }).length
    },
  },
})
