import BaseAPI from '@/api/BaseAPI'

export default class UserAPI extends BaseAPI {
  async fetch(id) {
    if (isNaN(id)) {
      throw new TypeError('Invalid user ID: ' + id)
    }

    return await this.$getv2('/user/' + id)
  }

  // Fetch multiple users in a single request
  async fetchMultiple(ids) {
    if (!ids || !ids.length) {
      return []
    }

    return await this.$getv2('/user/' + ids.join(','))
  }

  async fetchMT(params) {
    // MT fetch uses complex query params not supported by V2 yet
    return await this.$get('/user', params)
  }

  async fetchByEmail(email, logError = true) {
    return await this.$getv2('/user/byemail/' + email, {}, logError)
  }

  async fetchPublicLocation(id) {
    return await this.$getv2('/user/' + id + '/publiclocation')
  }

  rate(id, rating, reason, text) {
    return this.$postv2('/user', {
      ratee: id,
      rating,
      action: 'Rate',
      reason,
      text,
    })
  }

  ratingReviewed(ratingid) {
    return this.$postv2('/user', {
      ratingid,
      action: 'RatingReviewed',
    })
  }

  unbounce(id) {
    return this.$postv2('/user', { id, action: 'Unbounce' })
  }

  addEmail(id, email, primary) {
    return this.$postv2('/user', { id, action: 'AddEmail', email, primary })
  }

  removeEmail(id, email) {
    return this.$postv2('/user', { id, action: 'RemoveEmail', email })
  }

  add(email, logError = true) {
    return this.$putv2('/user', { email }, logError)
  }

  signUp(params, logError = true) {
    return this.$putv2('/user', params, logError)
  }

  merge(email1, email2, id1, id2, reason) {
    return this.$postv2('/user', {
      email1,
      email2,
      id1,
      id2,
      reason,
      action: 'Merge',
    })
  }

  save(event) {
    return this.$patchv2('/user', event)
  }

  muteOnChitChat(userid) {
    return this.$patchv2('/user', {
      id: userid,
      newsfeedmodstatus: 'Suppressed',
    })
  }

  unMuteOnChitChat(userid) {
    return this.$patchv2('/user', {
      id: userid,
      newsfeedmodstatus: 'Unmoderated',
    })
  }

  purge(id) {
    return this.$delv2('/user', {
      id,
    })
  }

  engaged(engageid) {
    return this.$postv2('/user', {
      engageid,
    })
  }
}
