import BaseAPI from '@/api/BaseAPI'

export default class SystemLogsAPI extends BaseAPI {
  fetch(params) {
    // Use v2 endpoint for system logs from Loki
    return this.$getv2('/systemlogs', params)
  }
}
