<template>
  <div class="mb-2">
    <label> Post visibility </label>
    <p>
      On the Browse page, freeglers will see posts that are reasonably close to
      their own location, based on how long it would take them to get there.
      They can adjust this setting, and also whether they are travelling on
      foot, by bike, or by car. They can also add extra locations - for example
      if they have relatives in different places. Once they post on a group, or
      reply to a post, then they will become a group member.
    </p>
    <p>
      This gives a good set of posts for most freeglers. It particularly helps
      those who are close to group boundaries. Posts in neighbouring groups may
      be a lot closer to them than some of the posts on the far side of the
      group they're in.
    </p>
    <p>
      You can restrict how far outside your group the posts will be easily
      visible. You should only do this if you want to override the members'
      choice.
      <b
        >This will result in less freegling near the boundaries of your
        group.</b
      >
    </p>
    <p v-if="!showing">Click the toggle to show the map.</p>
    <OurToggle
      :value="showing"
      class="mt-2"
      :height="30"
      :width="150"
      :font-size="14"
      :sync="true"
      :labels="{ checked: 'Show map', unchecked: 'Hide map' }"
      variant="modgreen"
      @change="toggleView"
    />
    <div v-if="showing">
      <p>
        This map shows your Core Group Area (CGA) in dark blue. You can control
        how far outside this area posts are easily visible using the slider. The
        visible area is shown in light blue.
      </p>
      <div class="d-flex">
        <label class="mr-2"> Just the group </label>
        <b-form-input
          v-model="scale"
          class="w-100"
          type="range"
          min="0"
          max="30000"
          step="100"
        />
        <label class="ml-2"> Further away </label>
        <SpinButton
          icon-name="save"
          label="Save"
          variant="primary"
          @handle="save"
        />
      </div>
      <div :style="'width: 100%; height: 600px'">
        <l-map
          ref="mapObject"
          :zoom="7"
          :max-zoom="17"
          :center="[group.lat, group.lng]"
          @ready="ready"
        >
          <l-tile-layer :url="osmtile()" :attribution="attribution()" />
          <l-geo-json
            v-if="CGA"
            ref="cgaobj"
            :geojson="CGA"
            :options="cgaOptions"
          />
          <l-geo-json
            v-if="visibility"
            :geojson="visibility"
            :options="visibilityOptions"
          />
        </l-map>
      </div>
    </div>
  </div>
</template>
<script setup>
// We can't easily go back from a postvisibility polygon to the scale value.
// So: display correct postvisibility polygon but scale is always reset to just group
import { useModGroupStore } from '@/stores/modgroup'
import turfbuffer from 'turf-buffer'
import Wkt from 'wicket'
import 'leaflet'
import 'leaflet/dist/leaflet.css'
import { LMap, LTileLayer, LGeoJson } from '@vue-leaflet/vue-leaflet'
import { attribution, osmtile } from '~/composables/useMap'

const modGroupStore = useModGroupStore()

const props = defineProps({
  groupid: {
    type: Number,
    required: true,
  },
})

const mapObject = ref(null)
const cgaobj = ref(null)
const showing = ref(false)
const value = ref(null)
const scale = ref(0)
const changed = ref(false)

watch(
  () => props.groupid,
  (newVal) => {
    getValueFromGroup()
    changed.value = false
  }
)

watch(scale, async (newVal) => {
  changed.value = true
})

const group = computed(() => {
  return modGroupStore.get(props.groupid)
})

const CGA = computed(() => {
  const wkt = new Wkt.Wkt()
  try {
    wkt.read(group.value.dpa || group.value.cga)
    return wkt.toJson()
  } catch (e) {
    console.log('WKT error', e)
  }

  return null
})

const visibility = computed(() => {
  if (!changed.value && group.value.postvisibility) {
    // We can't easily go back from a postvisibility polygon to the scale value.  So we return the polygon if set.
    const wkt = new Wkt.Wkt()
    wkt.read(group.value.postvisibility)
    return wkt.toJson()
  } else {
    // Scale the CGA.
    const theCGA = CGA.value

    if (theCGA) {
      return turfbuffer(theCGA, scale.value, 'meters')
    } else {
      return null
    }
  }
})

const cgaOptions = computed(() => {
  return {
    fillColor: 'darkblue',
    fillOpacity: 0.5,
    color: 'black',
  }
})
const visibilityOptions = computed(() => {
  return {
    fillColor: 'lightblue',
    fillOpacity: 0.5,
    color: 'darkgrey',
  }
})

onMounted(async () => {
  getValueFromGroup()
})

async function getValueFromGroup() {
  const obj = await modGroupStore.get(props.groupid)

  if (obj) {
    value.value = obj.postvisibility
  }
}

function toggleView(c, e) {
  showing.value = c

  if (!c) {
    value.value = null
  } else {
    zoomToCGA()
  }
}

async function ready() {
  if (process.client) {
    zoomToCGA()
  }
}

function zoomToCGA() {
  try {
    if (mapObject.value?.leafletObject && cgaobj.value?.leafletObject) {
      const bounds = cgaobj.value.leafletObject.getBounds()
      mapObject.value.leafletObject.fitBounds(bounds.pad(0.1))
    }
  } catch (e) {
    console.log('zoomToCGA error', e)
  }
}
async function save(callback) {
  const wkt = new Wkt.Wkt()
  wkt.read(JSON.stringify(visibility.value))

  await modGroupStore.updateMT({
    id: props.groupid,
    postvisibility: wkt.toString(),
  })
  callback()
}
</script>
