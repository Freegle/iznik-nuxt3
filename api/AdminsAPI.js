import BaseAPI from '@/api/BaseAPI'

export default class AdminsAPI extends BaseAPI {
  fetch(params) {
    return this.$getv2('/modtools/admin', params)
  }

  async add(data) {
    const { id } = await this.$postv2('/modtools/admin', data)
    return id
  }

  async patch(data) {
    await this.$patchv2('/modtools/admin', data)
  }

  async del(data) {
    await this.$delv2('/modtools/admin', data)
  }

  async hold(id) {
    await this.$postv2('/modtools/admin', {
      id,
      action: 'Hold',
    })
  }

  async release(id) {
    await this.$postv2('/modtools/admin', {
      id,
      action: 'Release',
    })
  }
}
