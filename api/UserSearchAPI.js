import BaseAPI from '@/api/BaseAPI'

export default class UserSearchAPI extends BaseAPI {
  async fetch(userid) {
    return await this.$getv2('/user/' + userid + '/search')
  }

  del(id) {
    // Go DELETE handler reads id from query params
    return this.$requestv2('DELETE', '/usersearch?id=' + id, {
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
