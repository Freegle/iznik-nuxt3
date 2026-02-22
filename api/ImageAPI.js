import BaseAPI from '@/api/BaseAPI'

export default class ImageAPI extends BaseAPI {
  async post(params) {
    return await this.$postv2('/image', params)
  }

  async postForm(params, log = true) {
    // Keep on V1 — Go POST /image only accepts JSON, not multipart form data
    return await this.$postForm('/image', params, log)
  }
}
