import BaseAPI from '@/api/BaseAPI'

export default class SpammersAPI extends BaseAPI {
  async fetch(params) {
    const { spammers, context } = await this.$getv2(
      '/modtools/spammers',
      params
    )
    return { spammers, context }
  }

  add(params) {
    return this.$postv2('/modtools/spammers', params)
  }

  patch(params) {
    return this.$patchv2('/modtools/spammers', params)
  }

  del(params) {
    return this.$delv2('/modtools/spammers', params)
  }
}
