import BaseAPI from '@/api/BaseAPI'

export default class NotificationAPI extends BaseAPI {
  count() {
    // Don't log errors - this can happen due to timing windows.
    return this.$getv2('/notification/count', {}, false)
  }

  list() {
    // Don't log errors - this can happen due to timing windows.
    return this.$getv2('/notification', {}, false)
  }

  seen(id) {
    return this.$post('/notification', { id, action: 'Seen' })
  }

  allSeen() {
    return this.$post('/notification', { action: 'AllSeen' })
  }
}
