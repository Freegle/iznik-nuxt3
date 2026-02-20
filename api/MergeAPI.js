import BaseAPI from '@/api/BaseAPI'

export default class MergeAPI extends BaseAPI {
  async fetch(params) {
    const ret = await this.$getv2('/merge', params)
    return ret.merge
  }

  ask(params) {
    return this.$putv2('/merge', params)
  }

  ignore(params) {
    return this.$delv2('/merge', params)
  }

  accept(params) {
    return this.$postv2('/merge', {
      id: params.id,
      uid: params.uid,
      user1: params.user1,
      user2: params.user2,
      action: 'Accept',
    })
  }

  reject(params) {
    return this.$postv2('/merge', {
      id: params.id,
      uid: params.uid,
      user1: params.user1,
      user2: params.user2,
      action: 'Reject',
    })
  }
}
