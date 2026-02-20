import BaseAPI from '@/api/BaseAPI'

export default class CommunityEventAPI extends BaseAPI {
  fetch(id, logError = true) {
    return this.$getv2('/communityevent/' + id, {}, logError)
  }

  list(params) {
    return this.$getv2('/communityevent', params)
  }

  listGroup(id) {
    return this.$getv2('/communityevent/group/' + id)
  }

  save(data) {
    return this.$patchv2('/communityevent', data)
  }

  async add(data) {
    const { id } = await this.$postv2('/communityevent', data)
    return id
  }

  addGroup(id, groupid) {
    return this.$patchv2('/communityevent', { id, groupid, action: 'AddGroup' })
  }

  removeGroup(id, groupid) {
    return this.$patchv2('/communityevent', {
      id,
      groupid,
      action: 'RemoveGroup',
    })
  }

  setPhoto(id, photoid) {
    return this.$patchv2('/communityevent', {
      id,
      photoid,
      action: 'SetPhoto',
    })
  }

  addDate(id, start, end) {
    return this.$patchv2('/communityevent', {
      id,
      start,
      end,
      action: 'AddDate',
    })
  }

  removeDate(id, dateid) {
    return this.$patchv2('/communityevent', {
      id,
      dateid,
      action: 'RemoveDate',
    })
  }

  del(id) {
    return this.$requestv2('DELETE', '/communityevent/' + id, {})
  }
}
