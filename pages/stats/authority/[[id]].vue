<template>
  <div class="pt-4">
    <b-row v-if="!stats">
      <b-col class="text-center">
        <h4>Crunching the numbers...</h4>
        <p>This may take a minute.</p>
        <b-img lazy src="/loader.gif" alt="Loading" />
      </b-col>
    </b-row>
    <div>
      <div v-if="tables">
        <b-row class="m-0">
          <b-col cols="0" md="3" class="d-none d-md-block" />
          <b-col v-if="authority" cols="12" md="6" class="p-0 bg-white">
            <b-img
              thumbnail
              src="/icon.png"
              class="titlelogo"
              @click="toggle"
            />
            <h2>Freegle in {{ authority.name }}</h2>
            <p>This is a report of the last 3 complete months.</p>
            <h3>Local Authority Data</h3>
            <b-table-simple>
              <b-thead>
                <b-tr>
                  <b-th />
                  <b-th>{{ last3MonthsLabels[0].toLocaleString() }}</b-th>
                  <b-th>{{ last3MonthsLabels[1].toLocaleString() }}</b-th>
                  <b-th>{{ last3MonthsLabels[2].toLocaleString() }}</b-th>
                  <b-th>Total</b-th>
                </b-tr>
              </b-thead>
              <b-tbody>
                <b-tr>
                  <b-td>Memberships</b-td>
                  <b-td>{{
                    last3MonthsMembersTotal[0]
                      ? last3MonthsMembersTotal[0].toLocaleString()
                      : '-'
                  }}</b-td>
                  <b-td>{{
                    last3MonthsMembersTotal[1]
                      ? last3MonthsMembersTotal[1].toLocaleString()
                      : '-'
                  }}</b-td>
                  <b-td>{{
                    last3MonthsMembersTotal[2]
                      ? last3MonthsMembersTotal[2].toLocaleString()
                      : '-'
                  }}</b-td>
                  <b-td>{{
                    last3MonthsMembersTotal[2]
                      ? last3MonthsMembersTotal[2].toLocaleString()
                      : '-'
                  }}</b-td>
                </b-tr>
                <b-tr>
                  <b-td>Individuals</b-td>
                  <b-td>{{
                    last3MonthsUsersTotal[0]
                      ? last3MonthsUsersTotal[0].toLocaleString()
                      : '-'
                  }}</b-td>
                  <b-td>{{
                    last3MonthsUsersTotal[1]
                      ? last3MonthsUsersTotal[1].toLocaleString()
                      : '-'
                  }}</b-td>
                  <b-td>{{
                    last3MonthsUsersTotal[2]
                      ? last3MonthsUsersTotal[2].toLocaleString()
                      : '-'
                  }}</b-td>
                  <b-td>{{
                    last3MonthsUsersTotal[2]
                      ? last3MonthsUsersTotal[2].toLocaleString()
                      : '-'
                  }}</b-td>
                </b-tr>
                <b-tr>
                  <b-td>Kilograms reused</b-td>
                  <b-td>{{
                    last3MonthsKgsTotal[0]
                      ? last3MonthsKgsTotal[0].toLocaleString()
                      : '-'
                  }}</b-td>
                  <b-td>{{
                    last3MonthsKgsTotal[1]
                      ? last3MonthsKgsTotal[1].toLocaleString()
                      : '-'
                  }}</b-td>
                  <b-td>{{
                    last3MonthsKgsTotal[2]
                      ? last3MonthsKgsTotal[2].toLocaleString()
                      : '-'
                  }}</b-td>
                  <b-td>{{
                    (
                      (last3MonthsKgsTotal[0] ? last3MonthsKgsTotal[0] : 0) +
                      (last3MonthsKgsTotal[1] ? last3MonthsKgsTotal[1] : 0) +
                      (last3MonthsKgsTotal[2] ? last3MonthsKgsTotal[2] : 0)
                    ).toLocaleString()
                  }}</b-td>
                </b-tr>
                <b-tr>
                  <b-td>CO2 saved (tonnes)</b-td>
                  <b-td>{{ last3MonthsCO2Total[0] }}</b-td>
                  <b-td>{{ last3MonthsCO2Total[1] }}</b-td>
                  <b-td>{{ last3MonthsCO2Total[2] }}</b-td>
                  <b-td>{{
                    Math.round(
                      100 *
                        (last3MonthsCO2Total[0] +
                          last3MonthsCO2Total[1] +
                          last3MonthsCO2Total[2])
                    ) / 100
                  }}</b-td>
                </b-tr>
                <b-tr>
                  <b-td>Benefit (£)</b-td>
                  <b-td>{{
                    last3MonthsBenefitTotal[0]
                      ? last3MonthsBenefitTotal[0].toLocaleString()
                      : '-'
                  }}</b-td>
                  <b-td>{{
                    last3MonthsBenefitTotal[1]
                      ? last3MonthsBenefitTotal[1].toLocaleString()
                      : '-'
                  }}</b-td>
                  <b-td>{{
                    last3MonthsBenefitTotal[2]
                      ? last3MonthsBenefitTotal[2].toLocaleString()
                      : '-'
                  }}</b-td>
                  <b-td>{{
                    (
                      (last3MonthsBenefitTotal[0]
                        ? last3MonthsBenefitTotal[0]
                        : 0) +
                      (last3MonthsBenefitTotal[1]
                        ? last3MonthsBenefitTotal[1]
                        : 0) +
                      (last3MonthsBenefitTotal[2]
                        ? last3MonthsBenefitTotal[2]
                        : 0)
                    ).toLocaleString()
                  }}</b-td>
                </b-tr>
                <b-tr>
                  <b-td>Gifts</b-td>
                  <b-td>{{
                    last3MonthsGiftsTotal[0]
                      ? last3MonthsGiftsTotal[0].toLocaleString()
                      : '-'
                  }}</b-td>
                  <b-td>{{
                    last3MonthsGiftsTotal[1]
                      ? last3MonthsGiftsTotal[1].toLocaleString()
                      : '-'
                  }}</b-td>
                  <b-td>{{
                    last3MonthsGiftsTotal[2]
                      ? last3MonthsGiftsTotal[2].toLocaleString()
                      : '-'
                  }}</b-td>
                  <b-td>{{
                    (
                      (last3MonthsGiftsTotal[0]
                        ? last3MonthsGiftsTotal[0]
                        : 0) +
                      (last3MonthsGiftsTotal[1]
                        ? last3MonthsGiftsTotal[1]
                        : 0) +
                      (last3MonthsGiftsTotal[2] ? last3MonthsGiftsTotal[2] : 0)
                    ).toLocaleString()
                  }}</b-td>
                </b-tr>
              </b-tbody>
            </b-table-simple>
            <h3>Freegle Community Data</h3>
            <b-table-simple>
              <b-thead>
                <b-tr>
                  <b-th />
                  <b-th colspan="4" class="text-center"> Membership </b-th>
                  <b-th colspan="4" class="text-center">
                    Kilograms reused
                  </b-th>
                </b-tr>
                <b-tr>
                  <b-th>Community</b-th>
                  <b-th class="bg-light">
                    {{ last3MonthsLabels[0].toLocaleString() }}
                  </b-th>
                  <b-th class="bg-light">
                    {{ last3MonthsLabels[1].toLocaleString() }}
                  </b-th>
                  <b-th class="bg-light">
                    {{ last3MonthsLabels[2].toLocaleString() }}
                  </b-th>
                  <b-th class="bg-light"> Change </b-th>
                  <b-th class="bg-info">
                    {{ last3MonthsLabels[0].toLocaleString() }}
                  </b-th>
                  <b-th class="bg-info">
                    {{ last3MonthsLabels[1].toLocaleString() }}
                  </b-th>
                  <b-th class="bg-info">
                    {{ last3MonthsLabels[2].toLocaleString() }}
                  </b-th>
                  <b-th class="bg-info"> Total </b-th>
                </b-tr>
              </b-thead>
              <b-tbody>
                <b-tr v-for="group in last3MonthsGroups" :key="group.id">
                  <b-td
                    v-for="i in [0, 1, 2, 3, 4, 5, 6, 7, 8]"
                    :key="group.id + '-' + i"
                    :class="i < 5 ? 'bg-light' : 'bg-info'"
                  >
                    {{ group[i] }}
                  </b-td>
                </b-tr>
              </b-tbody>
            </b-table-simple>
            <p v-if="someoverlap" class="text-muted small pl-1 mb-0">
              * The area for this Freegle community partly overlaps the area
              you're looking at, so we've added an appropriate percentage.
            </p>
          </b-col>
        </b-row>
      </div>
      <div v-else>
        <b-row class="m-0">
          <b-col cols="0" md="3" class="d-none d-md-block" />
          <b-col ref="mapcont" cols="12" md="6" class="p-0">
            <div v-if="authority">
              <div class="title pl-2">
                <b-img
                  thumbnail
                  src="/icon.png"
                  class="titlelogo float-end"
                  @click="toggle"
                />
                <span class="text--largest">
                  {{ authority.name }}
                </span>
                <div class="d-inline-block align-top pt-2">
                  <OurDatePicker
                    id="startDate"
                    v-model="startDate"
                    class="ml-1"
                    lang="en"
                    type="date"
                    append-to-body
                    format="YYYY-MM"
                    placeholder=""
                  />
                  <span class="font-weight-bold ml-1 mr-1">-</span>
                  <OurDatePicker
                    id="endDate"
                    v-model="endDate"
                    class=""
                    lang="en"
                    type="date"
                    append-to-body
                    format="YYYY-MM"
                    placeholder=""
                  />
                  <span class="clickme ml-1" @click="reloadData">
                    <v-icon icon="sync" />
                  </span>
                </div>
                <br />
                <v-icon icon="globe-europe" /> www.ilovefreegle.org
                <v-icon :icon="['fab', 'twitter']" /> @thisisfreegle
                <v-icon :icon="['fab', 'facebook']" /> facebook.com/Freegle
              </div>
              <client-only>
                <l-map
                  ref="map"
                  v-model:zoom="zoom"
                  :style="
                    'width: ' + mapWidth + '; height: ' + mapHeight + 'px'
                  "
                  :min-zoom="5"
                  :max-zoom="maxZoom"
                  @ready="idle"
                >
                  <l-tile-layer :url="osmtile" :attribution="attribution" />
                  <GroupMarker
                    v-for="g in markers"
                    :key="'marker-' + g.id + '-' + zoom"
                    :group="g"
                    size="poor"
                  />
                </l-map>
              </client-only>
              <StatsImpact
                :total-weight="totalWeight"
                :total-benefit="totalBenefit"
                :total-c-o2="totalCO2"
                :total-gifts="totalGifts"
                :total-members="totalMembers"
                :group-count="groupcount"
                :range="range"
                :start="start"
                :end="end"
                border
              />
              <b-row class="m-0">
                <b-col
                  class="border border-white p-0 bg-white text-center pt-1"
                >
                  <H5>WEIGHTS (KG)</H5>
                </b-col>
                <b-col
                  class="border border-white p-0 bg-white text-center pt-1"
                >
                  <H5>MEMBERS</H5>
                </b-col>
              </b-row>
              <b-row class="m-0">
                <b-col class="border border-white p-0 bg-white overflow-hidden">
                  <GChart
                    type="ColumnChart"
                    :data="weightData"
                    :options="weightOptions"
                  />
                </b-col>
                <b-col class="border border-white p-0 bg-white overflow-hidden">
                  <GChart
                    type="LineChart"
                    :data="memberData"
                    :options="memberOptions"
                  />
                </b-col>
              </b-row>
              <b-card variant="white" class="border-white">
                <b-card-text>
                  <h2 class="text-center">
                    Freegle Communities serving {{ authority.name }}
                  </h2>
                  <b-table striped :items="items" :fields="fields">
                    <template #cell(location)="data">
                      <!-- eslint-disable-next-line -->
                      <span v-html="data.value" />
                    </template>
                    <template #cell(members)="data">
                      <!-- eslint-disable-next-line -->
                      <span v-html="data.value" />
                    </template>
                    <template #cell(monthly)="data">
                      <!-- eslint-disable-next-line -->
                      <span v-html="data.value" />
                    </template>
                  </b-table>
                  <p v-if="someoverlap" class="text-muted small pl-1 mb-0">
                    * The area for this Freegle community partly overlaps the
                    area you're looking at, so we've added an appropriate
                    percentage.
                  </p>
                </b-card-text>
              </b-card>
              <b-row class="m-0">
                <b-col class="p-0">
                  <div class="title pl-2">
                    <b-img
                      thumbnail
                      src="/icon.png"
                      class="titlelogo float-end"
                    />
                    <span class="text--largest">
                      {{ totalWeight }} TONNES REUSED
                    </span>
                    <br />
                    <span class="small">
                      {{ range }}
                    </span>
                  </div>
                </b-col>
              </b-row>
            </div>
          </b-col>
        </b-row>
      </div>
    </div>
  </div>
</template>
<script>
// There are a bunch of icons we need only on this page.  By requiring them here we avoid
// requiring them in the vue-awesome plugin.  That makes them available everywhere - but
// increases the bundle size.  Putting them here allows better bundling.
import dayjs from 'dayjs'
import { GChart } from 'vue-google-charts'
import { useRoute } from 'vue-router'
import Wkt from 'wicket'
import OurDatePicker from '../../../components/OurDatePicker'
import { loadLeaflet, attribution, osmtile } from '~/composables/useMap'
import { useAuthorityStore } from '~/stores/authority'
import { MAX_MAP_ZOOM } from '~/constants'
import StatsImpact from '~/components/StatsImpact'
import { buildHead } from '~/composables/useBuildHead'
import { useStatsStore } from '~/stores/stats'

const GroupMarker = () => import('~/components/GroupMarker')

// Benefit of reuse per tonne is £711 and CO2 impact is -0.51tCO2eq based on WRAP figures.
// https://wrap.org.uk/resources/tool/benefits-reuse-tool
const BENEFIT_PER_TONNE = 711
const CO2_PER_TONNE = 0.51

export default {
  components: {
    OurDatePicker,
    GroupMarker,
    StatsImpact,
    GChart,
  },
  setup() {
    const statsStore = useStatsStore()
    const authorityStore = useAuthorityStore()
    const runtimeConfig = useRuntimeConfig()
    const route = useRoute()

    useHead(
      buildHead(
        route,
        runtimeConfig,
        'Statistics',
        'See stats and graphs for Freegle'
      )
    )

    return {
      statsStore,
      authorityStore,
      osmtile: osmtile(),
      attribution: attribution(),
    }
  },
  data() {
    return {
      maxZoom: MAX_MAP_ZOOM,
      zoom: 5,
      tables: false,
      startDate: null,
      endDate: null,
      authority: null,
      stats: null,
      groupcount: null,
      // No animations as we want the SSR to return the whole thing.
      weightOptions: {
        interpolateNulls: false,
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
        interpolateNulls: false,
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
      fields: [
        {
          key: 'location',
          label: 'Community Location',
        },
        {
          key: 'members',
          label: 'Membership',
        },
        {
          key: 'monthly',
          label: 'Average Kgs Reused Monthly',
        },
      ],
    }
  },
  computed: {
    mapWidth() {
      const contWidth = this.$refs.mapcont?.$el.clientWidth
      return contWidth
    },
    mapHeight() {
      let height = 0

      if (process.client) {
        height = Math.floor(window.innerHeight / 2)
        height = height < 200 ? 200 : height
      }

      return height
    },
    totalWeightUnRounded() {
      let total = 0

      for (const groupid in this.stats) {
        const overlap = this.overlap(groupid)
        const stat = this.stats[groupid]
        for (const w of stat.Weights) {
          total += w.count * overlap
        }
      }

      return total
    },
    totalWeight() {
      return Math.round(this.totalWeightUnRounded / 100) / 10
    },
    // Benefit of reuse per tonne is £711 and CO2 impact is -0.51tCO2eq based on WRAP figures.
    // https://wrap.org.uk/resources/tool/benefits-reuse-tool
    totalBenefit() {
      return (this.totalWeightUnRounded * BENEFIT_PER_TONNE) / 1000
    },
    totalCO2() {
      return (this.totalWeightUnRounded * CO2_PER_TONNE) / 1000
    },
    totalGifts() {
      let count = 0

      for (const groupid in this.stats) {
        const overlap = this.overlap(groupid)
        const stat = this.stats[groupid]
        const outcomes = stat.OutcomesPerMonth

        const start = dayjs(this.startDate)
        const end = dayjs(this.endDate)

        for (const outcome of outcomes) {
          const m = dayjs(outcome.date + '-01')

          if (!m.isBefore(start) && !m.isAfter(end)) {
            count += outcome.count * overlap
          }
        }
      }

      return Math.round(count)
    },
    weightByMonth() {
      const bymonth = []

      for (const groupid in this.stats) {
        const overlap = this.overlap(groupid)
        const stat = this.stats[groupid]
        const weight = stat.Weights

        for (const a of weight) {
          const mon = a.date.substring(0, 7)

          if (!bymonth[mon]) {
            bymonth[mon] = 0
          }

          bymonth[mon] += a.count * overlap
        }
      }

      return bymonth
    },
    weightData() {
      const ret = [['Date', 'Count']]
      for (const mon in this.weightByMonth) {
        ret.push([new Date(mon + '-01'), this.weightByMonth[mon]])
      }

      return ret
    },
    memberData() {
      const ret = [['Date', 'Count']]
      const dates = []

      for (const groupid in this.stats) {
        const overlap = this.overlap(groupid)
        const stat = this.stats[groupid]
        const members = stat.ApprovedMemberCount

        if (members) {
          for (const a of members) {
            if (!dates[a.date]) {
              dates[a.date] = 0
            }

            dates[a.date] += Math.round(parseInt(a.count) * overlap)
          }
        }
      }

      for (const date in dates) {
        ret.push([new Date(date), Math.round(dates[date])])
      }

      return ret
    },
    totalMembers() {
      let ret = 0
      const data = this.memberData
      if (data) {
        const last = data.pop()
        ret = last[1]
      }
      return ret
    },
    range() {
      const start = dayjs(this.startDate).format('MMM YY').toUpperCase()
      const end = dayjs(this.endDate).format('MMM YY').toUpperCase()
      return start + ' - ' + end
    },
    monthsCovered() {
      const ret = dayjs(this.endDate).diff(dayjs(this.startDate), 'months')
      return ret + 1
    },
    start() {
      const start = dayjs(this.startDate).format('MMM YY').toUpperCase()
      return start
    },
    end() {
      const end = dayjs(this.endDate).format('MMM YY').toUpperCase()
      return end
    },
    someoverlap() {
      let someoverlaps = false

      if (this.stats) {
        const groups = Object.values(this.stats)

        if (groups) {
          for (const ix in groups) {
            const group = groups[ix]
            if (group.overlap < 1) {
              someoverlaps = true
            }
          }
        }
      }

      return someoverlaps
    },
    items() {
      const ret = []

      if (this.stats) {
        const groups = Object.values(this.stats)
        groups.sort(function (a, b) {
          return b.avpermonth - a.avpermonth
        })

        for (const ix in groups) {
          const group = groups[ix]

          if (group.ApprovedMemberCount.length > 0) {
            ret.push({
              location:
                '<a class="black" href="/explore/' +
                group.group.nameshort +
                '">' +
                group.group.namedisplay +
                (group.overlap < 1 ? ' *' : '') +
                '</a>',
              members:
                Math.round(
                  group.ApprovedMemberCount[
                    group.ApprovedMemberCount.length - 1
                  ].count * group.overlap
                ).toLocaleString() +
                (group.overlap < 1
                  ? ' (<span class="text-muted small">of ' +
                    Math.round(
                      group.ApprovedMemberCount[
                        group.ApprovedMemberCount.length - 1
                      ].count
                    ).toLocaleString() +
                    ')</span>'
                  : ''),
              monthly:
                Math.round(group.avpermonth * group.overlap) +
                (group.overlap < 1
                  ? ' (<span class="text-muted small">of ' +
                    Math.round(group.avpermonth) +
                    ')</span>'
                  : ''),
            })
          }
        }
      }

      return ret
    },
    markers() {
      const ret = []

      for (const groupid in this.stats) {
        ret.push(this.stats[groupid].group)
      }

      return ret
    },
    last3Months() {
      const now = dayjs()
      const end = dayjs(this.endDate)

      if (end.isSame(now, 'month')) {
        // We're in the current month.  Want to start from last month, as that is complete.
        return [
          now.subtract(3, 'month').startOf('month'),
          now.subtract(2, 'month').startOf('month'),
          now.subtract(1, 'month').startOf('month'),
        ]
      } else {
        // Start from the supplied month.
        return [
          end.subtract(2, 'month').startOf('month'),
          end.subtract(1, 'month').startOf('month'),
          end.startOf('month'),
        ]
      }
    },
    last3MonthsLabels() {
      return [
        this.last3Months[0].format('MMM-YY'),
        this.last3Months[1].format('MMM-YY'),
        this.last3Months[2].format('MMM-YY'),
      ]
    },
    last3MonthsMembersTotal() {
      const ret = []

      this.memberData.forEach((data) => {
        if (typeof data[0] !== 'string') {
          for (let mon = 2; mon >= 0; mon--) {
            // Need to use isSame(,'day') to handle DST.
            if (this.last3Months[mon].isSame(dayjs(data[0]), 'day')) {
              ret[mon] = data[1]
            }
          }
        }
      })

      return ret
    },
    last3MonthsUsersTotal() {
      if (!this.last3MonthsMembersTotal) {
        return [0, 0, 0]
      }

      // We use a systemwide average of 70.5%.
      const factor = 0.705

      return [
        Math.round(this.last3MonthsMembersTotal[0] * factor),
        Math.round(this.last3MonthsMembersTotal[1] * factor),
        Math.round(this.last3MonthsMembersTotal[2] * factor),
      ]
    },
    last3MonthsKgsTotal() {
      const ret = []

      for (const datamon in this.weightByMonth) {
        for (let mon = 2; mon >= 0; mon--) {
          if (this.last3Months[mon].format('YYYY-MM') === datamon) {
            ret[mon] = Math.round(this.weightByMonth[datamon])
          }
        }
      }

      return ret
    },
    last3MonthsBenefitTotal() {
      return [
        Math.round((this.last3MonthsKgsTotal[0] * BENEFIT_PER_TONNE) / 1000),
        Math.round((this.last3MonthsKgsTotal[1] * BENEFIT_PER_TONNE) / 1000),
        Math.round((this.last3MonthsKgsTotal[2] * BENEFIT_PER_TONNE) / 1000),
      ]
    },
    last3MonthsCO2Total() {
      return [
        Math.round((this.last3MonthsKgsTotal[0] * CO2_PER_TONNE) / 10) / 100,
        Math.round((this.last3MonthsKgsTotal[1] * CO2_PER_TONNE) / 10) / 100,
        Math.round((this.last3MonthsKgsTotal[2] * CO2_PER_TONNE) / 10) / 100,
      ]
    },
    last3MonthsGiftsTotal() {
      const ret = []

      for (let mon = 2; mon >= 0; mon--) {
        let count = 0

        for (const groupid in this.stats) {
          const overlap = this.overlap(groupid)
          const stat = this.stats[groupid]
          const outcomes = stat.OutcomesPerMonth
          let thisone = 0

          const start = this.last3Months[mon].startOf('month')
          const end = this.last3Months[mon].endOf('month')

          for (const outcome of outcomes) {
            const m = dayjs(outcome.date + '-01')

            if (!m.isBefore(start) && !m.isAfter(end)) {
              thisone += outcome.count * overlap
              count += thisone
            }
          }
        }

        ret[mon] = Math.round(count)
      }

      return ret
    },
    last3MonthsGroups() {
      const groups = Object.values(this.stats)
      groups.sort(function (a, b) {
        return a.group.namedisplay
          .toLowerCase()
          .localeCompare(b.group.namedisplay.toLowerCase())
      })

      const ret = []

      for (const ix in groups) {
        const group = groups[ix]
        const thisone = [
          group.group.namedisplay + (group.overlap < 1 ? ' *' : ''),
        ]

        if (group.ApprovedMemberCount.length > 0) {
          for (let mon = 2; mon >= 0; mon--) {
            const end = this.last3Months[mon].endOf('month')
            for (let i = 0; i < group.ApprovedMemberCount.length; i++) {
              const thisdate = dayjs(group.ApprovedMemberCount[i].date).endOf(
                'day'
              )

              // Sometimes there are gaps in data.  We know the stats are in ascending date order.  So just keep
              // overwriting so that we get the latest.
              if (end.format('YYYY-MMM') === thisdate.format('YYYY-MMM')) {
                thisone[mon + 1] = group.ApprovedMemberCount[i].count
              }
            }
          }

          thisone[4] = thisone[3] - thisone[1]

          for (let i = 1; i < 5; i++) {
            if (thisone[i]) {
              thisone[i] = thisone[i].toLocaleString()
            }
          }
        }

        if (group.Weights.length > 0) {
          for (let mon = 2; mon >= 0; mon--) {
            const end = this.last3Months[mon].endOf('month')
            thisone[mon + 5] = 0

            for (let i = 0; i < group.Weights.length; i++) {
              const thisdate = dayjs(group.ApprovedMemberCount[i].date).endOf(
                'day'
              )

              if (end.format('YYYY-MMM') === thisdate.format('YYYY-MMM')) {
                thisone[mon + 5] += group.Weights[i].count
              }
            }
          }

          thisone[8] = thisone[5] + thisone[6] + thisone[7]

          for (let i = 5; i < 9; i++) {
            if (thisone[i]) {
              thisone[i] = thisone[i].toLocaleString()
            }
          }
        }

        ret.push(thisone)
      }

      return ret
    },
  },
  created() {
    this.id = this.$route.params.id

    // Default end is last complete month, and start is a year before that, so we cover twelve months.
    this.endDate = dayjs().subtract(1, 'month').endOf('month').format()
    this.startDate = dayjs(this.endDate)
      .subtract(1, 'year')
      .add(1, 'month')
      .startOf('month')
      .format()
  },
  async mounted() {
    await loadLeaflet()
    this.fetchData(this.id)
  },
  methods: {
    mapPoly(poly, options) {
      let bounds = null

      try {
        const wkt = new Wkt.Wkt()
        wkt.read(poly)

        const mapobj = this.$refs.map.leafletObject
        const obj = wkt.toObject(mapobj.defaults)

        if (obj) {
          // This might be a multipolygon.
          if (Array.isArray(obj)) {
            for (const ent of obj) {
              ent.addTo(mapobj)
              ent.setStyle(options)
              const thisbounds = ent.getBounds()
              bounds = bounds || thisbounds
              bounds.extend(thisbounds.getNorthEast())
              bounds.extend(thisbounds.getSouthWest())
            }
          } else {
            obj.addTo(mapobj)
            obj.setStyle(options)
            bounds = obj.getBounds()
          }
        }
      } catch (e) {
        console.log('Map poly failed', poly, e)
      }

      return bounds
    },
    async fetchData(id) {
      await this.authorityStore.fetch(id)

      let groupcount = 0
      const stats = []

      const authority = this.authorityStore.byId(id)

      // We only query in full months, and the server expects the end date to be exclusive.
      const start = dayjs(this.startDate).startOf('month').format('YYYY-MM-DD')

      const end = dayjs(this.endDate)
        .endOf('month')
        .add(1, 'day')
        .format('YYYY-MM-DD')

      for (const group of authority.groups) {
        await this.statsStore.clear()
        await this.statsStore.fetch({
          group: group.id,
          grouptype: 'Freegle',
          start,
          end,
          force: true,
        })

        const overlap = group.overlap
        const weights = this.statsStore.Weight

        let totalWeight = 0
        for (const w of weights) {
          totalWeight += w.count * overlap
        }

        const avpermonth = totalWeight / this.monthsCovered

        // If there is only one group in the area we're looking at, or the group is entirely contained within the
        // area, then show it irrespective of activity otherwise it looks silly.
        for (let i = 0; i < 2; i++) {
          if (
            i === 1 ||
            avpermonth > 1 ||
            authority.groups.length === 1 ||
            overlap === 1
          ) {
            groupcount++

            stats[group.id] = {
              overlap,
              avpermonth,
              totalweight: totalWeight,
              Weights: weights,
              ApprovedMemberCount: this.statsStore.ApprovedMemberCount,
              OutcomesPerMonth: this.statsStore.OutcomesPerMonth,
              group,
            }
          }

          if (groupcount > 0) {
            // If we found some data abive our threshold, stop.  Otherwise try again so that we show no activity
            // but at least which groups overlap.
            break
          }
        }
      }

      this.authority = authority
      this.stats = stats
      this.groupcount = groupcount
    },
    overlap(groupid) {
      for (const group of this.authority.groups) {
        if (parseInt(group.id) === parseInt(groupid)) {
          return group.overlap
        }
      }

      return 0
    },
    idle() {
      if (this.stats && this.authority && !this.addedPolygons) {
        this.addedPolygons = true

        if (this.authority) {
          const bounds = this.mapPoly(this.authority.polygon, {
            fillColor: 'blue',
            weight: 0,
            fillOpacity: 0.2,
          })

          this.$refs.map.leafletObject.fitBounds(bounds)

          for (const groupid in this.stats) {
            const polygon = this.stats[groupid].group.poly

            this.mapPoly(polygon, {
              fillColor: 'grey',
              weight: 0,
              fillOpacity: 0.2,
            })
          }
        }
      }
    },
    reloadData() {
      if (
        this.startDate &&
        this.endDate &&
        dayjs(this.endDate).isAfter(dayjs(this.startDate))
      ) {
        this.stats = null
        this.fetchData(this.id)
      }
    },
    toggle() {
      this.tables = !this.tables
    },
  },
}
</script>
<style scoped lang="scss">
.title {
  background-color: $color-green--darker;
  color: $color-white !important;
}

.titlelogo {
  width: 72px;
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

:deep(.black) {
  color: $color-black !important;
}

:deep(.mx-datepicker) {
  width: 100px;
}

:deep(a) {
  text-decoration: none;
}
</style>
