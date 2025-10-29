<template>
  <div>
    <client-only>
      <ScrollToTop />
      <ModHelpMicrovolunteering />
      <ModGroupSelect
        v-model="groupid"
        modonly
        all
        remember="membersmicrovol"
        :disabled="busy"
      />

      <div v-if="busy" class="d-flex justify-content-around">
        <b-img lazy src="/loader.gif" alt="Loading" />
      </div>
      <div v-else-if="!groupid" class="mt-2">
        <NoticeMessage variant="warning">
          Please choose a community.
        </NoticeMessage>
      </div>
      <div v-else class="mt-2">
        <h2>Top Micro-volunteers</h2>
        <b-table-simple class="bg-white">
          <b-thead class="font-weight-bold">
            <b-tr>
              <b-th>ID</b-th>
              <b-th>Name</b-th>
              <b-th>Level</b-th>
              <b-th>Accuracy</b-th>
              <b-th>Micro-volunteering Activity</b-th>
              <b-th>Details</b-th>
            </b-tr>
          </b-thead>
          <b-tbody>
            <b-tr v-for="user in topUsers" :key="user.userid">
              <b-td>
                <nuxt-link
                  :to="'/members/approved/' + groupid + '/' + user.userid"
                >
                  <v-icon icon="hashtag" scale="0.8" />{{ user.userid }}
                </nuxt-link>
              </b-td>
              <b-td>
                {{ userActivity[user.userid][0].user.displayname }}
              </b-td>
              <b-td>
                {{ userActivity[user.userid][0].user.trustlevel }}
              </b-td>
              <b-td>
                <div v-if="accuracyTotal(userActivity[user.userid]) === 0">
                  <span class="small text-muted"> No data </span>
                </div>
                <div v-else>
                  {{ accuracyPercentage(userActivity[user.userid]) }}%
                  <span class="small text-muted">
                    from {{ accuracyTotal(userActivity[user.userid]) }}
                  </span>
                </div>
              </b-td>
              <b-td>
                <GChart
                  type="AreaChart"
                  :data="activityData(userActivity[user.userid])"
                  :options="activityOptions"
                  style="width: 300px; height: 100px"
                />
              </b-td>
              <b-td>
                <ModMicrovolunteeringDetailsButton
                  :user="userActivity[user.userid][0].user"
                  :items="userActivity[user.userid]"
                />
              </b-td>
            </b-tr>
          </b-tbody>
        </b-table-simple>
      </div>
    </client-only>
  </div>
</template>
<script>
import dayjs from 'dayjs'
import { GChart } from 'vue-google-charts'
import { useMicroVolunteeringStore } from '~/stores/microvolunteering'
import { useModGroupStore } from '@/stores/modgroup'

export default {
  components: {
    GChart,
  },
  setup() {
    const microVolunteeringStore = useMicroVolunteeringStore()
    return {
      microVolunteeringStore,
    }
  },
  data() {
    return {
      groupid: 0,
      busy: true,
    }
  },
  computed: {
    activityOptions() {
      return {
        interpolateNulls: false,
        legend: { position: 'none' },
        vAxis: { viewWindow: { min: 0 } },
        hAxis: {
          format: 'MMM yyyy',
        },
        series: {
          0: { color: 'blue' },
        },
      }
    },
    items() {
      const items = Object.values(this.microVolunteeringStore.list)
      items.sort(function (a, b) {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      })

      return items
    },
    userCounts() {
      const ret = {}

      this.items.forEach((i) => {
        if (i.user) {
          if (ret[i.user.id]) {
            ret[i.user.id]++
          } else {
            ret[i.user.id] = 1
          }
        }
      })

      const ret2 = []

      for (const r in ret) {
        if (ret[r]) {
          ret2.push({
            userid: r,
            count: ret[r],
          })
        }
      }

      ret2.sort(function (a, b) {
        return b.count - a.count
      })

      return ret2
    },
    topUsers() {
      return this.userCounts.slice(0, 10)
    },
    userActivity() {
      const ret = {}

      this.items.forEach((i) => {
        if (i.user) {
          if (ret[i.user.id]) {
            ret[i.user.id].push(i)
          } else {
            ret[i.user.id] = [i]
          }
        }
      })

      return ret
    },
  },
  watch: {
    groupid(newVal) {
      this.microVolunteeringStore.clear()
      this.fetch()
    },
  },
  mounted() {
    const modGroupStore = useModGroupStore()
    modGroupStore.getModGroups()
    this.microVolunteeringStore.clear()
    this.fetch()
  },
  methods: {
    async fetch() {
      this.busy = true

      if (this.groupid) {
        const start = dayjs().subtract(90, 'day').format('YYYY-MM-DD')

        this.microVolunteeringStore.fetch({
          list: true,
          groupid: this.groupid,
          limit: 10000,
          start,
        })
      }

      this.busy = false
    },
    activityData(data) {
      const dates = []

      // Empty out the series so that we get data at each point.
      for (let i = 0; i <= 90; i++) {
        dates[dayjs().subtract(i, 'day').format('YYYY-MM-DD')] = 0
      }

      data.forEach((d) => {
        const date = dayjs(d.timestamp).format('YYYY-MM-DD')

        if (!dates[date]) {
          dates[date] = 0
        }

        dates[date]++
      })

      const ret = [['Date', 'Count']]

      for (const date in dates) {
        ret.push([new Date(date), dates[date]])
      }

      return ret
    },
    accuracy(data) {
      let right = 0
      let wrong = 0

      data.forEach((d) => {
        if (d.score_positive) {
          right++
        } else if (d.score_negative) {
          wrong++
        }
      })

      return [right, wrong]
    },
    accuracyPercentage(data) {
      const score = this.accuracy(data)
      return Math.round((100 * score[0]) / (score[0] + score[1]))
    },
    accuracyTotal(data) {
      const score = this.accuracy(data)
      return score[0] + score[1]
    },
  },
}
</script>
<style scoped>
select {
  max-width: 300px;
}
</style>
