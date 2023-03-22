import BaseAPI from '@/api/BaseAPI'

export default class UserAPI extends BaseAPI {
  async fetch(id) {
    return await this.$getv2('/user/' + id)
  }

  async fetchPublicLocation(id) {
    return await this.$getv2('/user/' + id + '/publiclocation')
  }

  rate(id, rating, reason, text) {
    return this.$post('/user', {
      ratee: id,
      rating,
      action: 'Rate',
      reason,
      text,
    })
  }

  ratingReviewed(ratingid) {
    return this.$post('/user', {
      ratingid,
      action: 'RatingReviewed',
    })
  }

  unbounce(id) {
    return this.$post('/user', { id, action: 'Unbounce' })
  }

  addEmail(id, email, primary) {
    return this.$post('/user', { id, action: 'AddEmail', email, primary })
  }

  removeEmail(id, email) {
    return this.$post('/user', { id, action: 'RemoveEmail', email })
  }

  add(email, logError = true) {
    return this.$put('/user', { email }, logError)
  }

  merge(email1, email2, id1, id2, reason) {
    return this.$post('/user', {
      email1,
      email2,
      id1,
      id2,
      reason,
      action: 'Merge',
    })
  }

  save(event) {
    return this.$patch('/user', event)
  }

  purge(id) {
    return this.$del('/user', {
      id,
    })
  }
}
