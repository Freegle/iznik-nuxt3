import BaseAPI from '@/api/BaseAPI'

export default class CommentAPI extends BaseAPI {
  fetch(params) {
    return this.$get('/comment', params)
  }

  async add(data) {
    const { id } = await this.$postv2('/comment', data)
    return id
  }

  save(data) {
    return this.$patchv2('/comment', data)
  }

  del(id) {
    return this.$delv2('/comment/' + id)
  }
}
