<template>
  <b-row class="m-0 pt-4">
    <b-col cols="12" lg="6" class="p-0" offset-lg="3">
      <b-row>
        <b-col>
          <div v-if="group">
            <GroupHeader
              :id="group.id"
              :key="'group-' + (group ? group.id : null)"
              :group="group"
              :show-join="false"
            />
            <div v-if="route.query.financialYear" class="mt-2 mb-3">
              <div class="bg-light p-2 rounded">
                <small class="text-muted">
                  <strong>Showing data for: {{ dateRangeDescription }}</strong>
                </small>
              </div>
            </div>
          </div>
          <div v-else>
            <div class="d-flex pl-1 bg-white">
              <b-img thumbnail src="/icon.png" class="titlelogo" />
              <div class="ml-2">
                <h2>Freegle</h2>
                <h5>
                  Give and get stuff for free in your local community. Don't
                  throw it away, give it away!
                </h5>
                <div v-if="route.query.financialYear" class="mt-1">
                  <small class="text-muted">
                    <strong>{{ dateRangeDescription }}</strong>
                  </small>
                </div>
              </div>
            </div>
          </div>
        </b-col>
      </b-row>
      <b-row v-if="loading">
        <b-col class="text-center">
          <b-img v-if="loading" lazy src="/loader.gif" alt="Loading..." />
        </b-col>
      </b-row>
      <div v-if="dataready">
        <StatsImpact
          :range="dateRangeDescription"
          :total-benefit="totalBenefit"
          :total-c-o2="totalCO2"
          :total-weight="totalWeight"
          class="mt-2"
        />
        <ActivityGraph
          :groupid="group ? group.id : null"
          :systemwide="group <= 0"
          :start="start.toDate()"
          :end="end.toDate()"
        />
        <div class="d-flex mt-2 chart-wrapper">
          <b-card variant="white" class="chart">
            <b-card-text>
              Here you can see how often people give things away compared to how
              often they ask for things.
              <GChart
                type="PieChart"
                :data="balanceData"
                :options="balanceOptions"
              />
            </b-card-text>
          </b-card>
          <b-card variant="white" no-body class="chart">
            <b-card-body>
              These charts show how often people are successful in giving
              something away or getting something - when they let us know!
              <div class="d-flex">
                <GChart
                  type="PieChart"
                  :data="offerOutcomeData"
                  :options="offerOutcomeOptions"
                  class="w-50"
                />
                <GChart
                  type="PieChart"
                  :data="wantedOutcomeData"
                  :options="wantedOutcomeOptions"
                  class="w-50"
                />
              </div>
            </b-card-body>
          </b-card>
        </div>
        <b-card variant="white" class="mt-2">
          <b-card-text>
            <h3>Weights</h3>
            <p>
              This is an estimate of the weight of items we have diverted from
              the waste stream. People don't always tell us when things have
              worked, so it's likely to be an underestimate. Benefit and CO2 are
              calculated using a
              <a
                href="https://www.wrap.ngo/resources/tool/environmental-and-economic-benefits-re-use"
                target="_blank"
                rel="noopener noreferrer"
                >tool from WRAP</a
              >. Figures are only available since September 2016 and may change
              as we improve our estimates.
            </p>
            <GChart
              type="ColumnChart"
              :data="weightData"
              :options="weightOptions"
            />
          </b-card-text>
        </b-card>
        <b-card variant="white" class="mt-2">
          <b-card-text>
            <h3>Members</h3>
            <p>Here you can see how many members there are.</p>
            <GChart
              type="LineChart"
              :data="memberData"
              :options="memberOptions"
            />
          </b-card-text>
        </b-card>
        <p class="mt-2">
          If you want to find statistics for particular councils, click
          <nuxt-link no-prefetch to="/stats/authorities">here</nuxt-link>.
        </p>
      </div>
    </b-col>
    <b-col cols="0" md="3" class="d-none d-md-block" />
  </b-row>
</template>
<script setup>
import dayjs from 'dayjs'
import { GChart } from 'vue-google-charts'
import {
  ref,
  computed,
  defineAsyncComponent,
  onMounted,
  nextTick,
  useRoute,
  useHead,
  useRuntimeConfig,
} from '#imports'
import StatsImpact from '~/components/StatsImpact.vue'
import ActivityGraph from '~/components/ActivityGraph.vue'
import { buildHead } from '~/composables/useBuildHead'
import { useGroupStore } from '~/stores/group'
import { useStatsStore } from '~/stores/stats'

const GroupHeader = defineAsyncComponent(() =>
  import('~/components/GroupHeader.vue')
)

// Setup stores and route
const groupStore = useGroupStore()
const statsStore = useStatsStore()
const runtimeConfig = useRuntimeConfig()
const route = useRoute()

// Reactive state
const loading = ref(false)
const start = ref(null)
const end = ref(null)
const dataready = ref(false)

// Route parameters
const groupname = route.params.groupname
const group = computed(() => {
  return groupStore.get(groupname)
})
const groupid = computed(() => {
  return groupStore.get(groupname)?.id || null
})

// Chart options
const balanceOptions = {
  title: 'Post Balance',
  chartArea: { width: '80%', height: '80%' },
  colors: ['green', 'blue'],
  tooltip: {
    text: 'percentage',
  },
  slices2: {
    1: { offset: 0.2 },
    2: { offset: 0.2 },
  },
}

const offerOutcomeOptions = {
  title: 'Offer Outcome',
  chartArea: { width: '80%', height: '80%' },
  colors: ['green', 'blue'],
  tooltip: {
    text: 'percentage',
  },
  slices2: {
    1: { offset: 0.2 },
    2: { offset: 0.2 },
  },
  legend: { position: 'bottom', alignment: 'center' },
}

const wantedOutcomeOptions = {
  title: 'Wanted Balance',
  chartArea: { width: '80%', height: '80%' },
  colors: ['green', 'blue'],
  tooltip: {
    text: 'percentage',
  },
  slices2: {
    1: { offset: 0.2 },
    2: { offset: 0.2 },
  },
  legend: { position: 'bottom', alignment: 'center' },
}

const weightOptions = {
  title: 'Weights (kg)',
  interpolateNulls: false,
  animation: {
    duration: 5000,
    easing: 'out',
    startup: true,
  },
  legend: { position: 'none' },
  chartArea: { width: '80%', height: '80%' },
  bar: { groupWidth: '100%' },
  vAxis: { viewWindow: { min: 0 } },
  hAxis: {
    format: 'MMM yyyy',
  },
  series: {
    0: { color: 'green' },
  },
}

const memberOptions = {
  title: 'Members',
  interpolateNulls: false,
  animation: {
    duration: 5000,
    easing: 'out',
    startup: true,
  },
  legend: { position: 'none' },
  chartArea: { width: '80%', height: '80%' },
  vAxis: { viewWindow: { min: 0 } },
  hAxis: {
    format: 'MMM yyyy',
  },
  series: {
    0: { color: 'blue' },
  },
}

// Computed properties
const dateRangeDescription = computed(() => {
  const fyParam = route.query.financialYear
  if (fyParam === 'true') {
    return 'the last completed financial year (Apr 6 - Apr 5)'
  } else if (fyParam && fyParam.toLowerCase().startsWith('fy')) {
    const fyYear = fyParam.substring(2)
    let startYear

    if (fyYear.length === 2) {
      // FY24 format
      startYear = parseInt('20' + fyYear, 10)
    } else if (fyYear.length === 4) {
      // FY2024 format
      startYear = parseInt(fyYear, 10)
    }

    if (!isNaN(startYear) && startYear >= 2000 && startYear <= 2099) {
      return `financial year ${startYear}-${(startYear + 1)
        .toString()
        .substring(2)} (Apr 6 ${startYear} - Apr 5 ${startYear + 1})`
    }
  }
  return 'the last 12 months'
})

const totalWeight = computed(() => {
  const weights = statsStore?.Weight
  let total = 0
  const now = dayjs()

  if (weights) {
    for (const w of weights) {
      if (now.diff(dayjs(w.date), 'days') <= 365) {
        total += w.count
      }
    }
  }

  return total / 1000
})

// Benefit of reuse per tonne is £711 and CO2 impact is -0.51tCO2eq based on WRAP figures.
// https://wrap.org.uk/resources/tool/benefits-reuse-tool
const totalBenefit = computed(() => {
  return totalWeight.value * 711
})

const totalCO2 = computed(() => {
  return totalWeight.value * 0.51
})

const balanceData = computed(() => {
  const breakdown = statsStore.MessageBreakdown
  return [
    ['Type', 'Count'],
    ['Offer', parseInt(breakdown?.Offer)],
    ['Wanted', parseInt(breakdown?.Wanted)],
  ]
})

const offerOutcomeData = computed(() => {
  const breakdown = statsStore.Outcomes
  let totalOffer = 0
  let takenOffer = 0
  let withdrawnOffer = 0

  if (breakdown?.Offer) {
    for (const d of breakdown?.Offer) {
      totalOffer += d.count

      if (d.outcome === 'Taken') {
        takenOffer = d.count
      } else if (d.outcome === 'Withdrawn') {
        withdrawnOffer = d.count
      }
    }
  }

  const ret = [
    ['Type', 'Count'],
    ['Taken', Math.round((100 * takenOffer) / totalOffer)],
    ['Withdrawn', Math.round((100 * withdrawnOffer) / totalOffer)],
  ]

  return ret
})

const wantedOutcomeData = computed(() => {
  const breakdown = statsStore.Outcomes
  let totalWanted = 0
  let receivedWanted = 0
  let withdrawnWanted = 0

  if (breakdown?.Wanted) {
    for (const d of breakdown?.Wanted) {
      totalWanted += d.count

      if (d.outcome === 'Received') {
        receivedWanted = d.count
      } else if (d.outcome === 'Withdrawn') {
        withdrawnWanted = d.count
      }
    }
  }

  const ret = [
    ['Type', 'Count'],
    ['Received', Math.round((100 * receivedWanted) / totalWanted)],
    ['Withdrawn', Math.round((100 * withdrawnWanted) / totalWanted)],
  ]

  return ret
})

const memberData = computed(() => {
  const ret = [['Date', 'Count']]
  const members = statsStore.ApprovedMemberCount

  if (members) {
    for (const a of members) {
      ret.push([new Date(a.date), parseInt(a.count)])
    }
  }

  return ret
})

const weightData = computed(() => {
  const ret = [['Date', 'Count']]
  const activity = statsStore.Weight
  let lastmon = null
  let count = 0

  if (activity) {
    for (const a of activity) {
      const mon = a.date.substring(0, 7)

      if (mon !== lastmon) {
        if (lastmon !== null) {
          ret.push([new Date(lastmon + '-01'), count])
          count = 0
        }

        lastmon = mon
      }

      count += a.count
    }
  }

  if (lastmon !== null) {
    ret.push([new Date(lastmon + '-01'), count])
  }

  return ret
})

// Computed page title based on financial year parameter
const pageTitle = computed(() => {
  const fyParam = route.query.financialYear
  let titleSuffix = ''

  if (fyParam === 'true') {
    titleSuffix = ' - Last Completed Financial Year'
  } else if (fyParam && fyParam.toLowerCase().startsWith('fy')) {
    const fyYear = fyParam.substring(2)
    let startYear

    if (fyYear.length === 2) {
      // FY24 format
      startYear = parseInt('20' + fyYear, 10)
    } else if (fyYear.length === 4) {
      // FY2024 format
      startYear = parseInt(fyYear, 10)
    }

    if (!isNaN(startYear) && startYear >= 2000 && startYear <= 2099) {
      titleSuffix = ` - Financial Year ${startYear}-${(startYear + 1)
        .toString()
        .substring(2)}`
    }
  }

  if (groupname) {
    return 'Statistics for ' + groupname + titleSuffix
  } else {
    return 'Statistics' + titleSuffix
  }
})

const pageDescription = computed(() => {
  const fyParam = route.query.financialYear
  let descSuffix = ''

  if (fyParam === 'true') {
    descSuffix = ' for the last completed financial year'
  } else if (fyParam && fyParam.toLowerCase().startsWith('fy')) {
    const fyYear = fyParam.substring(2)
    let startYear

    if (fyYear.length === 2) {
      // FY24 format
      startYear = parseInt('20' + fyYear, 10)
    } else if (fyYear.length === 4) {
      // FY2024 format
      startYear = parseInt(fyYear, 10)
    }

    if (!isNaN(startYear) && startYear >= 2000 && startYear <= 2099) {
      descSuffix = ` for financial year ${startYear}-${(startYear + 1)
        .toString()
        .substring(2)}`
    }
  }

  if (groupname) {
    return 'See stats and graphs for ' + groupname + descSuffix
  } else {
    return 'See stats and graphs for Freegle' + descSuffix
  }
})

// Set page head
if (groupname) {
  await groupStore.fetch(groupname, true)

  useHead(
    buildHead(
      route,
      runtimeConfig,
      pageTitle.value,
      pageDescription.value,
      group.value?.profile ? group.value?.profile : null
    )
  )
} else {
  useHead(
    buildHead(route, runtimeConfig, pageTitle.value, pageDescription.value)
  )
}

// Helper function to calculate financial year dates
const getFinancialYearDates = (fyParam = null) => {
  let fyStart, fyEnd

  if (
    fyParam &&
    typeof fyParam === 'string' &&
    fyParam.toLowerCase().startsWith('fy')
  ) {
    // Parse FY24 or FY2024 format - extract the year part
    const fyYear = fyParam.substring(2)
    let startYear

    if (fyYear.length === 2) {
      // FY24 format
      startYear = parseInt('20' + fyYear, 10)
    } else if (fyYear.length === 4) {
      // FY2024 format
      startYear = parseInt(fyYear, 10)
    } else {
      return null
    }

    if (!isNaN(startYear) && startYear >= 2000 && startYear <= 2099) {
      // FY24 or FY2024 means April 6, 2024 to April 5, 2025
      fyStart = dayjs()
        .year(startYear)
        .month(3) // April (0-indexed)
        .date(6)
        .startOf('day')
      fyEnd = dayjs()
        .year(startYear + 1)
        .month(3) // April (0-indexed)
        .date(5)
        .endOf('day')

      return { start: fyStart, end: fyEnd, year: fyYear }
    }
  }

  // Default: calculate last completed financial year
  const now = dayjs()
  const currentYear = now.year()

  // UK financial year runs from April 6 to April 5
  if (now.month() > 3 || (now.month() === 3 && now.date() >= 6)) {
    // We're in the current financial year (after April 6)
    // So last completed financial year is previous year April 6 to current year April 5
    fyStart = dayjs()
      .year(currentYear - 1)
      .month(3)
      .date(6)
      .startOf('day')
    fyEnd = dayjs().year(currentYear).month(3).date(5).endOf('day')
  } else {
    // We're before April 6, so last completed financial year is two years ago
    fyStart = dayjs()
      .year(currentYear - 2)
      .month(3)
      .date(6)
      .startOf('day')
    fyEnd = dayjs()
      .year(currentYear - 1)
      .month(3)
      .date(5)
      .endOf('day')
  }

  return { start: fyStart, end: fyEnd, year: null }
}

// Lifecycle hooks
onMounted(async () => {
  loading.value = true

  // Check if financialYear parameter is set (supports FY24 format or 'true' for last completed FY)
  const fyParam = route.query.financialYear
  if (
    fyParam &&
    (fyParam === 'true' || fyParam.toLowerCase().startsWith('fy'))
  ) {
    const fyDates = getFinancialYearDates(fyParam === 'true' ? null : fyParam)
    start.value = fyDates.start
    end.value = fyDates.end
  } else {
    // Default behavior - last 12 months minus current month
    start.value = dayjs()
      .subtract(1, 'year')
      .subtract(1, 'month')
      .startOf('month')

    end.value = dayjs().subtract(1, 'month').endOf('month')
  }

  await statsStore.clear()
  console.log('Mounted', groupid.value)
  await statsStore.fetch({
    group: groupid.value,
    grouptype: 'Freegle',
    systemwide: groupid.value === null,
    start: start.value.format('YYYY-MM-DD'),
    end: end.value.format('YYYY-MM-DD'),
  })

  loading.value = false

  nextTick(() => {
    // This is a bit of a hack to make sure everything is in the DOM and the data is ready, otherwise the charts
    // break.
    dataready.value = true
  })
})
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';

.chart-wrapper {
  flex-direction: column;

  @include media-breakpoint-up(md) {
    flex-direction: row;
  }
}

.card {
  &.chart {
    height: 100%;
  }
}

.titlelogo {
  width: 140px;
  height: 140px;
  object-fit: cover;
}

.purple {
  color: $color-purple !important;
}

.gold {
  color: $color-gold !important;
}

.green {
  color: $color-green--darker !important;
}
</style>
