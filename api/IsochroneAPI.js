import BaseAPI from '@/api/BaseAPI'

export default class IsochroneAPI extends BaseAPI {
  fetchv1(params) {
    return this.$get('/isochrone', params)
  }

  fetchv2(params) {
    return this.$getv2('/isochrone', params)
  }

  fetchMessages(params) {
    return this.$getv2('/isochrone/message', params)
  }
}
