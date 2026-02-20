import BaseAPI from '@/api/BaseAPI'

export default class ModConfigsAPI extends BaseAPI {
  async fetchStdMsg(id) {
    const ret = await this.$getv2('/stdmsg', { id })
    return ret.stdmsg
  }

  async fetchConfig(params) {
    const ret = await this.$getv2('/modconfig', params)
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
