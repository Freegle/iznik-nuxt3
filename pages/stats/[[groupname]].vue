<template>
  <b-row class="m-0 pt-4">
    <b-col cols="12" lg="6" class="p-0" offset-lg="3">
      <b-row>
        <b-col>
          <GroupHeader
            v-if="group"
            :id="group.id"
            :key="'group-' + (group ? group.id : null)"
            :group="group"
            :show-join="false"
          />
          <div v-else>
            <div class="d-flex pl-1 bg-white">
              <b-img thumbnail src="/icon.png" class="titlelogo" />
              <div class="ml-2">
                <h2>Freegle</h2>
                <h5>
                  Give and get stuff for free in your local community. Don't
                  throw it away, give it away!
                </h5>
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
          range="the last 12 months"
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
<script>
import dayjs from 'dayjs'
import { GChart } from 'vue-google-charts'
import { useRoute } from 'vue-router'
import StatsImpact from '~/components/StatsImpact'
import ActivityGraph from '~/components/ActivityGraph'
import { buildHead } from '~/composables/useBuildHead'
import { useGroupStore } from '~/stores/group'
import { useStatsStore } from '~/stores/stats'

const GroupHeader = defineAsyncComponent(() =>
  import('~/components/GroupHeader.vue')
)

export default {
  components: {
    ActivityGraph,
    StatsImpact,
    GChart,
    GroupHeader,
  },
  async setup() {
    const groupStore = useGroupStore()
    const statsStore = useStatsStore()
    const runtimeConfig = useRuntimeConfig()
    const route = useRoute()

    const groupname = route.params.groupname
    const group = computed(() => {
      return groupStore.get(groupname)
    })
    const groupid = computed(() => {
      return groupStore.get(groupname)?.id || null
    })

    if (groupname) {
      await groupStore.fetch(groupname, true)

      useHead(
        buildHead(
          route,
          runtimeConfig,
          'Statistics for ' + groupname,
          'See stats and graphs for ' + groupname,
          group.value?.profile ? group.value?.profile : null
        )
      )
    } else {
      useHead(
        buildHead(
          route,
          runtimeConfig,
          'Statistics',
          'See stats and graphs for Freegle'
        )
      )
    }

    return {
      groupStore,
      statsStore,
      groupname,
      groupid,
      group,
    }
  },
  data() {
    return {
      loading: false,
      start: null,
      end: null,
      dataready: false,
      balanceOptions: {
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
      },
      offerOutcomeOptions: {
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
      },
      wantedOutcomeOptions: {
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
      },
      weightOptions: {
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
      },
      memberOptions: {
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
      },
    }
  },
  computed: {
    totalWeight() {
      const weights = this.statsStore?.Weight
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
    },
    // Benefit of reuse per tonne is £711 and CO2 impact is -0.51tCO2eq based on WRAP figures.
    // https://wrap.org.uk/resources/tool/benefits-reuse-tool
    totalBenefit() {
      return this.totalWeight * 711
    },
    totalCO2() {
      return this.totalWeight * 0.51
    },
    balanceData() {
      const breakdown = this.statsStore.MessageBreakdown
      return [
        ['Type', 'Count'],
        ['Offer', parseInt(breakdown?.Offer)],
        ['Wanted', parseInt(breakdown?.Wanted)],
      ]
    },
    offerOutcomeData() {
      const breakdown = this.statsStore.Outcomes
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
    },
    wantedOutcomeData() {
      const breakdown = this.statsStore.Outcomes
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
    },
    memberData() {
      const ret = [['Date', 'Count']]
      const members = this.statsStore.ApprovedMemberCount

      if (members) {
        for (const a of members) {
          ret.push([new Date(a.date), parseInt(a.count)])
        }
      }

      return ret
    },
    weightData() {
      const ret = [['Date', 'Count']]
      const activity = this.statsStore.Weight
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
    },
  },
  async mounted() {
    this.loading = true

    this.start = dayjs()
      .subtract(1, 'year')
      .subtract(1, 'month')
      .startOf('month')

    this.end = dayjs().subtract(1, 'month').endOf('month')

    await this.statsStore.clear()
    console.log('Mounted', this.groupid)
    await this.statsStore.fetch({
      group: this.groupid,
      grouptype: 'Freegle',
      systemwide: this.groupid === null,
      start: this.start.format('YYYY-MM-DD'),
      end: this.end.format('YYYY-MM-DD'),
    })

    this.loading = false
    this.$nextTick(() => {
      // This is a bit of a hack to make sure everything is in the DOM and the data is ready, otherwise the charts
      // break.
      this.dataready = true
    })
  },

  methods: {},
}
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
