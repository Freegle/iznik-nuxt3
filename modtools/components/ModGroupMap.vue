<template>
  <div>
    <client-only>
      <div class="maptools d-flex mb-1 justify-content-between">
        <div class="d-flex">
          <v-icon icon="sync" :class="busy ? 'text-success fa-spin ml-4 mt-1' : 'text-faded ml-4 mt-1'" scale="2" />
        </div>
        <b-form-checkbox v-if="groups || groupid" v-model="cga" class="ml-2">
          <strong style="color: darkgreen">Show CGAs</strong>
        </b-form-checkbox>
        <b-form-checkbox v-if="groups || groupid" v-model="dpa" class="ml-2">
          <strong style="color: darkblue">Show DPAs</strong>
        </b-form-checkbox>
        <b-form-checkbox v-if="groupid" v-model="labels" class="ml-2 font-weight-bold">
          Labels
        </b-form-checkbox>
        <b-form-checkbox v-model="shade" class="ml-2 font-weight-bold" @click="dobump">
          Shade areas
        </b-form-checkbox>
        <b-form-checkbox v-model="showDodgy" class="ml-2 font-weight-bold">
          Areas to Review
        </b-form-checkbox>
      </div>
      <div>{{ groupname }}</div>
      <b-modal id="mappingChanges" ref="mappingChanges" v-model="showMappingChanges">
        <p>
          If you have the "Areas to Review" checkbox ticked, you'll see the red circles for
          postcodes which might need better mapping.
        </p>
        <p class="font-weight-bold text-danger">
          The red circles indicate where mapping has changed recently. You can review these to check if it looks OK.
        </p>
        <ul>
          <li>
            The occasional dot is OK.
            Clusters of dots in a single area are worth reviewing.
          </li>
          <li>
            The dots might highlight areas where the existing mapping is poor. Typical problem are places where
            areas overlap, or where there are gaps between areas.
          </li>
          <li>
            Click on a postcode in this section to centre the map on it, then zoom in if you need to.
          </li>
        </ul>
        <p>
          You can fix these:
        </p>
        <ul>
          <li>
            You can adjust area boundaries.
          </li>
          <li>
            You can add new areas.
          </li>
          <li>
            You can delete areas.
          </li>
        </ul>
        <p class="font-weight-bold text-danger">
          The red circles don't get updated at the moment. Soon.
        </p>
        <p>
          To help more widely, you can zoom the map out to view the whole UK. Once you zoom out far enough you'll see the numbers of
          postcodes which need attention - you can click on those to zoom in.
        </p>
      </b-modal>
      <b-row class="m-0">
        <b-col ref="mapcont" cols="12" md="9" class="p-0">
          <!--
          -->
          <div>
            <l-map ref="map" :zoom="zoom" :min-zoom="5" :max-zoom="17" :options="{ dragging: dragging, touchZoom: true }"
              :style="'width: 100%; height: ' + mapHeight + 'px'" @update:bounds="boundsChanged" @update:zoom="boundsChanged" @ready="ready"
              @moveend="idle">
              <l-tile-layer :url="osmtile" :attribution="attribution" />
              <l-control position="topright" />
              <div v-if="cga">
                <l-geojson v-for="(c, i) in CGAs" :key="'cga-' + i" :geojson="c.json" :options="cgaOptions" :z-index-offset="2"
                  @click="selectCGA($event, c.group)" />
              </div>
              <div v-if="dpa">
                <l-geojson v-for="(d, i) in DPAs" :key="'dpa-' + i" :geojson="d.json" :options="dpaOptions" :z-index-offset="1"
                  @click="selectDPA($event, d.group)" />
              </div>
              <div v-if="overlaps && showDodgy && !groupid">
                <l-geojson v-for="(d, i) in overlappingCGAs" :key="'cgaoverlap-' + i" :geojson="d" :options="cgaOverlapOptions" :z-index-offset="0" />
              </div>
              <div v-if="groupid">
                <l-feature-group>
                  <div v-if="zoom >= 12">
                    <ModGroupMapLocation v-for="l in locationsInBounds" :key="'location-' + l.id" :ref="'location-' + l.id" :location="l"
                      :selected="selectedObj === l" :shade="shade" :labels="labels" :map="mapObject" @click="selectLocation(l)" :bump="bump" />
                  </div>
                </l-feature-group>
              </div>
              <div v-if="showDodgy && groupid">
                <ClusterMarker v-if="mapObject && zoom < 10" :markers="dodgyInBounds" :map="mapObject" />
                <l-feature-group v-else>
                  <l-circle-marker v-if="highlighted" :key="'highlighted-' + highlighted.id" :lat-lng="[highlighted.lat, highlighted.lng]"
                    :interactive="false" :radius="5" color="blue" />
                  <l-circle-marker v-for="d in dodgyInBounds" :key="d.id" :lat-lng="d" :radius="5" color="red" @click="selected = d" />
                </l-feature-group>
              </div>

              <div v-if="groups && zoom > 7">
                <l-circle-marker v-for="g in allgroups" :key="'groupcentre-' + g.id" :lat-lng="[g.lat, g.lng]" :radius="10" color="darkgreen"
                  :fill="true" fillColor="darkgreen" :fillOpacity="1" />
              </div>
            </l-map>
          </div>
        </b-col>
        <b-col cols="12" md="3">
          <b-card v-if="selectedWKT" class="mb-2" no-body>
            <b-card-header class="bg-info">
              Area Details
            </b-card-header>
            <b-card-body>
              <p class="text-danger font-weight-bold">
                Zoom/pan locked while area selected. Use Cancel to free.
              </p>
              <div v-if="groupid">
                <b-form-input v-model="selectedName" placeholder="Enter area name" size="lg" class="mb-1" />
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
            <b-card-footer v-if="groupid" class="d-flex justify-content-between flex-wrap">
              <SpinButton variant="primary" icon-name="save" label="Save" spinclass="text-white" @handle="saveArea"
                :disabled="!selectedName || !selectedWKT || intersects" />
              <SpinButton variant="white" icon-name="times" label="Cancel" @handle="clearSelection" />
              <SpinButton v-if="selectedId" variant="danger" icon-name="trash-alt" label="Delete" @handle="deleteArea" />
            </b-card-footer>
          </b-card>
          Zoom: {{ zoom }} Groups: {{ groups }}
          <NoticeMessage v-if="zoom < 12" variant="danger" show class="mb-2">
            Please zoom in further to see locations.
          </NoticeMessage>
          <ModPostcodeTester />
          <ModConvertKML />
          <b-card v-if="dodgyInBounds.length" no-body style="max-height: 600px; overflow-y: scroll">
            <b-card-header class="bg-warning d-flex justify-content-between">
              Mapping Changes
              <b-button variant="white" @click="showMappingChanges = true">
                Details
              </b-button>
            </b-card-header>
            <b-card-body>
              <div v-if="dodgyInBounds.length < 200">
                <ModChangedMapping v-for="d in dodgyInBounds" :key="d.id" :changed="d" :highlighted="highlighted" @click="highlightPostcode(d)" />
              </div>
              <p v-else>
                Too many changes to show; zoom in.
              </p>
            </b-card-body>
          </b-card>
        </b-col>
      </b-row>
    </client-only>
  </div>
</template>
<script>
import { useRuntimeConfig } from '#app'

import { useGroupStore } from '~/stores/group'
import { useLocationStore } from '~/stores/location'

//import LDraw from 'leaflet-draw'
import 'leaflet-draw/dist/leaflet.draw.css'
import 'leaflet-control-geocoder/dist/Control.Geocoder.css'
import { attribution, osmtile, loadLeaflet } from '../composables/useMap'
import Wkt from 'wicket'

import ClusterMarker from '../components/ClusterMarker'
//import map from '@/mixins/map.js'
import turfpolygon from 'turf-polygon'
import turfintersect from 'turf-intersect'
import turfarea from 'turf-area'

// const GROUP_FILL_COLOUR = '#EEFFCC'
const AREA_FILL_COLOUR = 'darkgreen'
const OVERLAP_COLOUR = 'red'
const FILL_OPACITY = 0.6
const CGA_BOUNDARY_COLOUR = 'darkgreen'
const DPA_BOUNDARY_COLOUR = 'darkblue'
// const CENTRE_FILL_COLOUR = 'darkgreen'
// const CENTRE_BORDER_COLOUR = 'darkgrey'

export default {
  components: {
    ClusterMarker,
  },
  async setup() {
    const groupStore = useGroupStore()
    const locationStore = useLocationStore()
    const runtimeConfig = useRuntimeConfig()

    let L = null

    if (process.client) {
      L = await import('leaflet/dist/leaflet-src.esm')
    }

    const serviceUrl = runtimeConfig.public.GEOCODE

    return {
      groupStore,
      locationStore,
      Wkt,
      L,
      osmtile: osmtile(),
      attribution: attribution(),
      serviceUrl
    }
  },
  //mixins: [map],
  props: {
    groups: {
      type: Boolean,
      required: false,
      default: false
    },
    groupid: {
      type: Number,
      required: false,
      default: null
    },
    caretaker: {
      type: Boolean,
      required: false,
      default: false
    },
    overlaps: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  data: function () {
    return {
      cgas: [],
      dpas: [],
      initialGroupZoomed: false,
      dpa: false,
      cga: true,
      shade: true,
      labels: true,
      showDodgy: false,
      selectedName: null,
      selectedWKT: null,
      dragging: true,
      selectedObj: null,
      selectedId: null,
      busy: false,
      intersects: false,
      mapObject: null,
      zoom: 12,
      lastLocationFetch: null,
      showMappingChanges: false,
      highlighted: null,
      bounds: null,
      locations: [],
      dodgy: [],
      bump: 0,
    }
  },
  computed: {
    browser() {
      return process.client
    },
    mapHeight() {
      let height = 0

      if (process.client) {
        height = window.innerHeight - 150
      }

      return height
    },
    allgroups() {
      let groups = Object.values(this.groupStore.list)
      console.log('allgroups', groups.length)

      if (this.caretaker) {
        groups = groups.filter(g => g.mentored)
      }

      return groups
    },
    group() {
      return this.groupid
        ? this.groupStore.get(this.groupid)
        : null
    },
    groupname() {
      const group = this.group
      if (group) {
        let groupname = group.namefull ?? group.nameshort
        if (group.region) groupname += ' (' + group.region + ')'
        return groupname
      }
      if (this.caretaker) return 'Caretaker groups'
      return 'All groups'
    },
    groupsInBounds() {
      const ret = []

      if (this.bounds) {
        for (const group in this.allgroups) {
          if (this.bounds.contains([group.lat, group.lng])) {
            ret.push(group)
          }
        }
      }

      return ret
    },
    CGAs() {
      const ret = []

      this.allgroups.forEach(g => {
        if (g.onmap && g.polyofficial) {
          try {
            const wkt = new Wkt.Wkt()
            //console.log('Wkt.Wkt A', g.polyofficial?g.polyofficial.length:-1)
            wkt.read(g.polyofficial)
            ret.push({
              json: wkt.toJson(),
              group: g
            })
          } catch (e) {
            console.error('Failed to read WKT', g)
          }
        }
      })

      return ret
    },
    DPAs() {
      const ret = []

      this.allgroups.forEach(g => {
        if (g.onmap && g.poly) {
          try {
            const wkt = new Wkt.Wkt()
            //console.log('Wkt.Wkt B', g.poly?g.poly.length:-1)
            wkt.read(g.poly)
            ret.push({
              json: wkt.toJson(),
              group: g
            })
          } catch (e) {
            console.error('Failed to read WKT', g)
          }
        }
      })

      return ret
    },
    overlappingCGAs() {
      const ret = []

      for (let i = 0; i < this.CGAs.length; i++) {
        for (let j = i + 1; j < this.CGAs.length; j++) {
          try {
            const p1 = turfpolygon(this.CGAs[i].json.coordinates)
            const p2 = turfpolygon(this.CGAs[j].json.coordinates)
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
            console.log('Compare ', this.CGAs[i], this.CGAs[j])
            console.log('Check failed', e)
            break // TODO
          }
        }
      }

      return ret
    },
    locationsInBounds() {
      const ret = []

      if (this.bounds) {
        for (const location of this.locations) {
          if (
            location &&
            location.polygon &&
            this.bounds.contains([location.lat, location.lng])
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
    },
    cgaOptions() {
      return {
        fillColor: AREA_FILL_COLOUR,
        fillOpacity: this.shade ? FILL_OPACITY : 0,
        color: CGA_BOUNDARY_COLOUR
      }
    },
    dpaOptions() {
      return {
        fillColor: AREA_FILL_COLOUR,
        fillOpacity: this.shade ? FILL_OPACITY : 0,
        color: DPA_BOUNDARY_COLOUR
      }
    },
    cgaOverlapOptions() {
      return {
        fillColor: OVERLAP_COLOUR,
        fillOpacity: FILL_OPACITY,
        color: OVERLAP_COLOUR
      }
    },
    dodgyInBounds() {
      if (!this.bounds || !this.dodgy) return []
      return this.dodgy.filter(
        d => this.bounds && this.bounds.contains([d.lat, d.lng])
      )
    }
  },
  watch: {
    async showDodgy(newVal) {
      if (this.$refs.map) {
        this.busy = true
        const bounds = this.$refs.map.leafletObject.getBounds()

        const data = {
          swlat: bounds.getSouthWest().lat,
          swlng: bounds.getSouthWest().lng,
          nelat: bounds.getNorthEast().lat,
          nelng: bounds.getNorthEast().lng
        }

        data.dodgy = newVal
        const ret = await this.locationStore.fetch(data)
        this.dodgy = ret.dodgy
        this.busy = false
      }
    }
  },
  async mounted() {
    await loadLeaflet()
    // ready() called when ready
  },
  methods: {
    clearSelection(callback) {
      this.selectedObj = null
      this.selectedId = null
      this.selectedName = null
      this.selectedWKT = null
      this.dragging = true
      this.bump++

      if (this.$refs.map) {
        // Re-enable map movement.
        const mapobj = this.$refs.map.leafletObject
        mapobj._handlers.forEach(function (handler) {
          handler.enable()
        })
      }
      if (callback) callback()
    },
    selectCGA(e, g) {
      console.log('selectCGA')
      this.selectedObj = g
      this.selectedName = g.nameshort + ' CGA'
      this.selectedWKT = g.polyofficial
      this.bump++

      if (this.supportOrAdmin) {
        console.log('selectCGA EDITING', e.sourceTarget)
        e.sourceTarget.editing.enable()
      }
    },
    selectDPA(e, g) {
      this.selectedObj = g
      this.selectedName = g.nameshort + ' DPA'
      this.selectedWKT = g.poly
      this.bump++

      if (this.supportOrAdmin) {
        e.sourceTarget.editing.enable()
      }
    },
    selectLocation(l) {
      console.log("selectLocation", l.id)
      this.selectedId = l.id
      this.selectedObj = l
      this.selectedName = l.name
      this.selectedWKT = l.polygon
      this.dragging = false
      this.bump++

      // Disable map movement to avoid triggering location reload.
      if (this.$refs.map) {
        const mapobj = this.$refs.map.leafletObject
        mapobj._handlers.forEach(function (handler) {
          handler.disable()
        })
      }
    },
    shapeChanged(e) {
      console.log("====shapeChanged")
      if (e.poly) {
        this.intersects = e.poly.intersects()

        const wkt = new Wkt.Wkt()
        console.log('Wkt.Wkt D', e.poly)
        wkt.fromObject(e.poly)
        this.selectedWKT = wkt.write()
      }
    },
    async ready() {
      const self = this

      if (process.client) {
        if (this.$refs.map) {
          const themap = this.$refs.map.leafletObject
          this.mapObject = themap

          const { Geocoder } = await import(
            'leaflet-control-geocoder/src/control'
          )
          const { Photon } = await import(
            'leaflet-control-geocoder/src/geocoders/photon'
          )
          new Geocoder({
            placeholder: 'Search for a place...',
            defaultMarkGeocode: false,
            geocoder: new Photon({
              geocodingQueryParams: {
                bbox: '-7.57216793459, 49.959999905, 1.68153079591, 58.6350001085',
              },
              nameProperties: [
                'name',
                'street',
                'suburb',
                'hamlet',
                'town',
                'city',
              ],
              serviceUrl: this.serviceUrl,
            }),
            collapsed: false,
          })
            .on('markgeocode', function (e) {
              if (e && e.geocode && e.geocode.bbox) {
                const bbox = e.geocode.bbox

                const sw = bbox.getSouthWest()
                const ne = bbox.getNorthEast()
                console.log('BBOX', bbox, sw, ne)

                const bounds = new window.L.LatLngBounds([
                  [sw.lat, sw.lng],
                  [ne.lat, ne.lng],
                ]).pad(0.1)

                // For reasons I don't understand, leaflet throws errors if we don't make these local here.
                const swlat = bounds.getSouthWest().lat
                const swlng = bounds.getSouthWest().lng
                const nelat = bounds.getNorthEast().lat
                const nelng = bounds.getNorthEast().lng

                // Empty out the query box so that the dropdown closes.
                this.setQuery('')
                this.zoom = 14

                self.$nextTick(() => {
                  // Move the map to the location we've found.
                  console.log('Fly to', swlat, swlng, nelat, nelng)
                  self.mapObject.flyToBounds([
                    [swlat, swlng],
                    [nelat, nelng],
                  ])
                })
              }
            })
            .addTo(this.mapObject)

          if (this.groups) {
            this.zoom = 5
          } else {
            this.zoom = 13
          }

          // Last layer is drawn items.  Seems to be, anyway.  Need to use this so that we can turn on editing for
          // the locations we've already got, as well as any new ones we draw.
          let drawnItems = null

          themap.eachLayer(l => {
            drawnItems = l
          })

          try {
            if (drawnItems) {
              console.log('################## drawnItems', drawnItems)
              const fgdrawnItems = new window.L.FeatureGroup([
                drawnItems
              ])
              await import(
                'leaflet-draw/dist/leaflet.draw-src.js'
              )
              const drawControl = new window.L.Control.Draw({
                edit: {
                  featureGroup: fgdrawnItems,
                  remove: false,
                  edit: false,
                  poly: {
                    allowIntersection: false
                  }
                },
                position: 'topright',
                draw: {
                  polyline: false,
                  polygon: {
                    allowIntersection: false,
                    showArea: true
                  },
                  rectangle: false,
                  circle: false,
                  marker: false,
                  circlemarker: false
                }
              })

              themap.addControl(drawControl)

              themap.on(L.Draw.Event.CREATED, e => {
                // const type = e.layerType;
                console.log("===========================================================L.Draw.Event.CREATED", e)
                const layer = e.layer
                layer.editing.enable()
                layer.addTo(drawnItems)

                const wkt = new Wkt.Wkt()
                wkt.fromObject(layer)
                this.selectedWKT = wkt.write()
              })

              themap.on(L.Draw.Event.DRAWVERTEX, this.shapeChanged)
              themap.on(L.Draw.Event.EDITVERTEX, this.shapeChanged)
            }
          } catch (e) {
            console.log('drawnItems FAIL TODO', e.message)
          }
        }
      }
    },
    boundsChanged() {
      if (this.$refs.map) {
        this.bounds = this.$refs.map.leafletObject.getBounds()
        this.zoom = this.$refs.map.leafletObject.getZoom()
      }
    },
    async idle() {
      const self = this
      this.boundsChanged()

      if (this.groupid) {
        const group = this.groupStore.get(this.groupid)

        if (group) {
          let bounds

          if (!this.initialGroupZoomed) {
            // Zoom the map to fit the DPA/CGA of the group.  We need to do this before fetching the locations so that
            // we don't fetch them for the whole country.
            this.initialGroupZoomed = true
            const area = group.poly || group.polyofficial
            if (area) {
              console.log('=== Wkt.Wkt E group')
              const wkt = new Wkt.Wkt()
              wkt.read(area)
              const obj = wkt.toObject(this.mapObject.defaults)
              bounds = obj.getBounds()
              const abounds = [[bounds.getSouthWest().lat, bounds.getSouthWest().lng], [bounds.getNorthEast().lat, bounds.getNorthEast().lng]]
              this.mapObject.fitBounds(abounds)
            }
          } else {
            // Get the locations in this area
            bounds = this.$refs.map.leafletObject.getBounds()
          }

          if (bounds) {
            this.busy = true

            const data = {
              swlat: bounds.getSouthWest().lat,
              swlng: bounds.getSouthWest().lng,
              nelat: bounds.getNorthEast().lat,
              nelng: bounds.getNorthEast().lng,
              dodgy: this.showDodgy,
              areas: this.zoom >= 12
            }

            await this.fetchLocations(data)

            this.busy = false
          }
        }
      } else {
        if (!this.initialGroupZoomed) {
          this.initialGroupZoomed = true
          this.mapObject.setView([53.945, -2.5209], 6) // Show UK centred on Dunsop Bridge
        }
      }
    },
    async boundsChanged() {
      // console.log('===boundsChanged')
      if (this.$refs.map && this.$refs.map.leafletObject) {
        this.bounds = this.$refs.map.leafletObject.getBounds()
        // console.log('===boundsChanged', this.bounds)
        this.zoom = this.$refs.map.leafletObject.getZoom()
        this.busy = true

        await this.$nextTick()

        const data = {
          swlat: this.bounds.getSouthWest().lat,
          swlng: this.bounds.getSouthWest().lng,
          nelat: this.bounds.getNorthEast().lat,
          nelng: this.bounds.getNorthEast().lng,
          dodgy: this.showDodgy,
          areas: this.zoom >= 12
        }

        if (this.group) {
          await this.fetchLocations(data)
        }

        // Sometimes the map needs a kick to show correctly.
        this.$refs.map.leafletObject.invalidateSize()
      }

      this.busy = false
    },
    async saveArea(callback) {
      this.busy = true

      if (!this.selectedId) {
        // This is a new area.
        console.log('saveArea NEW')
        await this.locationStore.add({
          name: this.selectedName,
          polygon: this.selectedWKT,
          remap: false
        })
      } else {
        // This is an existing area
        console.log('saveArea UPDATE')
        await this.locationStore.update({
          id: this.selectedId,
          name: this.selectedName,
          polygon: this.selectedWKT,
          remap: false
        })
      }

      this.clearSelection()
      this.lastLocationFetch = null
      this.boundsChanged()

      this.busy = false
      callback()
    },
    async deleteArea(callback) {
      this.busy = true

      await this.locationStore.delete({
        id: this.selectedId,
        groupid: this.groupid,
        remap: false
      })

      this.clearSelection()
      this.lastLocationFetch = null
      this.busy = false
      callback()
    },
    async fetchLocations(data) {
      const thisFetch = JSON.stringify(data)

      if (this.lastLocationFetch === thisFetch) {
        console.log('Already fetching, skip')
      } else {
        console.log('===Fetch', thisFetch, this.lastLocationFetch)
        this.lastLocationFetch = thisFetch

        // TODO DONE: Do not fetch if too zoomed out
        //if (this.zoom >= 12) {
        const ret = await this.locationStore.fetch(data)
        this.locations = ret.locations
        this.dodgy = ret.dodgy
        //}
      }
    },
    highlightPostcode(pc) {
      if (this.$refs.map) {
        this.$refs.map.leafletObject.flyTo([pc.lat, pc.lng])
        this.highlighted = pc
      }
    },
    dobump() { // Naff way to make this happen
      setTimeout(() => {
        this.bump++
      }, 500)
    }
  }
}
</script>
<style scoped>
.maptools {
  max-height: 38px;
}

.max {
  max-width: 300px;
}

/* Having trouble getting the CSS in here, so inlined.  Also added images. */
:deep(.leaflet-draw-section) {
  position: relative;
}

:deep(.leaflet-draw-toolbar) {
  margin-top: 12px;
}

:deep(.leaflet-draw-toolbar-top) {
  margin-top: 0;
}

:deep(.leaflet-draw-toolbar-notop a:first-child) {
  border-top-right-radius: 0;
}

:deep(.leaflet-draw-toolbar-nobottom a:last-child) {
  border-bottom-right-radius: 0;
}

:deep(.leaflet-draw-toolbar a) {
  background-image: url('/drawtoolbar/spritesheet.png');
  background-image: linear-gradient(transparent, transparent),
    url('/drawtoolbar/spritesheet.svg');
  background-repeat: no-repeat;
  background-size: 300px 30px;
  background-clip: padding-box;
}

:deep(.leaflet-retina .leaflet-draw-toolbar a) {
  background-image: url('/drawtoolbar/spritesheet-2x.png');
  background-image: linear-gradient(transparent, transparent),
    url('/drawtoolbar/spritesheet.svg');
}

:deep(.leaflet-draw a) {
  display: block;
  text-align: center;
  text-decoration: none;
}

:deep(.leaflet-draw a .sr-only) {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

:deep(.leaflet-draw-actions) {
  display: none;
  list-style: none;
  margin: 0;
  padding: 0;
  position: absolute;
  left: 26px;
  top: 0;
  white-space: nowrap;
}

:deep(.leaflet-touch .leaflet-draw-actions) {
  left: 32px;
}

:deep(.leaflet-right .leaflet-draw-actions) {
  right: 26px;
  left: auto;
}

:deep(.leaflet-touch .leaflet-right .leaflet-draw-actions) {
  right: 32px;
  left: auto;
}

:deep(.leaflet-draw-actions li) {
  display: inline-block;
}

:deep(.leaflet-draw-actions li:first-child a) {
  border-left: 0;
}

:deep(.leaflet-draw-actions li:last-child a) {
  -webkit-border-radius: 0 4px 4px 0;
  border-radius: 0 4px 4px 0;
}

:deep(.leaflet-right .leaflet-draw-actions li:last-child a) {
  -webkit-border-radius: 0;
  border-radius: 0;
}

:deep(.leaflet-right .leaflet-draw-actions li:first-child a) {
  -webkit-border-radius: 4px 0 0 4px;
  border-radius: 4px 0 0 4px;
}

:deep(.leaflet-draw-actions a) {
  background-color: #919187;
  border-left: 1px solid #aaa;
  color: #fff;
  font: 11px/19px 'Helvetica Neue', Arial, Helvetica, sans-serif;
  line-height: 28px;
  text-decoration: none;
  padding-left: 10px;
  padding-right: 10px;
  height: 28px;
}

:deep(.leaflet-touch .leaflet-draw-actions a) {
  font-size: 12px;
  line-height: 30px;
  height: 30px;
}

:deep(.leaflet-draw-actions-bottom) {
  margin-top: 0;
}

:deep(.leaflet-draw-actions-top) {
  margin-top: 1px;
}

:deep(.leaflet-draw-actions-top a),
:deep(.leaflet-draw-actions-bottom a) {
  height: 27px;
  line-height: 27px;
}

:deep(.leaflet-draw-actions a:hover) {
  background-color: #a0a098;
}

:deep(.leaflet-draw-actions-top.leaflet-draw-actions-bottom a) {
  height: 26px;
  line-height: 26px;
}

:deep(.leaflet-draw-toolbar .leaflet-draw-draw-polyline) {
  background-position: -2px -2px;
}

:deep(.leaflet-touch .leaflet-draw-toolbar .leaflet-draw-draw-polyline) {
  background-position: 0 -1px;
}

:deep(.leaflet-draw-toolbar .leaflet-draw-draw-polygon) {
  background-position: -31px -2px;
}

:deep(.leaflet-touch .leaflet-draw-toolbar .leaflet-draw-draw-polygon) {
  background-position: -29px -1px;
}

:deep(.leaflet-draw-toolbar .leaflet-draw-draw-rectangle) {
  background-position: -62px -2px;
}

:deep(.leaflet-touch .leaflet-draw-toolbar .leaflet-draw-draw-rectangle) {
  background-position: -60px -1px;
}

:deep(.leaflet-draw-toolbar .leaflet-draw-draw-circle) {
  background-position: -92px -2px;
}

:deep(.leaflet-touch .leaflet-draw-toolbar .leaflet-draw-draw-circle) {
  background-position: -90px -1px;
}

:deep(.leaflet-draw-toolbar .leaflet-draw-draw-marker) {
  background-position: -122px -2px;
}

:deep(.leaflet-touch .leaflet-draw-toolbar .leaflet-draw-draw-marker) {
  background-position: -120px -1px;
}

:deep(.leaflet-draw-toolbar .leaflet-draw-draw-circlemarker) {
  background-position: -273px -2px;
}

:deep(.leaflet-touch .leaflet-draw-toolbar .leaflet-draw-draw-circlemarker) {
  background-position: -271px -1px;
}

:deep(.leaflet-draw-toolbar .leaflet-draw-edit-edit) {
  background-position: -152px -2px;
}

:deep(.leaflet-touch .leaflet-draw-toolbar .leaflet-draw-edit-edit) {
  background-position: -150px -1px;
}

:deep(.leaflet-draw-toolbar .leaflet-draw-edit-remove) {
  background-position: -182px -2px;
}

:deep(.leaflet-touch .leaflet-draw-toolbar .leaflet-draw-edit-remove) {
  background-position: -180px -1px;
}

:deep(.leaflet-draw-toolbar .leaflet-draw-edit-edit.leaflet-disabled) {
  background-position: -212px -2px;
}

:deep(.leaflet-touch .leaflet-draw-toolbar .leaflet-draw-edit-edit.leaflet-disabled) {
  background-position: -210px -1px;
}

:deep(.leaflet-draw-toolbar .leaflet-draw-edit-remove.leaflet-disabled) {
  background-position: -242px -2px;
}

:deep(.leaflet-touch .leaflet-draw-toolbar .leaflet-draw-edit-remove.leaflet-disabled) {
  background-position: -240px -2px;
}

:deep(.leaflet-mouse-marker) {
  background-color: #fff;
  cursor: crosshair;
}

:deep(.leaflet-draw-tooltip) {
  background: #363636;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid transparent;
  -webkit-border-radius: 4px;
  border-radius: 4px;
  color: #fff;
  font: 12px/18px 'Helvetica Neue', Arial, Helvetica, sans-serif;
  margin-left: 20px;
  margin-top: -21px;
  padding: 4px 8px;
  position: absolute;
  visibility: hidden;
  white-space: nowrap;
  z-index: 6;
}

:deep(.leaflet-draw-tooltip:before) {
  border-right: 6px solid black;
  border-right-color: rgba(0, 0, 0, 0.5);
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  content: '';
  position: absolute;
  top: 7px;
  left: -7px;
}

:deep(.leaflet-error-draw-tooltip) {
  background-color: #f2dede;
  border: 1px solid #e6b6bd;
  color: #b94a48;
}

:deep(.leaflet-error-draw-tooltip:before) {
  border-right-color: #e6b6bd;
}

:deep(.leaflet-draw-tooltip-single) {
  margin-top: -12px;
}

:deep(.leaflet-draw-tooltip-subtext) {
  color: #f8d5e4;
}

:deep(.leaflet-draw-guide-dash) {
  font-size: 1%;
  opacity: 0.6;
  position: absolute;
  width: 5px;
  height: 5px;
}

:deep(.leaflet-edit-marker-selected) {
  background-color: rgba(254, 87, 161, 0.1);
  border: 4px dashed rgba(254, 87, 161, 0.6);
  -webkit-border-radius: 4px;
  border-radius: 4px;
  box-sizing: content-box;
}

:deep(.leaflet-edit-move) {
  cursor: move;
}

:deep(.leaflet-edit-resize) {
  cursor: pointer;
}

:deep(.leaflet-oldie .leaflet-draw-toolbar) {
  border: 1px solid #999;
}
</style>
