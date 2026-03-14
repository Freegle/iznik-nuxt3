import BaseAPI from '@/api/BaseAPI'

export default class SimulationAPI extends BaseAPI {
  listRuns() {
    return this.$get('/simulation', { action: 'listruns' })
  }

  getRun(runid) {
    return this.$get('/simulation', { action: 'getrun', runid })
  }

  getMessage(runid, index) {
    return this.$get('/simulation', { runid, index })
  }
}
