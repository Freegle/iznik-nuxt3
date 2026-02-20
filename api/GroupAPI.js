import BaseAPI from '@/api/BaseAPI'

export default class GroupAPI extends BaseAPI {
  async list(params) {
    return await this.$getv2('/group', params)
  }

  async listMT(params) {
    return await this.$getv2('/group', params)
  }

  async fetchGroupMT(id, polygon, showmods, sponsors, tnkey, log) {
    return await this.$getv2(
      '/group/' + id,
      { polygon, showmods, sponsors, tnkey },
      log
    )
  }

  async fetch(id, log) {
    const group = await this.$getv2('/group/' + id, {}, log)

    return group
  }

  async fetchMessagesForGroup(id) {
    return await this.$getv2('/group/' + id + '/message')
  }

  async patch(params) {
    await this.$patchv2('/group', params)
  }

  async add(params) {
    const { id } = await this.$postv2('/group', params)
    return id
  }

  async removeFacebook(groupid, uid) {
    await this.$postv2('/group/removefacebook', {
      id: groupid,
      uid,
    })
  }
}
