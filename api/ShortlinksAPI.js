import BaseAPI from '@/api/BaseAPI'

export default class ShortlinksAPI extends BaseAPI {
  fetch(params) {
    return this.$getv2('/shortlink', params)
  }

  async add(data) {
    const { id } = await this.$postv2('/shortlink', data)
    return id
  }
}
