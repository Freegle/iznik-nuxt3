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

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import dayjs from 'dayjs'
import { GChart } from 'vue-google-charts'
import { useMicroVolunteeringStore } from '~/stores/microvolunteering'

// Stores
const microVolunteeringStore = useMicroVolunteeringStore()

// Local state (formerly data())
const groupid = ref(0)
const busy = ref(true)

// Computed properties
const activityOptions = computed(() => {
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
})

const items = computed(() => {
  const itemsList = Object.values(microVolunteeringStore.list)
  itemsList.sort(function (a, b) {
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  })
  return itemsList
})

const userCounts = computed(() => {
  const ret = {}

  items.value.forEach((i) => {
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
})

const topUsers = computed(() => {
  return userCounts.value.slice(0, 10)
})

const userActivity = computed(() => {
  const ret = {}

  items.value.forEach((i) => {
    if (i.user) {
      if (ret[i.user.id]) {
        ret[i.user.id].push(i)
      } else {
        ret[i.user.id] = [i]
      }
    }
  })

  return ret
})

// Watchers
watch(groupid, (newVal) => {
  microVolunteeringStore.clear()
  fetchData()
})

// Lifecycle
onMounted(() => {
  microVolunteeringStore.clear()
  fetchData()
})

// Methods
function fetchData() {
  busy.value = true

  if (groupid.value) {
    const start = dayjs().subtract(90, 'day').format('YYYY-MM-DD')

    microVolunteeringStore.fetch({
      list: true,
      groupid: groupid.value,
      limit: 10000,
      start,
    })
  }

  busy.value = false
}

function activityData(data) {
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
}

function accuracy(data) {
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
}

function accuracyPercentage(data) {
  const score = accuracy(data)
  return Math.round((100 * score[0]) / (score[0] + score[1]))
}

function accuracyTotal(data) {
  const score = accuracy(data)
  return score[0] + score[1]
}

// Expose fetch method for tests (renamed to avoid conflict with native fetch)
defineExpose({
  fetch: fetchData,
})
</script>

<style scoped>
select {
  max-width: 300px;
}
</style>
