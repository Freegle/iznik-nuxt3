import BaseAPI from '@/api/BaseAPI'

export default class GroupAPI extends BaseAPI {
  async list(params) {
    let ret = null
    try {
      ret = await this.$getv2('/group', params)
    } catch (e) {
      console.log('List groups exception', e.message)
      throw e
    }

    return ret
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
