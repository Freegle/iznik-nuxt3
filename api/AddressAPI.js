import BaseAPI from '@/api/BaseAPI'

export default class AddressAPI extends BaseAPI {
  fetchv1(params) {
    return this.$get('/address', params)
  }

  fetchv2() {
    return this.$getv2('/address')
  }

  add(data) {
    return this.$put('/address', data)
  }

  update(data) {
    return this.$patch('/address', data)
  }

  del(id) {
    return this.$del('/address', { id })
  }
}
