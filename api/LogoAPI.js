import BaseAPI from '@/api/BaseAPI'

export default class LogoAPI extends BaseAPI {
  async fetch(params) {
    return await this.$getv2('/logo', params)
  }
}
