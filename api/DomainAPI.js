import BaseAPI from '@/api/BaseAPI'

export default class DomainAPI extends BaseAPI {
  fetch(params) {
    return this.$getv2('/domains', params)
  }
}
