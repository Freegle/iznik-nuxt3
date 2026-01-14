<template>
  <div>
    <h2>
      Impact <span class="text-muted">on {{ groupName }}</span>
    </h2>
    <p>This is our estimate of the impact your active communities have had.</p>
    <b-card v-if="loading" no-body>
      <b-card-body>
        <b-row><b-col>&nbsp;</b-col></b-row>
        <b-row><b-col>&nbsp;</b-col></b-row>
        <b-row>
          <b-col class="text-faded pulsate text-center"> Loading... </b-col>
        </b-row>
        <b-row><b-col>&nbsp;</b-col></b-row>
        <b-row><b-col>&nbsp;</b-col></b-row>
        <b-row><b-col>&nbsp;</b-col></b-row>
      </b-card-body>
    </b-card>
    <ModImpact
      v-else
      :range="startf + ' - ' + endf"
      :total-benefit="totalBenefit"
      :total-c-o2="totalCO2"
      :total-weight="totalWeight"
      class="mt-2"
    />
  </div>
</template>
<script>
import dayjs from 'dayjs'
import ModDashboardBase from '~/components/ModDashboardBase'
import {
  getBenefitPerTonne,
  CO2_PER_TONNE,
} from '~/composables/useReuseBenefit'

export default {
  extends: ModDashboardBase,
  data: function () {
    return {
      askfor: ['Weight'],
      Weight: null,
    }
  },
  computed: {
    startf() {
      return dayjs(this.start).format('YYYY-MM-DD')
    },
    endf() {
      return dayjs(this.end).format('YYYY-MM-DD')
    },
    totalWeight() {
      const weights = this.Weight
      let total = 0
      const start = dayjs(this.start)
      const end = dayjs(this.end)

      if (weights) {
        for (const w of weights) {
          if (
            start.isSameOrBefore(dayjs(w.date), 'days') &&
            end.isSameOrAfter(dayjs(w.date), 'days')
          ) {
            total += w.count
          }
        }
      }

      return total / 1000
    },
    // Benefit of reuse per tonne and CO2 impact based on WRAP figures.
    // https://wrap.org.uk/resources/tool/benefits-reuse-tool
    // The benefit value is inflation-adjusted to current year prices.
    totalBenefit() {
      return this.totalWeight * getBenefitPerTonne()
    },
    totalCO2() {
      return this.totalWeight * CO2_PER_TONNE
    },
  },
}
</script>
