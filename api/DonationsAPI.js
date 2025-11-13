import BaseAPI from '@/api/BaseAPI'

export default class DonationsAPI extends BaseAPI {
  async fetch(groupid = null) {
    const ret = await this.$getv2('/donations', { groupid })
    const { target, raised } = ret
    return {
      target: Math.round(parseInt(target)),
      raised: Math.round(parseInt(raised)),
    }
  }

  add(userid, amount, date) {
    return this.$put('/donations', { userid, amount, date })
  }

  stripeIntent(params) {
    return this.$post('/stripecreateintent', params)
  }

  stripeSubscription(amount) {
    return this.$post('/stripecreatesubscription', {
      amount,
    })
  }
}
