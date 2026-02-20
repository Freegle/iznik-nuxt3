import BaseAPI from '@/api/BaseAPI'

export default class TeamAPI extends BaseAPI {
  async fetch(params) {
    const { team, teams } = await this.$getv2('/team', params)
    return teams || team
  }

  async add(params) {
    await this.$patchv2('/team', {
      action: 'Add',
      ...params,
    })
  }

  async remove(params) {
    await this.$patchv2('/team', {
      action: 'Remove',
      ...params,
    })
  }
}
