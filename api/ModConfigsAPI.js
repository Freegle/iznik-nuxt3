import BaseAPI from '@/api/BaseAPI'

export default class ModConfigsAPI extends BaseAPI {
  fetchStdMsg(id) {
    return this.$getv2('/stdmsg', {
      id,
    })
  }

  listConfigs(params) {
    return this.$getv2('/modconfig', params)
  }

  async fetchConfig(params) {
    const ret = await this.$getv2('/modconfig', params)
    return ret.config
  }

  async patchConfig(params) {
    await this.$patchv2('/modconfig', params)
  }

  async deleteConfig(params) {
    await this.$delv2('/modconfig', params)
  }

  async patchStdMsg(params) {
    await this.$patchv2('/stdmsg', params)
  }

  async deleteStdMsg(params) {
    await this.$delv2('/stdmsg', params)
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
