<template>
  <div style="display: none"></div>
</template>
<script setup>
import {
  ref,
  onMounted,
  onBeforeUnmount,
  getCurrentInstance,
  watch,
  computed,
} from 'vue'
import simpleheat from 'simpleheat'

const props = defineProps({
  latLngs: {
    type: Array,
    default: () => [],
  },
  minOpacity: {
    type: Number,
    default: 0.05,
  },
  maxOpacity: {
    type: Number,
    default: 0.5,
  },
  maxZoom: {
    type: Number,
    default: 19,
  },
  radius: {
    type: Number,
    default: 25,
  },
  blur: {
    type: Number,
    default: 15,
  },
  max: {
    type: Number,
    default: 1.0,
  },
  gradient: {
    type: Object,
    required: false,
    default: null,
  },
})

let heatLayer = null
let L = null
let mapInstance = null
let mapObject = null
let parentContainer = null
const options = null
const propsBinder = null

const instance = getCurrentInstance()
const parentReady = ref(false)
const ready = ref(false)

defineExpose({
  addLatLng: (latlng) => {
    if (heatLayer) {
      heatLayer.addLatLng(latlng)
    }
  },
})

if (process.client) {
  L = await import('leaflet/dist/leaflet-src.esm')
}

function findRealParent(firstVueParent) {
  let found = false
  let depth = 0

  while (firstVueParent && !found && depth < 10) {
    if (firstVueParent.setupState?.leafletObject === undefined) {
      firstVueParent = firstVueParent.parent
      depth++
    } else {
      found = true
    }
  }

  return firstVueParent
}

function createHeatLayer() {
  if (!L) return

  const HeatLayer = L.Layer.extend({
    initialize: function (latlngs, options) {
      this._latlngs = latlngs || []
      L.setOptions(this, options)
    },

    setLatLngs: function (latlngs) {
      this._latlngs = latlngs
      return this.redraw()
    },

    addLatLng: function (latlng) {
      this._latlngs.push(latlng)
      return this.redraw()
    },

    redraw: function () {
      if (this._heat && !this._frame && this._map && !this._map._animating) {
        this._frame = L.Util.requestAnimFrame(this._redraw, this)
      }
      return this
    },

    onAdd: function (map) {
      this._map = map

      if (!this._canvas) {
        this._initCanvas()
      }

      map._panes.overlayPane.appendChild(this._canvas)
      map.on('moveend', this._reset, this)

      if (map.options.zoomAnimation && L.Browser.any3d) {
        map.on('zoomanim', this._animateZoom, this)
      }

      this._reset()
    },

    onRemove: function (map) {
      map.getPanes().overlayPane.removeChild(this._canvas)
      map.off('moveend', this._reset, this)

      if (map.options.zoomAnimation) {
        map.off('zoomanim', this._animateZoom, this)
      }
    },

    _initCanvas: function () {
      const canvas = (this._canvas = L.DomUtil.create(
        'canvas',
        'leaflet-heatmap-layer leaflet-layer'
      ))

      const originProp = L.DomUtil.testProp([
        'transformOrigin',
        'WebkitTransformOrigin',
        'msTransformOrigin',
      ])
      canvas.style[originProp] = '50% 50%'

      const size = this._map.getSize()
      canvas.width = size.x
      canvas.height = size.y

      const animated = this._map.options.zoomAnimation && L.Browser.any3d
      L.DomUtil.addClass(
        canvas,
        'leaflet-zoom-' + (animated ? 'animated' : 'hide')
      )

      this._heat = simpleheat(canvas)
      this._updateOptions()
    },

    _updateOptions: function () {
      this._heat.radius(
        this.options.radius || this._heat.defaultRadius,
        this.options.blur
      )

      if (this.options.gradient) {
        this._heat.gradient(this.options.gradient)
      }
      if (this.options.max) {
        this._heat.max(this.options.max)
      }
    },

    _reset: function () {
      const topLeft = this._map.containerPointToLayerPoint([0, 0])
      L.DomUtil.setPosition(this._canvas, topLeft)

      const size = this._map.getSize()

      if (this._heat._width !== size.x) {
        this._canvas.width = this._heat._width = size.x
      }
      if (this._heat._height !== size.y) {
        this._canvas.height = this._heat._height = size.y
      }

      this._redraw()
    },

    _redraw: function () {
      if (!this._map) {
        return
      }

      const data = []
      const r = this._heat._r
      const size = this._map.getSize()
      const bounds = new L.Bounds(L.point([-r, -r]), size.add([r, r]))

      const max = this.options.max === undefined ? 1 : this.options.max
      const maxZoom =
        this.options.maxZoom === undefined
          ? this._map.getMaxZoom()
          : this.options.maxZoom
      const v =
        1 /
        Math.pow(2, Math.max(0, Math.min(maxZoom - this._map.getZoom(), 12)))
      const cellSize = r / 2
      const grid = []
      const panePos = this._map._getMapPanePos()
      const offsetX = panePos.x % cellSize
      const offsetY = panePos.y % cellSize
      let i
      let len
      let p
      let cell
      let x
      let y
      let j
      let len2
      let k

      for (i = 0, len = this._latlngs.length; i < len; i++) {
        p = this._map.latLngToContainerPoint(this._latlngs[i])
        if (bounds.contains(p)) {
          x = Math.floor((p.x - offsetX) / cellSize) + 2
          y = Math.floor((p.y - offsetY) / cellSize) + 2

          const alt =
            this._latlngs[i].alt !== undefined
              ? this._latlngs[i].alt
              : this._latlngs[i][2] !== undefined
              ? +this._latlngs[i][2]
              : 1
          k = alt * v

          grid[y] = grid[y] || []
          cell = grid[y][x]

          if (!cell) {
            grid[y][x] = [p.x, p.y, k]
          } else {
            cell[0] = (cell[0] * cell[2] + p.x * k) / (cell[2] + k)
            cell[1] = (cell[1] * cell[2] + p.y * k) / (cell[2] + k)
            cell[2] += k
          }
        }
      }

      for (i = 0, len = grid.length; i < len; i++) {
        if (grid[i]) {
          for (j = 0, len2 = grid[i].length; j < len2; j++) {
            cell = grid[i][j]
            if (cell) {
              data.push([
                Math.round(cell[0]),
                Math.round(cell[1]),
                Math.min(cell[2], max),
              ])
            }
          }
        }
      }

      this._heat.data(data).draw(this.options.minOpacity)
      this._frame = null
    },

    _animateZoom: function (e) {
      const scale = this._map.getZoomScale(e.zoom)
      const offset = this._map
        ._getCenterOffset(e.center)
        ._multiplyBy(-scale)
        .subtract(this._map._getMapPanePos())

      if (L.DomUtil.setTransform) {
        L.DomUtil.setTransform(this._canvas, offset, scale)
      } else {
        this._canvas.style[L.DomUtil.TRANSFORM] =
          L.DomUtil.getTranslateString(offset) + ' scale(' + scale + ')'
      }
    },
  })

  return HeatLayer
}

watch(
  () => props.latLngs,
  (newLatLngs) => {
    if (heatLayer && heatLayer.setLatLngs) {
      heatLayer.setLatLngs(newLatLngs)
    }
  },
  { deep: true }
)

const parentLeafletObject = computed(() => {
  if (!instance?.parent) return null
  const realParent = findRealParent(instance.parent)
  return realParent?.leafletObject || null
})

watch(
  parentLeafletObject,
  (leafletObject) => {
    if (leafletObject && mapObject && !parentContainer) {
      parentContainer = leafletObject
      parentContainer.addLayer(mapObject, !props.visible)
      parentReady.value = true
    }
  },
  { immediate: true }
)

onMounted(() => {
  setTimeout(() => {
    if (instance && instance.parent) {
      const realParent = findRealParent(instance.parent)

      if (realParent && realParent.setupState?.leafletObject) {
        mapInstance = realParent.setupState.leafletObject
      }
    }

    if (L && mapInstance) {
      const HeatLayerClass = createHeatLayer()

      const options = {
        minOpacity: props.minOpacity,
        maxOpacity: props.maxOpacity,
        maxZoom: props.maxZoom,
        radius: props.radius,
        blur: props.blur,
        max: props.max,
        gradient: props.gradient,
      }

      heatLayer = new HeatLayerClass(props.latLngs, options)
      mapInstance.addLayer(heatLayer)
    }

    if (props.max) {
      options.max = props.max
    }
    if (props.gradient) {
      options.gradient = props.gradient
    }

    mapObject = new window.L.HeatLayer(props.latLngs, options)
    propsBinder(instance.proxy, mapObject, props)
    ready.value = true
  }, 100)
})

onBeforeUnmount(() => {
  if (mapInstance && heatLayer) {
    mapInstance.removeLayer(heatLayer)
  }
})
</script>
