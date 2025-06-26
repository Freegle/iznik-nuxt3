import BaseAPI from '@/api/BaseAPI'

export default class ConfigAPI extends BaseAPI {
  fetchv2(key) {
    return this.$getv2('/config/' + key)
  }
}
