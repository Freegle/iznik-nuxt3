import BaseAPI from '@/api/BaseAPI'

export default class ConfigAPI extends BaseAPI {
  async get(params) {
    // https://api.ilovefreegle.org/apiv2/config/app_fd_version_android_latest etc
    return await this.$getv2('/config/' + params.key)
  }
}
