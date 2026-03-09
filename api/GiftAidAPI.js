import BaseAPI from '@/api/BaseAPI'

export default class GiftAidAPI extends BaseAPI {
  async get() {
    try {
      // logError=false: v2 API returns 404 when user has no declaration
      return await this.$getv2('/giftaid', {}, false)
    } catch (e) {
      return null
    }
  }

  async list() {
    const ret = await this.$get('/giftaid', {
      all: true,
    })

    return ret.giftaids
  }

  async search(val) {
    const ret = await this.$get('/giftaid', {
      search: val,
    })

    return ret.giftaids
  }

  save({ period, fullname, homeaddress }) {
    return this.$post('/giftaid', { period, fullname, homeaddress })
  }

  edit(
    id,
    period,
    fullname,
    homeaddress,
    postcode,
    housenameornumber,
    reviewed,
    deleted
  ) {
    const data = {
      id,
      period,
      fullname,
      homeaddress,
      postcode,
      housenameornumber,
      reviewed,
      deleted,
    }
    return this.$patch('/giftaid', data)
  }

  remove() {
    return this.$del('/giftaid')
  }
}
