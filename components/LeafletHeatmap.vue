<template>
  <div style="display: none">
    <slot v-if="ready" />
  </div>
</template>
<script setup>
import { ref, onMounted, onBeforeUnmount, getCurrentInstance, watch, computed } from 'vue'
import simpleheat from 'simpleheat'

// Originally from: https://github.com/Platoniq/vue2-leaflet-heatmap and https://github.com/Leaflet/Leaflet.heat

const props = defineProps({
  latLngs: {
    type: Array,
    default: () => [],
    custom: false,
  },
  minOpacity: {
    type: Number,
    custom: true,
    default: 0.05,
  },
  maxOpacity: {
    type: Number,
    custom: true,
    default: 0.5,
  },
  maxZoom: {
    type: Number,
    custom: true,
    default: 19,
  },
  radius: {
    type: Number,
    custom: true,
    default: 25,
  },
  blur: {
    type: Number,
    custom: true,
    default: 15,
  },
  max: {
    type: Number,
    custom: true,
    default: 1.0,
  },
  visible: {
    type: Boolean,
    custom: true,
    default: true,
  },
  gradient: {
    type: Object,
    required: false,
    default: null,
  },
})

const ready = ref(false)
let mapObject = null
let parentContainer = null
const instance = getCurrentInstance()
const parentReady = ref(false)

function addLatLng(value) {
  mapObject.addLatLng(value)
}

function capitalizeFirstLetter(string) {
  if (!string || typeof string.charAt !== 'function') {
    return string
  }
  return string.charAt(0).toUpperCase() + string.slice(1)
}

function propsBinder(vueElement, leafletElement, propsData) {
  for (const key in propsData) {
    const setMethodName = 'set' + capitalizeFirstLetter(key)
    const deepValue =
      propsData[key].type === Object ||
      propsData[key].type === Array ||
      Array.isArray(propsData[key].type)

    if (propsData[key].custom && vueElement[setMethodName]) {
      watch(
        () => props[key],
        (newVal, oldVal) => {
          vueElement[setMethodName](newVal, oldVal)
        },
        {
          deep: deepValue,
        }
      )
    } else if (setMethodName === 'setOptions') {
      watch(
        () => props[key],
        (newVal, oldVal) => {
          window.L.setOptions(leafletElement, newVal)
        },
        {
          deep: deepValue,
        }
      )
    } else if (leafletElement[setMethodName]) {
      watch(
        () => props[key],
        (newVal, oldVal) => {
          leafletElement[setMethodName](newVal)
        },
        {
          deep: deepValue,
        }
      )
    }
  }
}

function findRealParent(firstVueParent) {
  let found = false
  while (firstVueParent && !found) {
    if (firstVueParent.leafletObject === undefined) {
      firstVueParent = firstVueParent.parent
    } else {
      found = true
    }
  }
  return firstVueParent
}

function extendLeafletWithHeatLayer() {
  window.L.HeatLayer = (
    window.L.Layer ? window.L.Layer : window.L.Class
  ).extend({
    // options: {
    //     minOpacity: 0.05,
    //     maxZoom: 18,
    //     radius: 25,
    //     blur: 15,
    //     max: 1.0
    // },

    initialize: function (latlngs, options) {
      this._latlngs = latlngs
      window.L.setOptions(this, options)
    },

    setLatLngs: function (latlngs) {
      this._latlngs = latlngs
      return this.redraw()
    },

    addLatLng: function (latlng) {
      this._latlngs.push(latlng)
      return this.redraw()
    },

    setOptions: function (options) {
      window.L.setOptions(this, options)
      if (this._heat) {
        this._updateOptions()
      }
      return this.redraw()
    },

    redraw: function () {
      if (this._heat && !this._frame && this._map && !this._map._animating) {
        this._frame = window.L.Util.requestAnimFrame(this._redraw, this)
      }
      return this
    },

    onAdd: function (map) {
      this._map = map

      if (!this._canvas) {
        this._initCanvas()
      }

      if (this.options.pane) {
        this.getPane().appendChild(this._canvas)
      } else {
        map._panes.overlayPane.appendChild(this._canvas)
      }

      map.on('moveend', this._reset, this)

      if (map.options.zoomAnimation && window.L.Browser.any3d) {
        map.on('zoomanim', this._animateZoom, this)
      }

      this._reset()
    },

    onRemove: function (map) {
      if (this.options.pane) {
        this.getPane().removeChild(this._canvas)
      } else {
        map.getPanes().overlayPane.removeChild(this._canvas)
      }

      map.off('moveend', this._reset, this)

      if (map.options.zoomAnimation) {
        map.off('zoomanim', this._animateZoom, this)
      }
    },

    addTo: function (map) {
      map.addLayer(this)
      return this
    },

    _initCanvas: function () {
      const canvas = (this._canvas = window.L.DomUtil.create(
        'canvas',
        'leaflet-heatmap-layer leaflet-layer'
      ))

      const originProp = window.L.DomUtil.testProp([
        'transformOrigin',
        'WebkitTransformOrigin',
        'msTransformOrigin',
      ])
      canvas.style[originProp] = '50% 50%'

      const size = this._map.getSize()
      canvas.width = size.x
      canvas.height = size.y

      const animated = this._map.options.zoomAnimation && window.L.Browser.any3d
      window.L.DomUtil.addClass(
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
      window.L.DomUtil.setPosition(this._canvas, topLeft)

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
      const bounds = new window.L.Bounds(
        window.L.point([-r, -r]),
        size.add([r, r])
      )

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

      // console.time('process');
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
            cell[0] = (cell[0] * cell[2] + p.x * k) / (cell[2] + k) // x
            cell[1] = (cell[1] * cell[2] + p.y * k) / (cell[2] + k) // y
            cell[2] += k // cumulated intensity value
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
      // console.timeEnd('process');

      // console.time('draw ' + data.length);
      this._heat.data(data).draw(this.options.minOpacity)
      // console.timeEnd('draw ' + data.length);

      this._frame = null
    },

    _animateZoom: function (e) {
      const scale = this._map.getZoomScale(e.zoom)
      const offset = this._map
        ._getCenterOffset(e.center)
        ._multiplyBy(-scale)
        .subtract(this._map._getMapPanePos())

      if (window.L.DomUtil.setTransform) {
        window.L.DomUtil.setTransform(this._canvas, offset, scale)
      } else {
        this._canvas.style[window.L.DomUtil.TRANSFORM] =
          window.L.DomUtil.getTranslateString(offset) + ' scale(' + scale + ')'
      }
    },
  })

  window.LheatLayer = function (latlngs, options) {
    return new window.LHeatLayer(latlngs, options)
  }
}

const parentLeafletObject = computed(() => {
  if (!instance?.parent) return null
  const realParent = findRealParent(instance.parent)
  return realParent?.leafletObject || null
})

watch(parentLeafletObject, (leafletObject) => {
  if (leafletObject && mapObject && !parentContainer) {
    parentContainer = leafletObject
    parentContainer.addLayer(mapObject, !props.visible)
    parentReady.value = true
  }
}, { immediate: true })

onMounted(() => {
  if (!window.L.HeatLayer) {
    extendLeafletWithHeatLayer()
  }

  const options = {}
  if (props.minOpacity) {
    options.minOpacity = props.minOpacity
  }
  if (props.maxZoom) {
    options.maxZoom = props.maxZoom
  }
  if (props.radius) {
    options.radius = props.radius
  }
  if (props.blur) {
    options.blur = props.blur
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
})

onBeforeUnmount(() => {
  if (parentContainer && mapObject) {
    parentContainer.removeLayer(mapObject)
  }
})

// Expose methods to parent components
defineExpose({
  addLatLng,
})
</script>
