import BaseAPI from '@/api/BaseAPI'

export default class BanditAPI extends BaseAPI {
  async choose({ uid }) {
    const ret = await this.$getv2('/abtest', { uid })
    return ret.variant
  }

  shown({ uid, variant }) {
    return this.$postv2('/abtest', { uid, variant, shown: true })
  }

  chosen({ uid, variant, score, info }) {
    return this.$postv2('/abtest', { uid, variant, action: true, score, info })
  }
}
