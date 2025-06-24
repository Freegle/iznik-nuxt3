<template>
  <div class="vue-thermometer" :class="customClass">
    <svg xmlns="http://www.w3.org/2000/svg" :width="width" :height="height">
      <g>
        <g id="11">
          <!-- ticks/lines -->
          <path
            v-for="(tick, index) in ticks"
            v-show="defaultOptions.thermo.ticksEnabled"
            :id="'12' + index"
            :key="index"
            :stroke="defaultOptions.thermo.tickColor"
            :stroke-width="defaultOptions.thermo.tickWidth"
            :stroke-miterlimit="defaultOptions.thermo.tickWidth"
            :d="offsetLine(index)"
          />
        </g>
        <!-- Frame round thermo black/white-->
        <circle
          :cx="roundDotPositionX"
          :cy="glassHeight"
          :r="glassWidth * 0.9 + 2"
          :stroke="defaultOptions.thermo.frameColor"
          stroke-width="4"
          :fill="defaultOptions.thermo.color"
        />
        <rect
          id="14"
          :fill="defaultOptions.thermo.frameColor"
          fill-rule="nonzero"
          stroke-width="4"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-miterlimit="4"
          stroke-dashoffset="0"
          ry="16"
          rx="16"
          :y="glassOffset - 2"
          :x="baseXOffset - 2"
          :height="glassHeight + 4"
          :width="glassWidth + 4"
        />
        <rect
          id="15"
          :fill="defaultOptions.thermo.backgroundColor"
          fill-rule="nonzero"
          stroke-width="4"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-miterlimit="4"
          stroke-dashoffset="0"
          ry="16"
          rx="16"
          :y="glassOffset"
          :x="baseXOffset"
          :height="glassHeight"
          :width="glassWidth"
        />

        <!-- this is the round buttom thing center of it (red) -->
        <circle
          :cx="roundDotPositionX"
          :cy="glassHeight"
          :r="glassWidth * 0.9"
          :stroke="defaultOptions.thermo.backgroundColor"
          stroke-width="4"
          :fill="defaultOptions.thermo.color"
        />

        <!-- this is the bar/temp height -->
        <rect
          id="svg_18"
          :fill="defaultOptions.thermo.color"
          stroke="#000000"
          stroke-width="0"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-miterlimit="4"
          stroke-dashoffset="0"
          ry="8"
          rx="8"
          :x="baseXOffset + 3"
          :y="thermoOffset"
          :width="thermoWidth"
          :height="thermoHeight"
        />
        <!-- this is the temp values -->
        <text
          v-for="(tick, index) in ticks"
          v-show="defaultOptions.text.textEnabled"
          :id="'svg_19' + index"
          :key="index"
          :fill="defaultOptions.text.color"
          :stroke="defaultOptions.text.color"
          stroke-width="0"
          :x="textSpacing"
          :y="offsetText(index)"
          :font-size="defaultOptions.text.fontSize"
          :font-family="defaultOptions.text.fontFamily"
          text-anchor="middle"
          xml:space="preserve"
        >
          {{ scale }}{{ tick }}
        </text>
      </g>
    </svg>
  </div>
</template>

<script setup>
// From https://github.com/larsmars/vuejs-thermometer, tweaked to work with Vue3.
import { ref, computed, watch, onMounted } from 'vue'

const _textOffset = 0.75

const props = defineProps({
  value: {
    type: Number,
    default: 0,
    required: false,
  },
  min: {
    type: Number,
    default: -20,
    required: false,
  },
  max: {
    type: Number,
    default: 25,
    required: false,
  },
  scale: {
    type: String,
    default: '°C',
    required: false,
  },
  options: {
    type: Object,
    required: false,
    default: null,
  },
  customClass: {
    type: String,
    required: false,
    default: null,
  },
})

const defaultOptions = ref({
  text: {
    color: 'black',
    fontSize: 10,
    textAdjustmentY: 2,
    fontFamily: 'Arial',
    textEnabled: true,
  },
  thermo: {
    color: '#FF0000',
    backgroundColor: '#fcf9f9',
    frameColor: 'black',
    ticks: 10,
    ticksEnabled: true,
    tickColor: 'black',
    tickWidth: '1',
  },
  layout: {
    height: 300,
    width: 90,
  },
})

const baseXOffset = computed(() => {
  return defaultOptions.value.layout.width / 5
})

const width = computed(() => {
  return defaultOptions.value.layout.width
})

const height = computed(() => {
  return defaultOptions.value.layout.height
})

const textSpacing = computed(() => {
  return width.value * _textOffset
})

const tickStep = computed(() => {
  return (
    Math.abs(props.max - props.min) / (defaultOptions.value.thermo.ticks - 1)
  )
})

const ticks = computed(() => {
  const ticksArray = []
  let maxValue = props.max
  for (let i = 0; i < defaultOptions.value.thermo.ticks - 1; i++) {
    ticksArray.push(Math.round(maxValue))
    maxValue -= tickStep.value
  }
  ticksArray.push(props.min)
  return ticksArray
})

const thermoWidth = computed(() => {
  return defaultOptions.value.layout.width / 6
})

const glassWidth = computed(() => {
  return defaultOptions.value.layout.width / 6 + 6
})

const tickWidth = computed(() => {
  return Math.ceil(defaultOptions.value.layout.width / 12)
})

const glassOffset = computed(() => {
  return defaultOptions.value.layout.height * 0.02
})

const glassHeight = computed(() => {
  let heightValue = defaultOptions.value.layout.height * 0.95
  while (defaultOptions.value.layout.height - heightValue < 30) {
    heightValue -= 1
  }
  return heightValue
})

const tickStepSize = computed(() => {
  return glassHeight.value / defaultOptions.value.thermo.ticks
})

const level = computed(() => {
  return Math.ceil(((props.value - props.min) * 100) / (props.max - props.min))
})

const thermoHeight = computed(() => {
  return (
    level.value * (glassHeight.value / 100) +
    ((100 - level.value) / 100) * glassHeight.value * 0.075
  )
})

const thermoOffset = computed(() => {
  const offset = Math.ceil(glassHeight.value - thermoHeight.value)
  return glassOffset.value + offset
})

const roundDotPositionX = computed(() => {
  return baseXOffset.value + glassWidth.value * 0.5
})

function mergeDefaultOptionsWithProp(options) {
  const result = defaultOptions.value
  for (const option in options) {
    if (options[option] !== null && typeof options[option] === 'object') {
      for (const subOption in options[option]) {
        if (
          options[option][subOption] !== undefined &&
          options[option][subOption] !== null
        ) {
          result[option][subOption] = options[option][subOption]
        }
      }
    } else {
      result[option] = options[option]
    }
  }
}

function offsetText(index) {
  const base =
    tickStepSize.value / defaultOptions.value.thermo.ticks +
    glassOffset.value +
    defaultOptions.value.text.textAdjustmentY
  const offset = index * tickStepSize.value
  return Number(offset) + Number(base)
}

function offsetLine(index) {
  const base =
    tickStepSize.value / defaultOptions.value.thermo.ticks + glassOffset.value
  let offsetY = index * tickStepSize.value
  const length =
    index % 2 === 0
      ? 'l' + Math.ceil(tickWidth.value * 1.4)
      : 'l' + Math.ceil(tickWidth.value + tickWidth.value)
  offsetY = Number(offsetY) + Number(base) + length
  const offsetX =
    'm' + Number(defaultOptions.value.layout.width * 0.4) + '.121861,'
  return offsetX + offsetY + '.121853,0'
}

watch(
  () => props.options,
  (val) => {
    if (val !== null && val !== undefined) {
      mergeDefaultOptionsWithProp(val)
    }
  }
)

onMounted(() => {
  if (props.options !== null && props.options !== undefined) {
    mergeDefaultOptionsWithProp(props.options)
  }
})
</script>

<style lang="scss" scoped>
.vue-thermometer {
  display: flex;
}
</style>
