import BaseAPI from '@/api/BaseAPI'

export default class JobAPI extends BaseAPI {
  async fetchv2(lat, lng) {
    // No need to log errors about this request - it often times out.
    return await this.$getv2(
      '/jobs',
      {
        lat,
        lng,
      },
      false
    )
  }

  async log(params) {
    await this.$post('/jobs', params)
  }
}
