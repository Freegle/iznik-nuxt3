import BaseAPI from '@/api/BaseAPI'

export default class NewsAPI extends BaseAPI {
  fetchFeed(params) {
    return this.$get('/newsfeed', params)
  }

  async fetch(params) {
    const { newsfeed } = await this.$get('/newsfeed', params)
    return newsfeed
  }

  async send(data) {
    const { id } = await this.$post('/newsfeed', data)
    return id
  }

  edit(id, message) {
    return this.$patch('/newsfeed', { id, message, action: 'Edit' })
  }

  love(id) {
    return this.$post('/newsfeed', { id, action: 'Love' })
  }

  unlove(id) {
    return this.$post('/newsfeed', { id, action: 'Unlove' })
  }

  async unfollow(id) {
    await this.$post('/newsfeed', { id, action: 'Unfollow' })
  }

  async report(id, reason) {
    await this.$post('/newsfeed', { id, reason, action: 'Report' })
  }

  async referto(id, type) {
    await this.$post('/newsfeed', { id, action: 'ReferTo' + type })
  }

  async unhide(id, type) {
    await this.$post('/newsfeed', { id, action: 'Unhide' })
  }

  async seen(id) {
    await this.$post('/newsfeed', { id, action: 'Seen' })
  }

  del(id) {
    return this.$del('/newsfeed', { id })
  }

  async count(id, type) {
    const ret = await this.$get('/newsfeed', { count: true })

    return ret.ret === 0 ? ret.unseencount : 0
  }
}
