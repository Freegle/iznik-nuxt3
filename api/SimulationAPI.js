import BaseAPI from '@/api/BaseAPI'

export default class SimulationAPI extends BaseAPI {
  listRuns() {
    return this.$getv2('/simulation', { action: 'listruns' })
  }

  getRun(runid) {
    return this.$getv2('/simulation', { action: 'getrun', runid })
  }

  getMessage(runid, index) {
    return this.$getv2('/simulation', { runid, index })
  }
}
