import BaseAPI from '@/api/BaseAPI'

export default class TeamAPI extends BaseAPI {
  async fetch(params) {
    console.log('TeamAPI',params)
    const { team, teams } = await this.$get('/team', params)
    return teams || team
  }
}
