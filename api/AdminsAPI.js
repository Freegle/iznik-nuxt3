import BaseAPI from '@/api/BaseAPI'

export default class AdminsAPI extends BaseAPI {
  fetch(params) {
    return this.$getv2('/admin', params)
  }

  async add(data) {
    const { id } = await this.$postv2('/admin', data)
    return id
  }

  async patch(data) {
    await this.$patchv2('/admin', data)
  }

  async del(data) {
    await this.$delv2('/admin', data)
  }

  async hold(id) {
    await this.$postv2('/admin', {
      id,
      action: 'Hold',
    })
  }

  async release(id) {
    await this.$postv2('/admin', {
      id,
      action: 'Release',
    })
  }
}
