import BaseAPI from '@/api/BaseAPI'

export default class SpammersAPI extends BaseAPI {
  async fetch(params) {
    const { spammers, context } = await this.$getv2('/spammers', params)
    return { spammers, context }
  }

  add(params) {
    return this.$postv2('/spammers', params)
  }

  patch(params) {
    return this.$patchv2('/spammers', params)
  }

  del(params) {
    return this.$delv2('/spammers', params)
  }
}
