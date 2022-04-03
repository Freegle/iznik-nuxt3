import axios from 'axios'

export default () => {
  return {
    provide: {
      axios: axios.default,
    },
  }
}
