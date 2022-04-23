import { defineStore } from 'pinia'

export const useMiscStore = defineStore({
  id: 'misc',
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
      console.log('Set', val, this)
      this.breakpoint = val
    },
  },
  getters: {
    get: (state) => (key) => state[key],
    getBreakpoint: (state) => state.breakpoint,
  },
})
