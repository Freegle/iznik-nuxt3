import BaseAPI from '@/api/BaseAPI'

export default class StatusAPI extends BaseAPI {
  fetch(params) {
    return this.$getv2('/status', params)
  }
}
