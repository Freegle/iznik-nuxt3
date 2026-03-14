import { defineStore } from 'pinia'
import dayjs from 'dayjs'
import { nextTick } from 'vue'
import api from '~/api'
import { addStrings, earliestDate } from '~/composables/useTimeFormat'
import { useAuthStore } from '~/stores/auth'

export const useVolunteeringStore = defineStore({
  id: 'volunteering',
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
      // V2 pattern: get IDs of pending volunteering, then fetch each individually.
      const ids =
        (await api(this.config).volunteering.list({ pending: true })) || []

      await Promise.all(ids.map((id) => this.fetch(id, true)))
    },
    async fetch(id, force) {
      try {
        if (force || !this.list[id]) {
          if (this.fetching[id]) {
            await this.fetching[id]
            await nextTick()
          } else {
            this.fetching[id] = api(this.config).volunteering.fetch(id, false)
            let item = await this.fetching[id]
            item = addStrings(item, false)

            if (item.dates) {
              // API returns dates in ISO8601 but our code wants them split into date and time
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
        console.log('Failed to fetch volunteering', id, e)
      }

      return this.list[id]
    },
    async fetchList(id) {
      this.forUser = (await api(this.config).volunteering.list(id)) || []
    },
    async fetchGroup(id) {
      this.forGroup = await api(this.config).volunteering.listGroup(id)
    },
    async setPhoto(id, photoid) {
      await api(this.config).volunteering.setPhoto(id, photoid)
      await this.fetch(id, true)
    },
    async addGroup(id, groupid) {
      await api(this.config).volunteering.addGroup(id, groupid)
      await this.fetch(id, true)
    },
    async removeGroup(id, groupid) {
      await api(this.config).volunteering.removeGroup(id, groupid)
      await this.fetch(id, true)
    },
    async delete(id) {
      await api(this.config).volunteering.del(id)
      delete this.list[id]
    },
    remove(id) {
      delete this.list[id]
    },
    async setDates(params) {
      const promises = []

      if (params.olddates) {
        for (const date of params.olddates) {
          promises.push(
            api(this.config).volunteering.removeDate(params.id, date.id)
          )
        }
      }

      if (params.newdates) {
        for (const date of params.newdates) {
          promises.push(
            api(this.config).volunteering.addDate(
              params.id,
              date.start,
              date.end
            )
          )
        }
      }

      await Promise.all(promises)
      await this.fetch(params.id, true)
    },
    async add(data) {
      const id = await api(this.config).volunteering.add(data)

      if (id) {
        await this.fetch(id, true)
      }

      return id
    },
    async save(data) {
      await api(this.config).volunteering.save(data)
      await this.fetch(data.id, true)
    },
    async renew(id) {
      await api(this.config).volunteering.renew(id)
      await this.fetch(id, true)
    },
    async expire(id) {
      await api(this.config).volunteering.expire(id)
      await this.fetch(id, true)
    },
  },
  getters: {
    byId: (state) => (id) => {
      return state.list[id]
    },
    count: (state) => {
      const lastVolunteerOpportunity =
        useAuthStore().user?.settings?.lastVolunteerOpportunity || 0

      return state.forUser.filter((item) => {
        return item.id > lastVolunteerOpportunity
      }).length
    },
  },
})
