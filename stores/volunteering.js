import { defineStore } from 'pinia'
import dayjs from 'dayjs'
import { nextTick } from 'vue'
import api from '~/api'
import { addStrings, earliestDate } from '~/composables/useTimeFormat'
import { useAuthStore } from '~/stores/auth'
import { useMiscStore } from '~/stores/misc'

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
    async fetchMT(params) {
      if (!params) {
        params = {
          systemwide: true,
        }
      } else if (!params.groupid) {
        // Not a specific group - get all of them including systemwide ones.
        params.systemwide = true
      }

      const { volunteering, volunteerings } = await api(
        this.config
      ).volunteering.fetchMT(params)

      if (params && params.id) {
        this.list[params.id] = volunteering
      } else {
        this.list = {}
        for (const volunteering of volunteerings) {
          if (this.list[volunteering.id]) continue
          const item = addStrings(volunteering, false)
          // Convert to v2 format
          item.image = item.photo
          item.userid = item.user?.id
          item.groupsmt = item.groups
          const groups = []
          for (const group of item.groups) {
            groups.push(group.id)
          }
          item.groups = groups
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
          this.list[item.id] = item
        }
        // this.context = context
      }
    },
    async fetch(id, force) {
      try {
        const miscStore = useMiscStore()
        if (force || !this.list[id]) {
          if (this.fetching[id]) {
            await this.fetching[id]
            await nextTick()
          } else {
            if (miscStore.modtools) {
              this.fetching[id] = api(this.config).volunteering.fetchMT({
                id,
                pending: true,
              })
            } else {
              this.fetching[id] = api(this.config).volunteering.fetch(id, false)
            }
            let item = await this.fetching[id]
            if (item.volunteering) {
              item = item.volunteering
              item.image = item.photo
              item.userid = item.user.id
              item.groupsmt = item.groups
              const groups = []
              for (const group of item.groups) {
                groups.push(group.id)
              }
              item.groups = groups
            }
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
