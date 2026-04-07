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

  save({ period, fullname, firstname, lastname, homeaddress }) {
    return this.$postv2('/giftaid', {
      period,
      fullname,
      firstname,
      lastname,
      homeaddress,
    })
  }

  edit(
    id,
    period,
    fullname,
    homeaddress,
    postcode,
    housenameornumber,
    reviewed,
    deleted,
    firstname,
    lastname
  ) {
    const data = {
      id,
      period,
      fullname,
      firstname,
      lastname,
      homeaddress,
      postcode,
      housenameornumber,
      reviewed,
      deleted,
      firstname,
      lastname,
    }
    return this.$patchv2('/giftaid', data)
  }

  remove() {
    return this.$delv2('/giftaid')
  }
}
