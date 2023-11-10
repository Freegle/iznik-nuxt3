import BaseAPI from '@/api/BaseAPI'

export default class StoriesAPI extends BaseAPI {
  fetchv2(id, logError = true) {
    return this.$getv2('/story/' + id, {}, logError)
  }

  listv2(limit) {
    return this.$getv2('/story' + (limit ? '?limit=' + limit : ''))
  }

  byGroupv2(groupid, limit) {
    return this.$getv2(
      '/story/group/' + groupid + (limit ? '?limit=' + limit : '')
    )
  }

  fetch(params) {
    return this.$get('/stories', params)
  }

  async add(data) {
    const { id } = await this.$put('/stories', data)
    return id
  }

  love(id) {
    return this.$post('/stories', { id, action: 'Like' })
  }

  unlove(id) {
    return this.$post('/stories', { id, action: 'Unlike' })
  }

  dontUseForPublicity(id) {
    return this.$patch('/stories', { id, reviewed: 1, public: 0 })
  }

  useForPublicity(id) {
    return this.$patch('/stories', { id, reviewed: 1, public: 1 })
  }

  useForNewsletter(id) {
    return this.$patch('/stories', { id, newsletterreviewed: 1, newsletter: 1 })
  }

  dontUseForNewsletter(id) {
    return this.$patch('/stories', { id, newsletterreviewed: 1, newsletter: 0 })
  }
}
