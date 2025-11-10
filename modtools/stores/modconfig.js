import { defineStore } from 'pinia'
import api from '~/api'

export const useModConfigStore = defineStore({
  id: 'modconfig',
  state: () => ({
    configs: [],
    // We have a current one.  This is so that we can configure it without interfering with our main list until
    // we save it.
    current: null,
  }),
  actions: {
    init(config) {
      this.config = config
      this.$api = api(config)
    },

    async fetch(params) {
      const { configs } = await api(this.config).session.fetch({
        components: params.all ? ['allconfigs'] : ['configs'],
        modtools: true,
      })

      if (configs) {
        this.configs = configs
      }
    },

    async fetchConfig(params) {
      const config = await api(this.config).modconfigs.fetchConfig(params)

      if (config) {
        this.current = config
      }
    },

    async updateConfig(params) {
      await api(this.config).modconfigs.patchConfig(params)
      const config = await this.fetchConfig({
        id: params.id,
        configuring: true,
      })
      if (config) {
        this.current = config
      }
    },

    async add(params) {
      const id = await api(this.config).modconfigs.addModConfig(params)

      await this.fetchConfig({
        id,
        configuring: true,
      })

      return id
    },

    async delete(params) {
      await api(this.config).modconfigs.deleteConfig(params)
    },
  },
})
