import BaseAPI from '@/api/BaseAPI'

export default class AlertAPI extends BaseAPI {
  fetch(params) {
    return this.$getv2('/alert', params)
  }

  add(data) {
    return this.$putv2('/alert', data)
  }

  record(data) {
    return this.$postv2('/alert', data)
  }
}
