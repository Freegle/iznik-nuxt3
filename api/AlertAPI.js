import BaseAPI from '@/api/BaseAPI'

export default class AlertAPI extends BaseAPI {
  fetch(params) {
    return this.$getv2('/modtools/alert', params)
  }

  add(data) {
    return this.$putv2('/modtools/alert', data)
  }

  record(data) {
    return this.$postv2('/alert', data)
  }
}
