import BaseAPI from '@/api/BaseAPI'

export default class MicroVolunteeringAPI extends BaseAPI {
  async challenge(params) {
    // Use v2 API which returns challenge directly without wrapper
    const ret = await this.$getv2('/microvolunteering', params)
    return ret
  }

  response(params) {
    return this.$postv2('/microvolunteering', params)
  }

  fetch(params) {
    // Use v2 API which returns challenge directly without wrapper
    return this.$getv2('/microvolunteering', params)
  }
}
