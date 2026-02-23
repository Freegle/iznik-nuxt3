import BaseAPI from '@/api/BaseAPI'

export default class AuthorityAPI extends BaseAPI {
  fetch(id) {
    return this.$getv2('/authority/' + id)
  }

  async fetchMessages(id) {
    return await this.$getv2('/authority/' + id + '/message')
  }
}
