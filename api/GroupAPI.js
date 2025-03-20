import BaseAPI from '@/api/BaseAPI'

export default class GroupAPI extends BaseAPI {
  async list(params) {
    return await this.$getv2('/group', params)
  }

  async listMT(params) {
    const { groups } = await this.$get('/groups', params)
    return groups
  }

  async fetchGroupMT(id, polygon, showmods, sponsors, tnkey, log) {
    const { group } = await this.$get(
      '/group',
      { id, polygon, showmods, sponsors, tnkey },
      log
    )
    return group
  }

  async fetch(id, log) {
    const group = await this.$getv2('/group/' + id, {}, log)

    return group
  }

  async fetchMessagesForGroup(id) {
    return await this.$getv2('/group/' + id + '/message')
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
