import BaseAPI from '@/api/BaseAPI'

export default class NewsAPI extends BaseAPI {
  fetchFeed(params) {
    return this.$get('/newsfeed', params)
  }

  async fetch(id, distance, lovelist, logError) {
    return await this.$getv2(
      id ? '/newsfeed/' + id : '/newsfeed',
      {
        distance,
        lovelist,
      },
      logError
    )
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

  async hide(id, type) {
    await this.$post('/newsfeed', { id, action: 'Hide' })
  }

  async convertToStory(id, type) {
    await this.$post('/newsfeed', { id, action: 'ConvertToStory' })
  }

  async seen(id) {
    await this.$post('/newsfeed?bump=' + id, { id, action: 'Seen' })
  }

  del(id) {
    return this.$del('/newsfeed', { id })
  }

  async count(distance, log) {
    return await this.$getv2(
      '/newsfeedcount',
      {
        distance,
      },
      log
    )
  }
}
