import { defineStore } from 'pinia'

export const useMiscStore = defineStore({
  id: 'misc',
  persist: {
    enabled: true,
    strategies:
      typeof localStorage === 'undefined'
        ? []
        : [
            // These are sticky preferences.
            {
              storage: localStorage,
              paths: ['vals'],
            },
          ],
  },
  state: () => ({
    time: null,
    breakpoint: null,
    vals: {},
  }),
  actions: {
    set(params) {
      this.vals[params.key] = params.value
    },
    setTime() {
      this.time = new Date()
    },
    setBreakpoint(val) {
      this.breakpoint = val
    },
  },
  getters: {
    get: (state) => (key) => {
      return state.vals[key]
    },
  },
})
