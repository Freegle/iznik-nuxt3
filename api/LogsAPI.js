import BaseAPI from '@/api/BaseAPI'

export default class LogsAPI extends BaseAPI {
  fetch(params) {
    return this.$getv2('/modtools/logs', params)
  }

  src(src) {
    // Use v2 endpoint for source tracking
    return this.$postv2('/src', { src })
  }
}
