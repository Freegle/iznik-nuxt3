import BaseAPI from '@/api/BaseAPI'

export default class AddressAPI extends BaseAPI {
  fetchv2() {
    return this.$getv2('/address')
  }

  fetchByIdv2(id, logError = true) {
    return this.$getv2('/address/' + id, [], logError)
  }

  add(data) {
    return this.$postv2('/address', data)
  }

  update(data) {
    return this.$patchv2('/address', data)
  }

  del(id) {
    return this.$delv2('/address/' + id)
  }
}
