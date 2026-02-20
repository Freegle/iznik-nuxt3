import BaseAPI from '@/api/BaseAPI'

export default class GiftAidAPI extends BaseAPI {
  async get() {
    // v2 API returns data directly without ret/status wrapper
    const ret = await this.$getv2('/giftaid', {})
    return ret
  }

  async list() {
    const ret = await this.$getv2('/giftaid', {
      all: true,
    })

    return ret.giftaids
  }

  async search(val) {
    const ret = await this.$getv2('/giftaid', {
      search: val,
    })

    return ret.giftaids
  }

  save({ period, fullname, homeaddress }) {
    return this.$postv2('/giftaid', { period, fullname, homeaddress })
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
    return this.$patchv2('/giftaid', data)
  }

  remove() {
    return this.$delv2('/giftaid')
  }
}
