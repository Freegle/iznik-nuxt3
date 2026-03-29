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
        <Spinner :size="50" />
      </div>
      <div v-else-if="!groupid" class="mt-2">
        <NoticeMessage variant="warning">
          Please choose a community.
        </NoticeMessage>
      </div>
      <div v-else-if="!topUsers.length" class="mt-2">
        <NoticeMessage variant="info">
          No micro-volunteering activity found for this community in the last 90
          days.
        </NoticeMessage>
      </div>
      <div v-else class="mt-2">
        <h2>Top Micro-volunteers</h2>
        <b-table-simple class="bg-white">
          <b-thead class="fw-bold">
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
            <b-tr v-for="entry in topUsers" :key="entry.userid">
              <b-td>
                <nuxt-link
                  :to="'/members/approved/' + groupid + '/' + entry.userid"
                >
                  <v-icon icon="hashtag" scale="0.8" />{{ entry.userid }}
                </nuxt-link>
              </b-td>
              <b-td>
                {{ userStore.byId(entry.userid)?.displayname || '...' }}
              </b-td>
              <b-td>
                {{ userStore.byId(entry.userid)?.trustlevel || '' }}
              </b-td>
              <b-td>
                <div v-if="accuracyTotal(userActivity[entry.userid]) === 0">
                  <span class="small text-muted"> No data </span>
                </div>
                <div v-else>
                  {{ accuracyPercentage(userActivity[entry.userid]) }}%
                  <span class="small text-muted">
                    from {{ accuracyTotal(userActivity[entry.userid]) }}
                  </span>
                </div>
              </b-td>
              <b-td>
                <GChart
                  type="AreaChart"
                  :data="activityData(userActivity[entry.userid])"
                  :options="activityOptions"
                  style="width: 300px; height: 100px"
                />
              </b-td>
              <b-td>
                <ModMicrovolunteeringDetailsButton
                  :userid="entry.userid"
                  :items="userActivity[entry.userid]"
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
import { useUserStore } from '~/stores/user'

// Stores
const microVolunteeringStore = useMicroVolunteeringStore()
const userStore = useUserStore()

// Local state
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
    if (i.userid) {
      if (ret[i.userid]) {
        ret[i.userid]++
      } else {
        ret[i.userid] = 1
      }
    }
  })

  const ret2 = []

  for (const r in ret) {
    if (ret[r]) {
      ret2.push({
        userid: parseInt(r),
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
    if (i.userid) {
      if (ret[i.userid]) {
        ret[i.userid].push(i)
      } else {
        ret[i.userid] = [i]
      }
    }
  })

  return ret
})

// Watchers
watch(groupid, () => {
  microVolunteeringStore.clear()
  fetchData()
})

// Lifecycle
onMounted(() => {
  microVolunteeringStore.clear()
  fetchData()
})

// Methods
async function fetchData() {
  busy.value = true

  if (groupid.value) {
    const start = dayjs().subtract(90, 'day').format('YYYY-MM-DD')

    await microVolunteeringStore.fetch({
      list: true,
      groupid: groupid.value,
      limit: 10000,
      start,
    })

    // Fetch user details for each unique userid in the results.
    const uniqueUserIds = [
      ...new Set(items.value.map((i) => i.userid).filter(Boolean)),
    ]
    await Promise.all(uniqueUserIds.map((uid) => userStore.fetch(uid, false)))
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

// Expose fetch method for tests
defineExpose({
  fetch: fetchData,
})
</script>

<style scoped>
select {
  max-width: 300px;
}
</style>
