import BaseAPI from '@/api/BaseAPI'

export default class AddressAPI extends BaseAPI {
  fetchv2() {
    return this.$getv2('/address')
  }

  fetchByIdv2(id, logError = true) {
    return this.$getv2('/address/' + id, [], logError)
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
