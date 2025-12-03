<template>
  <client-only>
    <b-row class="m-0">
      <b-col cols="0" lg="3" class="d-none d-lg-block" />
      <b-col cols="12" lg="6" class="p-0">
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
<script setup>
import { computed } from 'vue'
import { GChart } from 'vue-google-charts'
import { useRoute } from 'vue-router'
import { useShortlinkStore } from '~/stores/shortlinks'

const shortlinkStore = useShortlinkStore()
const route = useRoute()
const id = parseInt(route.params.id)

if (id) {
  await shortlinkStore.fetch(id)
}

const chartOptions = {
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
}

const shortlink = computed(() => shortlinkStore?.byId(id))

const chartData = computed(() => {
  const ret = [['Date', 'Count']]

  if (shortlink.value?.clickhistory) {
    for (const date of shortlink.value.clickhistory) {
      ret.push([new Date(date.date), date.count])
    }
  }

  return ret
})
</script>
