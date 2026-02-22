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
    return this.$putv2('/donations', { userid, amount, date })
  }

  stripeIntent(params) {
    console.log('DonationsAPI.stripeIntent called with:', params)
    console.log('this.config:', this.config)
    return this.$post('/stripecreateintent', params)
  }

  stripeSubscription(amount) {
    return this.$post('/stripecreatesubscription', {
      amount,
    })
  }
}
