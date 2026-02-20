import BaseAPI from '@/api/BaseAPI'

export default class NoticeboardAPI extends BaseAPI {
  fetch(id) {
    return this.$getv2('/noticeboard/' + id)
  }

  fetchList(params) {
    return this.$getv2('/noticeboard', params)
  }

  async add(data) {
    const { id } = await this.$post('/noticeboard', data)
    return id
  }

  save(data) {
    return this.$patch('/noticeboard', data)
  }

  action(data) {
    return this.$post('/noticeboard', data)
  }

  del(id) {
    return this.$del('/noticeboard', { id })
  }
}
