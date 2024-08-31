import BaseAPI from '@/api/BaseAPI'

export default class ConfigAPI extends BaseAPI {
  fetchv2(key) {
    // https://api.ilovefreegle.org/apiv2/config/app_fd_version_android_latest etc
    return this.$getv2('/config/' + key)
  }
}
