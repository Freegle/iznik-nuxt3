import BaseAPI from '@/api/BaseAPI'

export default class CommunityEventAPI extends BaseAPI {
  fetch(id) {
    return this.$getv2('/communityevent/' + id)
  }

  list(id) {
    return this.$getv2('/communityevent')
  }

  save(data) {
    return this.$patch('/communityevent', data)
  }

  async add(data) {
    const { id } = await this.$post('/communityevent', data)
    return id
  }

  addGroup(id, groupid) {
    return this.$patch('/communityevent', { id, groupid, action: 'AddGroup' })
  }

  removeGroup(id, groupid) {
    return this.$patch('/communityevent', {
      id,
      groupid,
      action: 'RemoveGroup',
    })
  }

  setPhoto(id, photoid) {
    return this.$patch('/communityevent', { id, photoid, action: 'SetPhoto' })
  }

  addDate(id, start, end) {
    return this.$patch('/communityevent', { id, start, end, action: 'AddDate' })
  }

  removeDate(id, dateid) {
    return this.$patch('/communityevent', { id, dateid, action: 'RemoveDate' })
  }

  del(id) {
    return this.$del('/communityevent', { id })
  }
}
