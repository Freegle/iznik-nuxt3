import BaseAPI from '@/api/BaseAPI'

export default class NotificationAPI extends BaseAPI {
  count() {
    return this.$getv2('/notification/count')
  }

  list() {
    return this.$getv2('/notification')
  }

  seen(id) {
    return this.$post('/notification', { id, action: 'Seen' })
  }

  allSeen() {
    return this.$post('/notification', { action: 'AllSeen' })
  }
}
