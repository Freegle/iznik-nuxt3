import BaseAPI from '@/api/BaseAPI'

export default class IsochroneAPI extends BaseAPI {
  add(params) {
    return this.$putv2('/isochrone', params)
  }

  fetchv2(params) {
    return this.$getv2('/isochrone', params)
  }

  fetchMessages(params) {
    return this.$getv2('/isochrone/message', params)
  }

  patch(params) {
    return this.$patchv2('/isochrone', params)
  }

  del(id) {
    return this.$delv2('/isochrone', { id })
  }
}
