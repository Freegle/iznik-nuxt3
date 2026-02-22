import BaseAPI from '@/api/BaseAPI'

export default class VolunteeringAPI extends BaseAPI {
  fetch(id, logError = true) {
    return this.$getv2('/volunteering/' + id, {}, logError)
  }

  fetchMT(params) {
    return this.$get('/volunteering', params)
  }

  list(id) {
    return this.$getv2('/volunteering')
  }

  listGroup(id) {
    return this.$getv2('/volunteering/group/' + id)
  }

  save(data) {
    return this.$patch('/volunteering', data)
  }

  async add(data) {
    const { id } = await this.$post('/volunteering', data)
    return id
  }

  addGroup(id, groupid) {
    return this.$patch('/volunteering', { id, groupid, action: 'AddGroup' })
  }

  removeGroup(id, groupid) {
    return this.$patch('/volunteering', { id, groupid, action: 'RemoveGroup' })
  }

  setPhoto(id, photoid) {
    return this.$patch('/volunteering', { id, photoid, action: 'SetPhoto' })
  }

  addDate(id, start, end) {
    return this.$patch('/volunteering', { id, start, end, action: 'AddDate' })
  }

  removeDate(id, dateid) {
    return this.$patch('/volunteering', { id, dateid, action: 'RemoveDate' })
  }

  del(id) {
    return this.$del('/volunteering', { id })
  }

  renew(id) {
    return this.$patch('/volunteering', { id, action: 'Renew' })
  }

  expire(id) {
    return this.$patch('/volunteering', { id, action: 'Expire' })
  }
}
