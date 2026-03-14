import { defineStore } from 'pinia'
import { useModConfigStore } from '~/stores/modconfig'
import api from '~/api'

export const useStdmsgStore = defineStore({
  id: 'stdmsg',
  state: () => ({
    stdmsgs: [],
  }),
  actions: {
    init(config) {
      this.config = config
      this.$api = api(config)
      this.modConfigStore = useModConfigStore()
    },
    set(stdmsg) {
      this.stdmsgs[stdmsg.id] = stdmsg
    },
    byid(id) {
      return this.stdmsgs.find((msg) => {
        return msg.id === id
      })
    },
    async fetch(id) {
      const { stdmsg } = await api(this.config).modconfigs.fetchStdMsg(id)
      this.set(stdmsg)
      return stdmsg
    },
    async delete(params) {
      await api(this.config).modconfigs.deleteStdMsg(params)

      await this.modConfigStore.fetchConfig({
        id: params.configid,
        configuring: true,
      })
    },
    async update(params) {
      await api(this.config).modconfigs.patchStdMsg(params)
      await this.modConfigStore.fetchConfig({
        id: params.configid,
        configuring: true,
      })
    },
    async add(params) {
      const { id } = await api(this.config).modconfigs.addStdMsg(params)
      await this.modConfigStore.fetchConfig({
        id: params.configid,
        configuring: true,
      })
      return id
    },
  },
})
