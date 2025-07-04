<template>
  <div v-if="clusters && clusters.length">
    <div v-for="cluster in clusters" :key="'cluster-' + cluster.id">
      <l-marker
        v-if="cluster.properties"
        :lat-lng="[
          cluster.geometry.coordinates[1],
          cluster.geometry.coordinates[0],
        ]"
        :interactive="false"
        :title="cluster.properties"
        @click="clusterClick(cluster)"
      >
        <l-icon :class-name="cssClass">
          <ClusterIcon
            :count="cluster.properties ? cluster.properties.point_count : 1"
            :tag="tag"
            :class-name="'clear ' + cssClass"
          />
        </l-icon>
      </l-marker>
      <l-marker
        v-else
        :lat-lng="[
          cluster.geometry.coordinates[1],
          cluster.geometry.coordinates[0],
        ]"
        :interactive="false"
        :class-name="cssClass"
        @click="pointClick(cluster)"
      >
        <l-icon>
          <ClusterIcon
            :count="cluster.properties ? cluster.properties.point_count : 1"
            :tag="tag"
            :class-name="'clear ' + cssClass"
          />
        </l-icon>
      </l-marker>
    </div>
  </div>
</template>
<script setup>
import { computed } from 'vue'
import Supercluster from 'supercluster/dist/supercluster'
import ClusterIcon from './ClusterIcon'
import { MAX_MAP_ZOOM } from '~/constants'

const props = defineProps({
  // Array of { id, lat, lng }
  markers: {
    type: Array,
    required: true,
  },
  map: {
    type: Object,
    required: true,
  },
  radius: {
    type: Number,
    required: false,
    default: 60,
  },
  extent: {
    type: Number,
    required: false,
    default: 256,
  },
  minZoom: {
    type: Number,
    required: false,
    default: 0,
  },
  maxZoom: {
    type: Number,
    required: false,
    default: MAX_MAP_ZOOM,
  },
  minCluster: {
    type: Number,
    required: false,
    default: 10,
  },
  tag: {
    type: String,
    required: false,
    default: null,
  },
  cssClass: {
    type: String,
    required: false,
    default: '',
  },
})

const emit = defineEmits(['click'])

const points = computed(() => {
  // Ensure that markers don't exactly overlap.  Simplistic.
  const ret = []
  const latlngs = []

  if (props.map) {
    const bounds = props.map.getBounds()
    if (bounds) {
      const nelng = bounds.getNorthWest().lng
      const nelat = bounds.getNorthWest().lat

      if (props.markers) {
        props.markers.forEach((marker) => {
          if (marker.lat || marker.lng) {
            const key = marker.lat + '|' + marker.lng
            const already = latlngs[key] ? latlngs[key] : 0

            if (already) {
              marker.lat = Math.max(nelat, marker.lat + (already + 1) * 0.003)
              marker.lng = Math.max(nelng, marker.lng + (already + 1) * 0.003)
            }

            latlngs[key] = already + 1

            // Add a geoJSON point.
            ret.push({
              id: marker.id,
              type: 'Point',
              geometry: {
                coordinates: [marker.lng, marker.lat],
              },
            })
          }
        })
      }
    }
  }

  return ret
})

const index = computed(() => {
  // Generate the index.  It's immutable, so we need to generate a new index each time the points change.
  const idx = new Supercluster({
    radius: props.radius,
    extent: props.extent,
    maxZoom: props.maxZoom,
    minZoom: props.minZoom,
  })

  idx.load(points.value)

  return idx
})

const clusters = computed(() => {
  let clustersList = []

  try {
    if (props.map) {
      if (props.markers.length < props.minCluster) {
        // We've seen some cases where Supercluster excludes some markers from the cluster, so that the sum of
        // what we get back is less than the number we passed in.  That isn't obvious except for low numbers of
        // markers, i.e. high zoom levels.  It may be a bug, but we don't much care - for our purposes the
        // actual numbers don't have to be spot on.  Using a minimum means that we can avoid that becoming
        // obvious.
        clustersList = points.value
      } else {
        const bounds = props.map.getBounds()
        const zoom = Math.round(props.map.getZoom())
        let bbox = null

        try {
          if (bounds) {
            bbox = [
              bounds.getNorthWest().lng,
              bounds.getSouthEast().lat,
              bounds.getSouthEast().lng,
              bounds.getNorthWest().lat,
            ]

            clustersList = index.value.getClusters(bbox, zoom)
          }
        } catch (e) {
          console.log('Exception 1', e, bounds, zoom, index.value)
        }
      }
    }
  } catch (e) {
    console.log('Exception 2', e)
  }

  return clustersList
})

function clusterClick(cluster) {
  let zoom = index.value.getClusterExpansionZoom(cluster.properties.cluster_id)

  // Don't allow us to zoom in too far.
  zoom = Math.min(zoom, props.maxZoom)

  props.map.flyTo(
    [cluster.geometry.coordinates[1], cluster.geometry.coordinates[0]],
    zoom
  )

  emit('click')
}

function pointClick(cluster) {
  // It's a point. Centre on it, and zoom right in.
  props.map.flyTo(
    [cluster.geometry.coordinates[1], cluster.geometry.coordinates[0]],
    props.maxZoom
  )

  emit('click')
}
</script>
