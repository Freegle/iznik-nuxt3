import BaseAPI from '@/api/BaseAPI'

export default class IsochroneAPI extends BaseAPI {
  add(params) {
    return this.$put('/isochrone', params)
  }

  fetchv1(params) {
    return this.$get('/isochrone', params)
  }

  fetchv2(params) {
    return this.$getv2('/isochrone', params)
  }

  fetchMessages(params) {
    return this.$getv2('/isochrone/message', params)
  }

  patch(params) {
    return this.$patch('/isochrone', params)
  }

  del(id) {
    return this.$del('/isochrone', { id })
  }
}
