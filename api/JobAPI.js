import BaseAPI from '@/api/BaseAPI'

export default class JobAPI extends BaseAPI {
  async fetchv2(lat, lng, category) {
    // No need to log errors about this request - it often times out.
    return await this.$getv2(
      '/job',
      {
        lat,
        lng,
        category,
      },
      false
    )
  }

  async fetchOnev2(id) {
    return await this.$getv2('/job/' + id)
  }

  async log(params) {
    await this.$post('/jobs', params)
  }
}
