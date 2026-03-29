import BaseAPI from '@/api/BaseAPI'

export default class ModConfigsAPI extends BaseAPI {
  fetchStdMsg(id) {
    return this.$getv2('/modtools/stdmsg', {
      id,
    })
  }

  listConfigs(params) {
    return this.$getv2('/modtools/modconfig', params)
  }

  async fetchConfig(params) {
    const ret = await this.$getv2('/modtools/modconfig', params)
    return ret.config
  }

  async patchConfig(params) {
    await this.$patchv2('/modtools/modconfig', params)
  }

  async deleteConfig(params) {
    await this.$delv2('/modtools/modconfig', params)
  }

  async patchStdMsg(params) {
    await this.$patchv2('/modtools/stdmsg', params)
  }

  async deleteStdMsg(params) {
    await this.$delv2('/modtools/stdmsg', params)
  }

  async addModConfig(data) {
    const { id } = await this.$postv2('/modtools/modconfig', data)
    return id
  }

  async addStdMsg(data) {
    const { id } = await this.$postv2('/modtools/stdmsg', data)
    return id
  }
}
