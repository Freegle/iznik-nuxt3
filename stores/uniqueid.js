// Occasionally we need a unique ID on the client.
//
// We use a timestamp plus a counter (since we might generate multiple within the same ms).
import { defineStore } from 'pinia'

export const useUniqueStore = defineStore({
  id: 'uniqueid',
  state: () => ({
    counted: 0,
  }),
  actions: {
    generate() {
      this.counter++
      return Date.now() + '-' + this.counter
    },
  },
})
