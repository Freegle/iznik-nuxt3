import BaseAPI from '@/api/BaseAPI'

export default class IsochroneAPI extends BaseAPI {
  fetch(params) {
    return this.$getv2('/message/isochrones', params)
  }
}
