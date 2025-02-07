<template>
  <div class="mb-2">
    <label>
      Post visibility
    </label>
    <p>
      On the Browse page, freeglers will see posts that are reasonably close to their own location, based on how long it
      would take them to get there. They can adjust this setting, and also whether they are travelling on foot,
      by bike, or by car. They can also add extra locations - for example if they have relatives in different places.
      Once they post on a group, or reply to a post, then they will become a group member.
    </p>
    <p>
      This gives a good set of posts for most freeglers. It particularly helps those who are close to
      group boundaries. Posts in neighbouring groups may be a lot closer to them than some of the posts on the far
      side of the group they're in.
    </p>
    <p>
      You can restrict how far outside your group the posts will be easily visible. You should only do
      this if you want to override the members' choice.
      <b>This will result in less freegling near the boundaries of your group.</b>
    </p>
    <p v-if="!showing">
      Click the toggle to show the map.
    </p>
    <OurToggle :value="showing" class="mt-2" :height="30" :width="150" :font-size="14" :sync="true"
      :labels="{ checked: 'Show map', unchecked: 'Hide map' }" color="#61AE24" @change="toggleView" />
    <div v-if="showing">
      <p>
        This map shows your Core Group Area (CGA) in dark blue. You can control how far outside this area
        posts are easily visible using the slider. The visible area is shown in light blue.
      </p>
      <div class="d-flex">
        <label class="mr-2">
          Just the group
        </label>
        <b-form-input v-model="scale" class="w-100" type="range" min="0" max="30000" step="100" />
        <label class="ml-2">
          Further away
        </label>
        <SpinButton icon-name="save" label="Save" variant="primary" @handle="save" />
      </div>
      <l-map ref="map" :zoom="7" :max-zoom="17" :center="[group.lat, group.lng]" :style="'width: 100%; height: 600px'" @ready="ready">
        <l-tile-layer :url="osmtile" :attribution="attribution" />
        <l-geojson v-if="CGA" :geojson="CGA" :options="cgaOptions" />
        <l-geojson v-if="visibility" :geojson="visibility" :options="visibilityOptions" />
      </l-map>
    </div>
  </div>
</template>
<script>
// We can't easily go back from a postvisibility polygon to the scale value.  
// So: display correct postvisibility polygon but scale is always reset to just group
import { useGroupStore } from '../../stores/group'
import turfbuffer from 'turf-buffer'
import Wkt from 'wicket'
import { attribution, osmtile, loadLeaflet } from '../composables/useMap'

export default {
  setup(props) {
    const groupStore = useGroupStore()
    return {
      groupStore,
      Wkt,
      osmtile: osmtile(),
      attribution: attribution()
    }
  },
  props: {
    groupid: {
      type: Number,
      required: true
    }
  },
  data: function () {
    return {
      showing: false,
      value: null,
      scale: 0,
      changed: false
    }
  },
  computed: {
    group() {
      return this.groupStore.get(this.groupid)
    },
    CGA() {
      const wkt = new Wkt.Wkt()
      try {
        wkt.read(this.group.dpa || this.group.cga)
        return wkt.toJson()
      } catch (e) {
        console.log('WKT error', e)
      }

      return null
    },
    visibility() {
      if (!this.changed && this.group.postvisibility) {
        // We can't easily go back from a postvisibility polygon to the scale value.  So we return the polygon if
        // set.
        const wkt = new Wkt.Wkt()
        wkt.read(this.group.postvisibility)
        return wkt.toJson()
      } else {
        // Scale the CGA.
        const CGA = this.CGA

        if (CGA) {
          return turfbuffer(CGA, this.scale, 'meters')
        } else {
          return null
        }
      }
    },
    cgaOptions() {
      return {
        fillColor: 'darkblue',
        fillOpacity: 0.5,
        color: 'black'
      }
    },
    visibilityOptions() {
      return {
        fillColor: 'lightblue',
        fillOpacity: 0.5,
        color: 'darkgrey'
      }
    }
  },
  watch: {
    groupid(newval) {
      this.getValueFromGroup()
    },
    scale(newVal) {
      this.changed = true
    }
  },
  async mounted() {
    this.getValueFromGroup()
    await loadLeaflet()
  },
  methods: {
    async getValueFromGroup() {
      const obj = await this.groupStore.get(this.groupid)

      if (obj) {
        this.value = obj.postvisibility
      }
    },
    toggleView(c, e) {
      this.showing = c

      if (!c) {
        this.value = null
      } else {
        this.zoomToCGA()
      }
    },
    async ready() {
      if (process.client) {
        this.zoomToCGA()
      }
    },
    zoomToCGA() {
      try {
        if (this.$refs.map?.leafletObject) {
          const area = this.group.dpa || this.group.cga
          const wkt = new Wkt.Wkt()
          const x = wkt.read(area)
          const obj = wkt.toObject()
          const bounds = obj.getBounds()
          this.$refs.map.leafletObject.fitBounds(bounds.pad(0.1))
        }
      } catch (e) {
        console.log('zoomToCGA error', e)
      }
    },
    async save(callback) {
      const wkt = new Wkt.Wkt()
      wkt.read(JSON.stringify(this.visibility))

      await this.groupStore.updateMT({
        id: this.groupid,
        postvisibility: wkt.toString()
      })
      callback()
    }
  }
}
</script>
