import BaseAPI from '@/api/BaseAPI'

export default class IsochroneAPI extends BaseAPI {
  fetch(params) {
    return this.$getv2('/isochrone', params)
  }

  fetchMessages(params) {
    return this.$getv2('/isochrone/message', params)
  }
}
