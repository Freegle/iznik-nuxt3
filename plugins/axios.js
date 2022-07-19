import axios from 'axios'

export default defineNuxtPlugin(() => {
  return {
    provide: {
      axios: axios.default,
    },
  }
})
