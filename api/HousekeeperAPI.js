import BaseAPI from '@/api/BaseAPI'

export default class HousekeeperAPI extends BaseAPI {
  fetchTasks() {
    return this.$getv2('/housekeeper/tasks')
  }

  fetchCronJobs() {
    return this.$getv2('/housekeeper/cronjobs')
  }

  completeTask(taskKey) {
    return this.$postv2(`/housekeeper/tasks/${taskKey}/complete`)
  }
}
