import BaseAPI from '@/api/BaseAPI'

export default class JobAPI extends BaseAPI {
  async fetchv2(lat, lng, category) {
    // No need to log errors about this request - it often times out.
    const params = {
      lat,
      lng,
    }

    if (category) {
      params.category = category
    }
    return await this.$getv2('/job', params, false)
  }

  async fetchOnev2(id, logError) {
    return await this.$getv2('/job/' + id, {}, logError)
  }

  async log(params) {
    await this.$postv2('/job', params)
  }
}
