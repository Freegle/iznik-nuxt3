import BaseAPI from '@/api/BaseAPI'

export default class VisualiseAPI extends BaseAPI {
  fetch(params) {
    return this.$getv2('/visualise', params)
  }
}
