import BaseAPI from '@/api/BaseAPI'

export default class AuthorityAPI extends BaseAPI {
  fetch(params) {
    return this.$get('/authority', params)
  }

  async fetchMessages(id) {
    return await this.$getv2('/authority/' + id + '/message')
  }
}
