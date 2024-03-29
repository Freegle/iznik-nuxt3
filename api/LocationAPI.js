import BaseAPI from '@/api/BaseAPI'

export default class LocationAPI extends BaseAPI {
  fetch(params) {
    return this.$get('/locations', params)
  }

  fetchv2(id) {
    return this.$getv2('/location/' + id)
  }

  add(data) {
    return this.$put('/locations', data)
  }

  update(data) {
    return this.$patch('/locations', data)
  }

  del(id, groupid) {
    return this.$post('/locations', {
      id,
      action: 'Exclude',
      byname: false,
      groupid,
    })
  }
}
