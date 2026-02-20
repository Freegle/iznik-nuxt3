import BaseAPI from '@/api/BaseAPI'

export default class ImageAPI extends BaseAPI {
  async post(params) {
    return await this.$postv2('/image', params)
  }

  // rateRecognise stays on V1 because the Go handler doesn't support it.
  async rateRecognise(id, rating) {
    return await this.$post('/image', { id, raterecognise: rating })
  }
}
