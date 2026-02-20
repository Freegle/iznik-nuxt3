import BaseAPI from '@/api/BaseAPI'

export default class NewsAPI extends BaseAPI {
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
    const { id } = await this.$postv2('/newsfeed', data)
    return id
  }

  edit(id, message) {
    return this.$patchv2('/newsfeed', { id, message })
  }

  love(id) {
    return this.$postv2('/newsfeed', { id, action: 'Love' })
  }

  unlove(id) {
    return this.$postv2('/newsfeed', { id, action: 'Unlove' })
  }

  async unfollow(id) {
    await this.$postv2('/newsfeed', { id, action: 'Unfollow' })
  }

  async report(id, reason) {
    await this.$postv2('/newsfeed', { id, reason, action: 'Report' })
  }

  async referto(id, type) {
    await this.$postv2('/newsfeed', { id, action: 'ReferTo' + type })
  }

  async unhide(id) {
    await this.$postv2('/newsfeed', { id, action: 'Unhide' })
  }

  async hide(id) {
    await this.$postv2('/newsfeed', { id, action: 'Hide' })
  }

  async convertToStory(id) {
    await this.$postv2('/newsfeed', { id, action: 'ConvertToStory' })
  }

  async seen(id) {
    await this.$postv2('/newsfeed', { id, action: 'Seen' })
  }

  del(id) {
    return this.$requestv2('DELETE', '/newsfeed/' + id, {
      headers: { 'Content-Type': 'application/json' },
    })
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
