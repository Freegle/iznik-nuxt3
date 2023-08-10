<template>
  <client-only>
    <b-row class="m-0">
      <b-col cols="0" md="3" class="d-none d-md-block" />
      <b-col cols="12" md="6" class="p-0">
        <div v-if="shortlink">
          <h3>{{ shortlink.name }}</h3>
          <p>
            <a
              :href="'https://freegle.in/' + shortlink.name"
              target="_blank"
              rel="noopener noreferrer"
              >{{ 'https://freegle.in/' + shortlink.name }}</a
            >
            <span v-if="shortlink.nameshort">
              is a shortlink for the community
              <nuxt-link :to="'/explore/' + shortlink.nameshort">
                {{ shortlink.nameshort }} </nuxt-link
              >.
            </span>
          </p>
          <p>
            Here's a graph of clicks on this shortlink over time. If you don't
            see anything, there haven't been any yet!
          </p>
          <GChart type="LineChart" :data="chartData" :options="chartOptions" />
        </div>
      </b-col>
    </b-row>
  </client-only>
</template>
<script>
import { GChart } from 'vue-google-charts'
import { useRoute } from 'vue-router'
import { useShortlinkStore } from '../../stores/shortlinks'

export default {
  components: {
    GChart,
  },
  async setup() {
    const shortlinkStore = useShortlinkStore()

    const route = useRoute()
    const id = parseInt(route.params.id)

    if (id) {
      await shortlinkStore.fetch(id)
    }

    return {
      shortlinkStore,
      id,
    }
  },
  data: function () {
    return {
      chartOptions: {
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
    }
  },
  computed: {
    shortlink() {
      return this.shortlinkStore?.byId(this.id)
    },
    chartData() {
      const ret = [['Date', 'Count']]

      if (this.shortlink?.clickhistory) {
        for (const date of this.shortlink.clickhistory) {
          ret.push([new Date(date.date), date.count])
        }
      }

      return ret
    },
  },
}
</script>
