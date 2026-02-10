import BaseAPI from '@/api/BaseAPI'

export default class UserSearchAPI extends BaseAPI {
  async fetch(userid) {
    return await this.$getv2('/user/' + userid + '/search')
  }

  del(id) {
    return this.$delv2('/usersearch', { id })
  }
}
