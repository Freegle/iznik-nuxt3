import { defineStore } from 'pinia'
import api from '~/api'
import { useUserStore } from '~/stores/user'
import { useMessageStore } from '~/stores/message'
import { useModGroupStore } from '~/stores/modgroup'
import { useStdmsgStore } from '~/stores/stdmsg'
import { useModConfigStore } from '~/stores/modconfig'

export const useLogsStore = defineStore({
  id: 'logs',
  state: () => ({
    list: [],
    context: null,
    params: null,
  }),
  actions: {
    init(config) {
      this.config = config
    },
    clear() {
      this.list = []
      this.context = null
    },
    async fetch(params) {
      let ret = null
      delete params.context
      if (this.context?.id) {
        // V2 API expects context as a simple ID value, not nested object
        params.context = this.context.id
      }
      const data = await api(this.config).logs.fetch(params)

      let logs = []

      if (params && params.id) {
        logs = data.log || []
        this.list.push(...logs)
      } else {
        logs = data.logs || []
        this.list.push(...logs)
        this.context = data.context

        ret = data.context
      }

      // V2 pattern: API returns IDs only. Fetch related entities from stores
      // and attach them so components can access log.user, log.message, etc.
      await this._enrichLogs(logs)

      return ret
    },
    async _enrichLogs(logs) {
      const userStore = useUserStore()
      const messageStore = useMessageStore()
      const modGroupStore = useModGroupStore()
      const stdmsgStore = useStdmsgStore()
      const modConfigStore = useModConfigStore()

      // Collect unique IDs to fetch.
      const userIds = new Set()
      const msgIds = new Set()
      const groupIds = new Set()
      const stdmsgIds = new Set()
      const configIds = new Set()

      for (const log of logs) {
        if (log.userid) userIds.add(log.userid)
        if (log.byuserid) userIds.add(log.byuserid)
        if (log.msgid) msgIds.add(log.msgid)
        if (log.groupid) groupIds.add(log.groupid)
        if (log.stdmsgid) stdmsgIds.add(log.stdmsgid)
        if (log.configid) configIds.add(log.configid)
      }

      // Fetch all entities in parallel.
      const fetches = []

      if (userIds.size > 0) {
        fetches.push(userStore.fetchMultiple([...userIds]))
      }

      if (msgIds.size > 0) {
        fetches.push(
          messageStore.fetchMultiple([...msgIds]).catch(() => {
            /* some messages may be deleted */
          })
        )
      }

      for (const id of groupIds) {
        fetches.push(
          modGroupStore.fetchIfNeedBeMT(id).catch(() => {
            /* group may not be accessible */
          })
        )
      }

      for (const id of stdmsgIds) {
        fetches.push(
          stdmsgStore.fetch(id).catch(() => {
            /* stdmsg may be deleted */
          })
        )
      }

      for (const id of configIds) {
        fetches.push(
          modConfigStore.fetchById(id).catch(() => {
            /* config may be deleted */
          })
        )
      }

      await Promise.all(fetches)

      // Attach resolved entities to log entries.
      for (const log of logs) {
        if (log.userid && userStore.list[log.userid]) {
          log.user = userStore.list[log.userid]
        }
        if (log.byuserid && userStore.list[log.byuserid]) {
          log.byuser = userStore.list[log.byuserid]
        }
        if (log.msgid && messageStore.list[log.msgid]) {
          log.message = messageStore.list[log.msgid]
        }
        if (log.groupid && modGroupStore.list[log.groupid]) {
          log.group = modGroupStore.list[log.groupid]
        }
        if (log.stdmsgid) {
          const stdmsg = stdmsgStore.byid(log.stdmsgid)
          if (stdmsg) {
            log.stdmsg = stdmsg
          }
        }
        if (log.configid && modConfigStore.configsById[log.configid]) {
          log.config = modConfigStore.configsById[log.configid]
        }
      }
    },
    setParams(params) {
      this.params = params
    },
  },
  getters: {
    byId: (state) => (id) => {
      return state.list.find((l) => l.id === id) || null
    },
  },
})
