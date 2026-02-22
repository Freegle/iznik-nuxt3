import BaseAPI from '@/api/BaseAPI'

export default class StoriesAPI extends BaseAPI {
  fetchv2(id, logError = true) {
    return this.$getv2('/story/' + id, {}, logError)
  }

  listv2(params = {}) {
    return this.$getv2('/story', params)
  }

  byGroupv2(groupid, limit) {
    return this.$getv2(
      '/story/group/' + groupid + (limit ? '?limit=' + limit : '')
    )
  }

  fetch(params) {
    return this.$getv2('/story', params)
  }

  async add(data) {
    const { id } = await this.$putv2('/story', data)
    return id
  }

  love(id) {
    return this.$postv2('/story/like', { id })
  }

  unlove(id) {
    return this.$postv2('/story/unlike', { id })
  }

  dontUseForPublicity(id) {
    return this.$patchv2('/story', { id, reviewed: 1, public: 0 })
  }

  useForPublicity(id) {
    return this.$patchv2('/story', { id, reviewed: 1, public: 1 })
  }

  useForNewsletter(id) {
    return this.$patchv2('/story', { id, newsletterreviewed: 1, newsletter: 1 })
  }

  dontUseForNewsletter(id) {
    return this.$patchv2('/story', { id, newsletterreviewed: 1, newsletter: 0 })
  }
}
