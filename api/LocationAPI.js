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

  fetch(params) {
    return this.$get('/locations', params)
  }

  fetchv2(id) {
    return this.$getv2('/location/' + id)
  }

  fetchAddresses(id) {
    return this.$getv2('/location/' + id + '/addresses')
  }

  add(data) {
    return this.$putv2('/locations', data)
  }

  update(data) {
    return this.$patchv2('/locations', data)
  }

  del(id, groupid) {
    return this.$postv2('/locations', {
      id,
      action: 'Exclude',
      byname: false,
      groupid,
    })
  }

  convertKML(kml) {
    return this.$post('/locations/kml', {
      action: 'ConvertKML',
      kml,
    })
  }
}
