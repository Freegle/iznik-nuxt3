import BaseAPI from '@/api/BaseAPI'

export default class ImageAPI extends BaseAPI {
  async post(params) {
    return await this.$postv2('/image', params)
  }

  async rateRecognise(id, rating) {
    // Go handler reads raterecognise from query params, not body
    return await this.$postv2(
      '/image?id=' + id + '&raterecognise=' + rating,
      {}
    )
  }
}
