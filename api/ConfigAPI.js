import BaseAPI from '@/api/BaseAPI'

export default class ConfigAPI extends BaseAPI {
  async get(params) {
    const ret = await this.$get('/config', params)
    return ret.values
  }
}
