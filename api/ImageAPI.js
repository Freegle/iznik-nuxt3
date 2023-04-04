import BaseAPI from '@/api/BaseAPI'

export default class ImageAPI extends BaseAPI {
  async post(params) {
    return await this.$post('/image', params)
  }

  async postForm(params) {
    return await this.$postForm('/image', params)
  }
}
