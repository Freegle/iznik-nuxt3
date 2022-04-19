import BaseAPI from '@/api/BaseAPI'

export default class GroupAPI extends BaseAPI {
  async list(params) {
    const { groups } = await this.$get('/groups', params)
    return groups
  }

  async fetch(id, polygon, showmods, sponsors, tnkey, log) {
    console.log('Fetch group', id)
    const group = await this.$getv2(
      '/group/' + id,
      // TODO { polygon, showmods, sponsors, tnkey }
      {},
      log
    )

    console.log('Fetched group')
    return group
  }

  async patch(params) {
    await this.$patch('/group', params)
  }

  async add(params) {
    const { id } = await this.$post('/group', params)
    return id
  }

  async removeFacebook(groupid, uid) {
    await this.$post('/group', {
      id: groupid,
      uid,
      action: 'RemoveFacebook',
    })
  }
}
