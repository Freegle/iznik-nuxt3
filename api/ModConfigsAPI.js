import BaseAPI from '@/api/BaseAPI'

export default class ModConfigsAPI extends BaseAPI {
  fetchStdMsg(id) {
    return this.$get('/stdmsg', {
      id,
    })
  }

  async fetchConfig(params) {
    const ret = await this.$get('/modconfig', params)
    return ret.config
  }

  async patchConfig(params) {
    await this.$patchv2('/modconfig', params)
  }

  async deleteConfig(params) {
    await this.$requestv2('DELETE', '/modconfig?id=' + params.id, {})
  }

  async patchStdMsg(params) {
    await this.$patchv2('/stdmsg', params)
  }

  async deleteStdMsg(params) {
    await this.$requestv2('DELETE', '/stdmsg?id=' + params.id, {})
  }

  async addModConfig(data) {
    const { id } = await this.$postv2('/modconfig', data)
    return id
  }

  async addStdMsg(data) {
    const { id } = await this.$postv2('/stdmsg', data)
    return id
  }
}
