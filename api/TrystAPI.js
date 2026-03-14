import BaseAPI from '@/api/BaseAPI'

export default class TrystAPI extends BaseAPI {
  async add(data) {
    const { id } = await this.$putv2('/tryst', data)
    return id
  }

  edit(data) {
    return this.$patchv2('/tryst', data)
  }

  fetch(params) {
    return this.$getv2('/tryst', params)
  }

  confirm(id) {
    return this.$postv2('/tryst', {
      id,
      confirm: true,
    })
  }

  decline(id) {
    return this.$postv2('/tryst', {
      id,
      decline: true,
    })
  }

  delete(data) {
    return this.$delv2('/tryst', data)
  }
}
