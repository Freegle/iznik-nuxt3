import BaseAPI from '@/api/BaseAPI'

export default class LocationAPI extends BaseAPI {
  typeahead(query) {
    return this.$getv2('/location/typeahead?q=' + encodeURIComponent(query))
  }

  latlng(lat, lng) {
    return this.$getv2('/location/latlng', {
      lat,
      lng,
    })
  }

  fetchv2(id) {
    return this.$getv2('/location/' + id)
  }

  fetchAddresses(id) {
    return this.$getv2('/location/' + id + '/addresses')
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
