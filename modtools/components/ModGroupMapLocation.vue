<template>
  <l-geo-json
    ref="geojson"
    :geojson="location.json"
    :options="locationOptions"
    @click="select"
  />
  <l-circle-marker
    v-if="labels && centre"
    :lat-lng="[centre.lat, centre.lng]"
    :radius="1"
  >
    <l-tooltip
      ref="tooltip"
      :content="location.name + ''"
      :options="{ permanent: true, direction: 'center' }"
    />
  </l-circle-marker>
</template>
<script setup>
import { computed } from 'vue'
import { LCircleMarker, LGeoJson, LTooltip } from '@vue-leaflet/vue-leaflet'

let Wkt = null

if (process.client) {
  Wkt = await import('wicket')
  await import('wicket/wicket-leaflet')
}

const AREA_FILL_COLOUR = 'lightgreen'
const FILL_OPACITY = 0.5
const AREA_BOUNDARY_COLOUR = 'darkblue'
const SELECTED = '#990000'

const props = defineProps({
  location: {
    type: Object,
    required: true,
  },
  shade: {
    type: Boolean,
    required: false,
  },
  labels: {
    type: Boolean,
    required: false,
  },
  selected: {
    type: Boolean,
    required: false,
  },
  selectable: {
    type: Boolean,
    required: false,
  },
})

const emit = defineEmits(['click', 'edit'])

const locationOptions = computed(() => ({
  // Needs to be set using setStyle ie not reactive
  fillColor: AREA_FILL_COLOUR,
  fillOpacity: props.shade ? FILL_OPACITY : 0,
  color: AREA_BOUNDARY_COLOUR, // Just keep always as blue: props.selected ? SELECTED : AREA_BOUNDARY_COLOUR,
}))

const centre = computed(() => {
  let lat = 0
  let lng = 0
  let ret = null

  if (props.location.json?.coordinates?.length === 1) {
    props.location.json.coordinates[0].forEach((c) => {
      lat += parseFloat(c[1])
      lng += parseFloat(c[0])
    })

    lat /= props.location.json.coordinates[0].length
    lng /= props.location.json.coordinates[0].length

    ret = {
      lat,
      lng,
    }
  }

  return ret
})

const select = (e) => {
  if (props.selectable) {
    emit('click')
  }
}

const geojson = ref(null)

watch(
  () => props.shade,
  (shade) => {
    if (geojson.value)
      geojson.value.leafletObject.setStyle(locationOptions.value)
  },
  {
    immediate: true,
  }
)
watch(
  () => props.selected,
  (selected) => {
    if (!geojson.value) return
    if (selected) {
      // Enable this object for editing and watch for changes.
      geojson.value.leafletObject.pm.enable({
        allowSelfIntersection: false,
        snappable: false, // Has big effect on performance when there are many layers on the map.
      })
      geojson.value.leafletObject.on('pm:edit', (f) => {
        console.log('MGML pm:drawend')
        const wkt = new Wkt.Wkt()
        wkt.fromObject(f.layer)
        const json = wkt.write()
        emit('edit', json)
      })
    } else {
      geojson.value.leafletObject.pm.disable()
    }
    geojson.value.leafletObject.setStyle(locationOptions.value)
  },
  {
    immediate: true,
  }
)
</script>
