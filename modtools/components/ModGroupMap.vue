<template>
  <client-only>
    <div class="maptools d-flex mb-1 justify-content-between">
      <div class="d-flex">
        <v-icon
          icon="sync"
          :class="
            busy ? 'text-success fa-spin ml-4 mt-1' : 'text-faded ml-4 mt-1'
          "
          scale="2"
        />
      </div>
      <b-form-checkbox v-if="groups || groupid" v-model="cga" class="ml-2">
        <strong style="color: darkgreen">Show CGAs</strong>
      </b-form-checkbox>
      <b-form-checkbox v-if="groups || groupid" v-model="dpa" class="ml-2">
        <strong style="color: darkblue">Show DPAs</strong>
      </b-form-checkbox>
      <b-form-checkbox
        v-if="groupid"
        v-model="labels"
        class="ml-2 font-weight-bold"
      >
        Labels
      </b-form-checkbox>
      <b-form-checkbox
        v-model="shade"
        class="ml-2 font-weight-bold"
        @click="dobump"
      >
        Shade areas
      </b-form-checkbox>
      <b-form-checkbox v-model="showDodgy" class="ml-2 font-weight-bold">
        Areas to Review
      </b-form-checkbox>
    </div>
    <b-modal
      id="mappingChanges"
      ref="mappingChanges"
      v-model="showMappingChanges"
    >
      <p>
        If you have the "Areas to Review" checkbox ticked, you'll see the red
        circles for postcodes which might need better mapping.
      </p>
      <p class="font-weight-bold text-danger">
        The red circles indicate where mapping has changed recently. You can
        review these to check if it looks OK.
      </p>
      <ul>
        <li>
          The occasional dot is OK. Clusters of dots in a single area are worth
          reviewing.
        </li>
        <li>
          The dots might highlight areas where the existing mapping is poor.
          Typical problem are places where areas overlap, or where there are
          gaps between areas.
        </li>
        <li>
          Click on a postcode in this section to centre the map on it, then zoom
          in if you need to.
        </li>
      </ul>
      <p>You can fix these:</p>
      <ul>
        <li>You can adjust area boundaries.</li>
        <li>You can add new areas.</li>
        <li>You can delete areas.</li>
      </ul>
      <p class="font-weight-bold text-danger">
        The red circles don't get updated at the moment. Soon.
      </p>
      <p>
        To help more widely, you can zoom the map out to view the whole UK. Once
        you zoom out far enough you'll see the numbers of postcodes which need
        attention - you can click on those to zoom in.
      </p>
    </b-modal>
    <b-row class="m-0">
      <b-col ref="mapcont" cols="12" md="9" class="p-0">
        <div>
          <l-map
            ref="mapObject"
            :zoom="zoom"
            :min-zoom="5"
            :max-zoom="17"
            :options="{ dragging: dragging, touchZoom: true }"
            :style="'width: 100%; height: ' + mapHeight + 'px'"
            :use-global-leaflet="true"
            @update:bounds="boundsChanged"
            @update:zoom="boundsChanged"
            @ready="ready"
            @moveend="idle"
          >
            <l-tile-layer :url="osmtile()" :attribution="attribution()" />
            <div v-if="cga" id="cgahere">
              <l-geo-json
                v-for="(c, i) in CGAs"
                :key="'cga-' + i"
                :geojson="c.json"
                :options="cgaOptions"
                :z-index-offset="2"
                @click="selectCGA($event, c.group)"
              />
            </div>
            <div v-if="dpa" id="dpahere">
              <l-geo-json
                v-for="(d, i) in DPAs"
                :key="'dpa-' + i"
                :geojson="d.json"
                :options="dpaOptions"
                :z-index-offset="1"
                @click="selectDPA($event, d.group)"
              />
            </div>
            <div v-if="overlaps && showDodgy && !groupid" id="overlaphere">
              <l-geo-json
                v-for="(d, i) in overlappingCGAs"
                :key="'cgaoverlap-' + i"
                :geojson="d"
                :options="cgaOverlapOptions"
                :z-index-offset="0"
              />
            </div>
            <div v-if="groupid && zoom >= 12" id="maplocationshere">
              <ModGroupMapLocation
                v-for="l in locationsInBounds"
                :key="'location-' + l.id"
                :ref="'location-' + l.id"
                :location="l"
                :selected="selectedObj === l"
                :selectable="!selectedObj"
                :shade="shade"
                :labels="labels"
                @click="selectLocation(l)"
                @edit="selectedWKT = $event"
              />
            </div>
            <div v-if="showDodgy && groupid" id="dodgyhere">
              <ClusterMarker
                v-if="mapObject && zoom < 10"
                :markers="dodgyInBounds"
                :map="mapObject"
              />
              <l-feature-group v-else>
                <l-circle-marker
                  v-if="highlighted"
                  :key="'highlighted-' + highlighted.id"
                  :lat-lng="[highlighted.lat, highlighted.lng]"
                  :interactive="false"
                  :radius="5"
                  color="blue"
                />
                <l-circle-marker
                  v-for="d in dodgyInBounds"
                  :key="d.id"
                  :lat-lng="d"
                  :radius="5"
                  color="red"
                  @click="selected = d"
                />
              </l-feature-group>
            </div>

            <div v-if="groups && zoom > 7" id="groupcentershere">
              <l-circle-marker
                v-for="g in allgroups"
                :key="'groupcentre-' + g.id"
                :lat-lng="[g.lat, g.lng]"
                :radius="10"
                color="darkgreen"
                :fill="true"
                fill-color="darkgreen"
                :fill-opacity="1"
              />
            </div>
          </l-map>
        </div>
      </b-col>
      <b-col cols="12" md="3">
        <b-card v-if="selectedWKT" class="mb-2" no-body>
          <b-card-header class="bg-info"> Area Details </b-card-header>
          <b-card-body>
            <p class="text-danger font-weight-bold">
              Zoom/pan locked while area selected. Use Cancel to free.
            </p>
            <div v-if="groupid">
              <b-form-input
                v-model="selectedName"
                placeholder="Enter area name"
                size="lg"
                class="mb-1"
              />
              <b-form-textarea v-model="selectedWKT" rows="4" />
            </div>
            <div v-else>
              <h5>{{ selectedName }}</h5>
              <b-form-textarea v-model="selectedWKT" rows="4" readonly />
            </div>
            <p v-if="intersects" class="text-danger">
              Crosses over itself - not valid
            </p>
          </b-card-body>
          <b-card-footer
            v-if="groupid"
            class="d-flex justify-content-between flex-wrap"
          >
            <SpinButton
              variant="primary"
              icon-name="save"
              label="Save"
              spinclass="text-white"
              :disabled="!selectedName || !selectedWKT || intersects"
              @handle="saveArea"
            />
            <SpinButton
              variant="white"
              icon-name="times"
              label="Cancel"
              @handle="clearSelection"
            />
            <SpinButton
              v-if="selectedId"
              variant="danger"
              icon-name="trash-alt"
              label="Delete"
              @handle="deleteArea"
            />
          </b-card-footer>
        </b-card>
        <NoticeMessage v-if="zoom < 12" variant="danger" show class="mb-2">
          Please zoom in further to see locations.
        </NoticeMessage>
        <ModPostcodeTester />
        <ModConvertKML />
        <b-card
          v-if="dodgyInBounds.length"
          no-body
          style="max-height: 600px; overflow-y: scroll"
        >
          <b-card-header class="bg-warning d-flex justify-content-between">
            Mapping Changes
            <b-button variant="white" @click="showMappingChanges = true">
              Details
            </b-button>
          </b-card-header>
          <b-card-body>
            <div v-if="dodgyInBounds.length < 200">
              <ModChangedMapping
                v-for="d in dodgyInBounds"
                :key="d.id"
                :changed="d"
                :highlighted="highlighted"
                @click="highlightPostcode(d)"
              />
            </div>
            <p v-else>Too many changes to show; zoom in.</p>
          </b-card-body>
        </b-card>
      </b-col>
    </b-row>
  </client-only>
</template>
<script setup>
import { nextTick } from 'vue'

import 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  LMap,
  LTileLayer,
  LGeoJson,
  LCircleMarker,
  LFeatureGroup,
} from '@vue-leaflet/vue-leaflet'
import '@geoman-io/leaflet-geoman-free'
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css'

import 'leaflet-control-geocoder/dist/Control.Geocoder.css'

import turfpolygon from 'turf-polygon'
import turfintersect from 'turf-intersect'
import turfarea from 'turf-area'
import ClusterMarker from '../components/ClusterMarker'
import { attribution, osmtile } from '../composables/useMap'
import { useGroupStore } from '~/stores/group'
import { useLocationStore } from '~/stores/location'

let Wkt = null

if (process.client) {
  Wkt = await import('wicket')
  await import('wicket/wicket-leaflet')
}

const AREA_FILL_COLOUR = 'darkgreen'
const OVERLAP_COLOUR = 'red'
const FILL_OPACITY = 0.6
const CGA_BOUNDARY_COLOUR = 'darkgreen'
const DPA_BOUNDARY_COLOUR = 'darkblue'

const props = defineProps({
  groups: {
    type: Boolean,
    required: false,
    default: false,
  },
  groupid: {
    type: Number,
    required: false,
    default: null,
  },
  caretaker: {
    type: Boolean,
    required: false,
    default: false,
  },
  overlaps: {
    type: Boolean,
    required: false,
    default: false,
  },
})

const groupStore = useGroupStore()
const locationStore = useLocationStore()
const mapObject = ref(null)
// const serviceUrl = useRuntimeConfig().public.GEOCODE

const busy = ref(true)
const initialGroupZoomed = ref(false)
const dpa = ref(false)
const cga = ref(true)
const shade = ref(true)
const labels = ref(true)
const showDodgy = ref(false)
const selectedName = ref(null)
const selectedWKT = ref(null)
const dragging = ref(true)
const selectedObj = ref(null)
const selectedId = ref(null)
const intersects = ref(false)
const zoom = ref(12)
const lastLocationFetch = ref(null)
const showMappingChanges = ref(false)
const highlighted = ref(null)
const bounds = ref(null)
const locations = ref([])
const dodgy = ref([])
const bump = ref(0)

const mapHeight = computed(() => {
  let height = 0

  if (process.client) {
    height = window.innerHeight - 150
  }

  return height
})

const allgroups = computed(() => {
  let groups = Object.values(groupStore.list)

  if (props.caretaker) {
    groups = groups.filter((g) => g.mentored)
  }

  return groups
})

const group = computed(() => {
  return props.groupid ? groupStore.get(props.groupid) : null
})

const CGAs = computed(() => {
  const ret = []

  allgroups.value.forEach((g) => {
    if (g.onmap && g.polyofficial) {
      try {
        const wkt = new Wkt.Wkt()
        // console.log('Wkt.Wkt A', g.polyofficial?g.polyofficial.length:-1)
        wkt.read(g.polyofficial)
        ret.push({
          json: wkt.toJson(),
          group: g,
        })
      } catch (e) {
        console.error('Failed to read WKT', g)
      }
    }
  })

  return ret
})
const DPAs = computed(() => {
  const ret = []

  allgroups.value.forEach((g) => {
    if (g.onmap && g.poly) {
      try {
        const wkt = new Wkt.Wkt()
        // console.log('Wkt.Wkt B', g.poly?g.poly.length:-1)
        wkt.read(g.poly)
        ret.push({
          json: wkt.toJson(),
          group: g,
        })
      } catch (e) {
        console.error('Failed to read WKT', g)
      }
    }
  })

  return ret
})

const overlappingCGAs = computed(() => {
  const ret = []

  for (let i = 0; i < CGAs.value.length; i++) {
    for (let j = i + 1; j < CGAs.value.length; j++) {
      try {
        const p1 = turfpolygon(CGAs.value[i].json.coordinates)
        const p2 = turfpolygon(CGAs.value[j].json.coordinates)
        const intersection = turfintersect(p1, p2)

        if (intersection) {
          if (turfarea(intersection) > 500) {
            console.log(
              'Intersection',
              i,
              j,
              intersection,
              turfarea(intersection)
            )
            ret.push(intersection)

            // Don't return too many for the same polygon.
            break
          }
        }
      } catch (e) {
        console.log('Compare ', CGAs.value[i], CGAs.value[j])
        console.log('Check failed', e)
        break // TODO
      }
    }
  }

  return ret
})

const locationsInBounds = computed(() => {
  const ret = []

  if (bounds.value) {
    for (const location of locations.value) {
      if (
        location &&
        location.polygon &&
        bounds.value.contains([location.lat, location.lng])
      ) {
        const wkt = new Wkt.Wkt()
        try {
          console.log('Wkt.Wkt C') // , location.polygon
          wkt.read(location.polygon)
          location.json = wkt.toJson()
          ret.push(location)
        } catch (e) {
          console.log('WKT error', location, e)
        }
      }
    }
  }

  return ret
})
const cgaOptions = {
  fillColor: AREA_FILL_COLOUR,
  fillOpacity: shade.value ? FILL_OPACITY : 0,
  color: CGA_BOUNDARY_COLOUR,
}

const dpaOptions = {
  fillColor: AREA_FILL_COLOUR,
  fillOpacity: shade.value ? FILL_OPACITY : 0,
  color: DPA_BOUNDARY_COLOUR,
}

const cgaOverlapOptions = {
  fillColor: OVERLAP_COLOUR,
  fillOpacity: FILL_OPACITY,
  color: OVERLAP_COLOUR,
}

const dodgyInBounds = computed(() => {
  let ret = []

  if (props.bounds && props.dodgy) {
    ret = props.dodgy.filter(
      (d) => props.bounds && props.bounds.contains([d.lat, d.lng])
    )
  }

  return ret
})

watch(showDodgy, async (newVal) => {
  busy.value = true
  const bounds = mapObject.value.leafletObject.getBounds()

  const data = {
    swlat: bounds.getSouthWest().lat,
    swlng: bounds.getSouthWest().lng,
    nelat: bounds.getNorthEast().lat,
    nelng: bounds.getNorthEast().lng,
  }

  data.dodgy = newVal
  const ret = await locationStore.fetch(data)
  dodgy.value = ret.dodgy
  busy.value = false
})

function clearSelection(callback) {
  selectedObj.value = null
  selectedId.value = null
  selectedName.value = null
  selectedWKT.value = null
  dragging.value = true
  bump.value++

  // Re-enable map movement.
  mapObject.value.leafletObject._handlers.forEach(function (handler) {
    handler.enable()
  })

  if (callback) callback()
}

function selectCGA(e, g) {
  console.log('selectCGA')
  selectedObj.value = g
  selectedName.value = g.nameshort + ' CGA'
  selectedWKT.value = g.polyofficial
  bump.value++

  if (props.supportOrAdmin) {
    console.log('selectCGA EDITING', e.sourceTarget?.editing)
    if (e.sourceTarget?.editing) {
      e.sourceTarget.editing.enable()
    }
  }
}

function selectDPA(e, g) {
  console.log('selectDPA')
  selectedObj.value = g
  selectedName.value = g.nameshort + ' DPA'
  selectedWKT.value = g.poly
  bump.value++

  if (props.supportOrAdmin) {
    e.sourceTarget.editing.enable()
  }
}

function selectLocation(l) {
  // Don't allow multiple selections.
  console.log('Select location', l, JSON.stringify(selectedWKT.value))
  if (!selectedWKT.value) {
    selectedId.value = l.id
    selectedObj.value = l
    selectedName.value = l.name
    selectedWKT.value = l.polygon
    dragging.value = false
    bump.value++

    // Disable map movement to avoid triggering location reload.
    const mapobj = mapObject.value.leafletObject
    mapobj._handlers.forEach(function (handler) {
      handler.disable()
    })
  }
}

function ready() {
  console.log('Map ready', mapObject.value)
  mapObject.value.leafletObject.pm.setLang('en_gb')
  mapObject.value.leafletObject.pm.setGlobalOptions({
    allowSelfIntersection: false,
    snappable: false, // Has big effect on performance when there are many layers on the map.
  })

  // We don't need most of the editing options - we only want to draw polygons.
  mapObject.value.leafletObject.pm.addControls({
    position: 'topright',
    drawPolygon: true,
    drawMarker: false,
    drawCircleMarker: false,
    drawCircle: false,
    drawPolyline: false,
    drawRectangle: false,
    drawLine: false,
    drawText: false,
    editMode: true,
    dragMode: false,
    cutPolygon: false,
    removalMode: false,
    rotateMode: false,
  })

  mapObject.value.leafletObject.on('pm:edit', (e) => {
    console.log('Shape edit', e)
  })

  mapObject.value.leafletObject.on('pm:drawend', (e) => {
    // We've created a new polygon.  Extract the WKT and show it in the box.
    const drawLayers = mapObject.value.leafletObject.pm.getGeomanDrawLayers()

    if (drawLayers.length) {
      const wkt = new Wkt.Wkt()
      wkt.fromObject(drawLayers[0])
      selectedWKT.value = wkt.write()
      selectedObj.value = null
      bump.value++
    }
  })

  // TODO Geocoder is trashing L, which makes the drawing tools fail.
  // Probably easiest to add a separate search box outside the map.
  // const { Geocoder } = await import('leaflet-control-geocoder/src/control')
  // const { Photon } = await import(
  //   'leaflet-control-geocoder/src/geocoders/photon'
  // )
  //
  // new Geocoder({
  //   placeholder: 'Search for a place...',
  //   defaultMarkGeocode: false,
  //   geocoder: new Photon({
  //     geocodingQueryParams: {
  //       bbox: '-7.57216793459, 49.959999905, 1.68153079591, 58.6350001085',
  //     },
  //     nameProperties: ['name', 'street', 'suburb', 'hamlet', 'town', 'city'],
  //     serviceUrl,
  //   }),
  //   collapsed: false,
  // })
  //   .on('markgeocode', function (e) {
  //     if (e && e.geocode && e.geocode.bbox) {
  //       const bbox = e.geocode.bbox
  //
  //       const sw = bbox.getSouthWest()
  //       const ne = bbox.getNorthEast()
  //       console.log('BBOX', bbox, sw, ne)
  //
  //       const bounds = new window.L.LatLngBounds([
  //         [sw.lat, sw.lng],
  //         [ne.lat, ne.lng],
  //       ]).pad(0.1)
  //
  //       // For reasons I don't understand, leaflet throws errors if we don't make these local here.
  //       const swlat = bounds.getSouthWest().lat
  //       const swlng = bounds.getSouthWest().lng
  //       const nelat = bounds.getNorthEast().lat
  //       const nelng = bounds.getNorthEast().lng
  //
  //       // Empty out the query box so that the dropdown closes.
  //       this.setQuery('')
  //       zoom.value = 14
  //
  //       nextTick(() => {
  //         // Move the map to the location we've found.
  //         console.log('Fly to', swlat, swlng, nelat, nelng)
  //         mapObject.value.flyToBounds([
  //           [swlat, swlng],
  //           [nelat, nelng],
  //         ])
  //       })
  //     }
  //   })
  //   .addTo(mapObject.value.leafletObject)

  if (props.groups) {
    zoom.value = 5
  } else {
    zoom.value = 13
  }
}

async function idle() {
  boundsChanged()

  if (props.groupid) {
    const group = groupStore.get(props.groupid)

    if (group) {
      let bounds

      if (!initialGroupZoomed.value) {
        // Zoom the map to fit the DPA/CGA of the group.  We need to do this before fetching the locations so that
        // we don't fetch them for the whole country.
        initialGroupZoomed.value = true
        const area = group.poly || group.polyofficial
        if (area) {
          const wkt = new Wkt.Wkt()
          wkt.read(area)
          const obj = wkt.toObject()
          bounds = obj.getBounds()
          const abounds = [
            [bounds.getSouthWest().lat, bounds.getSouthWest().lng],
            [bounds.getNorthEast().lat, bounds.getNorthEast().lng],
          ]
          mapObject.value.leafletObject.fitBounds(abounds)
        }
      } else {
        // Get the locations in this area
        bounds = mapObject.value.leafletObject.getBounds()
      }

      if (bounds) {
        busy.value = true

        const data = {
          swlat: bounds.getSouthWest().lat,
          swlng: bounds.getSouthWest().lng,
          nelat: bounds.getNorthEast().lat,
          nelng: bounds.getNorthEast().lng,
          dodgy: showDodgy.value,
          areas: zoom.value >= 12,
        }

        await fetchLocations(data)

        busy.value = false
      }
    }
  } else if (!initialGroupZoomed.value) {
    initialGroupZoomed.value = true
    mapObject.value.setView([53.945, -2.5209], 6) // Show UK centred on Dunsop Bridge
  }
}

async function boundsChanged() {
  bounds.value = mapObject.value.leafletObject.getBounds()
  zoom.value = mapObject.value.leafletObject.getZoom()
  busy.value = true

  await nextTick()

  const data = {
    swlat: bounds.value.getSouthWest().lat,
    swlng: bounds.value.getSouthWest().lng,
    nelat: bounds.value.getNorthEast().lat,
    nelng: bounds.value.getNorthEast().lng,
    dodgy: props.showDodgy,
    areas: props.zoom >= 12,
  }

  if (group.value) {
    await fetchLocations(data)
  }

  // Sometimes the map needs a kick to show correctly.
  mapObject.value.leafletObject.invalidateSize()

  busy.value = false
}

async function saveArea(callback) {
  busy.value = true

  if (!selectedId.value) {
    // This is a new area.
    console.log('saveArea NEW')
    await locationStore.add({
      name: selectedName.value,
      polygon: selectedWKT.value,
      remap: false,
    })
  } else {
    // This is an existing area
    console.log('saveArea UPDATE')
    await locationStore.update({
      id: selectedId.value,
      name: selectedName.value,
      polygon: selectedWKT.value,
      remap: false,
    })
  }

  clearSelection()
  lastLocationFetch.value = null
  boundsChanged()

  busy.value = false
  callback()
}

async function deleteArea(callback) {
  busy.value = true

  await locationStore.delete({
    id: selectedId.value,
    groupid: props.groupid,
    remap: false,
  })

  clearSelection()
  lastLocationFetch.value = null
  busy.value = false
  callback()
}

async function fetchLocations(data) {
  const thisFetch = JSON.stringify(data)

  if (lastLocationFetch.value === thisFetch) {
    console.log('Already fetching, skip')
  } else {
    console.log('===Fetch', thisFetch, lastLocationFetch.value)
    lastLocationFetch.value = thisFetch

    if (zoom.value >= 12) {
      const ret = await locationStore.fetch(data)
      locations.value = ret.locations
      dodgy.value = ret.dodgy
    }
  }
}

function highlightPostcode(pc) {
  mapObject.value.leafletObject.flyTo([pc.lat, pc.lng])
  highlighted.value = pc
}

function dobump() {
  // Naff way to make this happen
  setTimeout(() => {
    bump.value++
  }, 500)
}
</script>
<style scoped>
.maptools {
  max-height: 38px;
}
</style>
