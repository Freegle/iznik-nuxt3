import BaseAPI from '@/api/BaseAPI'

export default class InvitationAPI extends BaseAPI {
  fetch(params) {
    return this.$getv2('/invitation', params)
  }

  async add(data) {
    const { id } = await this.$putv2('/invitation', data)
    return id
  }

  save(data) {
    return this.$patchv2('/invitation', data)
  }

  del(id) {
    return this.$del('/invitation', { id })
  }
}
