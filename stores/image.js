import { defineStore } from 'pinia'
import api from '~/api'

export const useImageStore = defineStore({
  id: 'image',
  state: () => ({}),
  actions: {
    init(config) {
      this.config = config
    },
    async post(data) {
      return await api(this.config).image.post(data)
    },
    async postForm(data) {
      return await api(this.config).image.postForm(data, false)
    },
  },
})
