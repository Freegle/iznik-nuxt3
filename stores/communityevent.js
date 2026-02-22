import { defineStore } from 'pinia'
import dayjs from 'dayjs'
import { nextTick } from 'vue'
import api from '~/api'
import { earliestDate, addStrings } from '~/composables/useTimeFormat'
import { useAuthStore } from '~/stores/auth'
import { useMiscStore } from '@/stores/misc'

export const useCommunityEventStore = defineStore({
  id: 'communityevent',
  state: () => ({
    list: {},
    forUser: [],
    forGroup: [],
    context: false,
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
      this.context = false
    },
    async fetchMT(params) {
      const data = await api(this.config).communityevent.fetchMT(params)
      let items = []
      if (params && params.id) {
        items = [data.communityevent]
      } else {
        items = data.communityevents
        this.context = data.context
      }
      const done = [] // Seem to get lots of repeats so remove them
      for (let j = 0; j < items.length; j++) {
        const item = items[j]
        if (done.includes(item.id)) continue
        done.push(item.id)
        item.earliestDate = earliestDate(item.dates)
        item.earliestDateOfAll = earliestDate(item.dates, true)
        addStrings(item, true)
        for (let i = 0; i < item.dates.length; i++) {
          const start = dayjs(item.dates[i].start)
          const end = dayjs(item.dates[i].end)
          item.dates[i].starttime = start.format('HH:mm')
          item.dates[i].start = start.format('YYYY-MM-DD')
          item.dates[i].endtime = end.format('HH:mm')
          item.dates[i].end = end.format('YYYY-MM-DD')
        }
        // Fix up userid
        if (item.user) item.userid = item.user.id

        // Convert array of groups to array of groupids
        const groups = []
        for (const g of item.groups) {
          groups.push(g.id)
        }
        item.groups = groups

        // Get photo into expected field
        if (item.photo) item.image = item.photo

        this.list[item.id] = item
      }
    },
    async fetch(id, force) {
      try {
        const miscStore = useMiscStore()
        if (miscStore.modtools) {
          await this.fetchMT({
            id,
            limit: 1,
            pending: true,
          })
          return this.list[id]
        }
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
