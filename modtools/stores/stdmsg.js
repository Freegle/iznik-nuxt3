import { defineStore } from 'pinia'
import { useModConfigStore } from '../stores/modconfig'
import api from '~/api'
// TODO

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
      return this.stdmsgs.find(msg => {
        return msg.id === id
      })
    },
    async fetch(params) {
      const { stdmsg } = await this.$api.modconfigs.fetchStdMsg(params.id)
      this.set(stdmsg)
      return stdmsg
    },
    async delete(params) {
      await this.$api.modconfigs.deleteStdMsg(params)

      await this.modConfigStore.fetchConfig({
        id: params.configid,
        configuring: true
      }
        /* UNUSED TODO ,{
          root: true
        }*/
      )
    },
    async update(params) {
      await this.$api.modconfigs.patchStdMsg(params)
      await this.modConfigStore.fetchConfig({
        id: params.configid,
        configuring: true
      }
        /* UNUSED TODO ,{
          root: true
        }*/
      )
    },
    async add(params) {
      const { id } = await this.$api.modconfigs.addStdMsg(params)
      await this.modConfigStore.fetchConfig({
        id: params.configid,
        configuring: true
      }
        /* UNUSED TODO ,{
          root: true
        }*/
      )
      return id
    }
  }
})
