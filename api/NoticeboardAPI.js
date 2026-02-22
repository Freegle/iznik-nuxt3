import BaseAPI from '@/api/BaseAPI'

export default class NoticeboardAPI extends BaseAPI {
  fetch(params) {
    return this.$get('/noticeboard', params)
  }

  async add(data) {
    const { id } = await this.$postv2('/noticeboard', data)
    return id
  }

  save(data) {
    return this.$patchv2('/noticeboard', data)
  }

  action(data) {
    return this.$postv2('/noticeboard', data)
  }

  del(id) {
    return this.$del('/noticeboard', { id })
  }
}
