<template>
  <Avatar
    v-if="!isCustomVariant"
    :size="size"
    :name="name"
    :variant="variant"
    :colors="colors"
  />
  <svg v-else :width="size" :height="size" viewBox="0 0 100 100">
    <template v-if="variant === 'spots'">
      <rect width="100" height="100" :fill="colors[0]" />
      <circle
        v-for="(spot, i) in spots"
        :key="i"
        :cx="spot.x"
        :cy="spot.y"
        :r="spot.r"
        :fill="colors[(i % 4) + 1]"
      />
    </template>
    <template v-else-if="variant === 'tiles'">
      <rect width="100" height="100" :fill="colors[0]" />
      <rect
        v-for="(tile, i) in tiles"
        :key="i"
        :x="tile.x"
        :y="tile.y"
        :width="tile.w"
        :height="tile.h"
        :fill="colors[(i % 4) + 1]"
      />
    </template>
  </svg>
</template>
<script setup>
import Avatar from 'vue-boring-avatars'
import { computed } from '#imports'

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    default: 56,
  },
})

function hashString(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

const boringVariants = ['pixel', 'beam', 'bauhaus', 'ring']
const customVariants = ['spots', 'tiles']
const allVariants = [...boringVariants, ...customVariants]

const colorPalettes = [
  ['#2E7D32', '#4CAF50', '#81C784', '#A5D6A7', '#C8E6C9'],
  ['#1565C0', '#42A5F5', '#90CAF9', '#4DB6AC', '#80CBC4'],
  ['#7B1FA2', '#BA68C8', '#E1BEE7', '#F48FB1', '#F8BBD9'],
  ['#E65100', '#FF9800', '#FFB74D', '#FFCC80', '#FFE0B2'],
  ['#00695C', '#26A69A', '#80CBC4', '#4DD0E1', '#80DEEA'],
  ['#5D4037', '#8D6E63', '#BCAAA4', '#A1887F', '#D7CCC8'],
  ['#C62828', '#EF5350', '#FFCDD2', '#FF8A65', '#FFAB91'],
  ['#AD1457', '#EC407A', '#F48FB1', '#CE93D8', '#E1BEE7'],
  ['#1A237E', '#3949AB', '#7986CB', '#9FA8DA', '#C5CAE9'],
  ['#004D40', '#00796B', '#4DB6AC', '#80CBC4', '#B2DFDB'],
]

const hash = computed(() => hashString(props.name || 'user'))

const variant = computed(() => {
  return allVariants[hash.value % allVariants.length]
})

const isCustomVariant = computed(() => {
  return customVariants.includes(variant.value)
})

const colors = computed(() => {
  const colorIndex =
    Math.floor(hash.value / allVariants.length) % colorPalettes.length
  return colorPalettes[colorIndex]
})

const spots = computed(() => {
  const h = hash.value
  return [
    { x: 25 + (h % 15), y: 25 + ((h >> 2) % 15), r: 20 + (h % 10) },
    {
      x: 70 + ((h >> 3) % 15),
      y: 30 + ((h >> 5) % 15),
      r: 18 + ((h >> 4) % 12),
    },
    {
      x: 30 + ((h >> 6) % 20),
      y: 70 + ((h >> 7) % 15),
      r: 22 + ((h >> 8) % 10),
    },
    {
      x: 75 + ((h >> 9) % 15),
      y: 72 + ((h >> 10) % 15),
      r: 16 + ((h >> 11) % 10),
    },
    {
      x: 50 + ((h >> 12) % 20) - 10,
      y: 50 + ((h >> 13) % 20) - 10,
      r: 15 + ((h >> 14) % 8),
    },
  ]
})

const tiles = computed(() => {
  const h = hash.value
  return [
    { x: 0, y: 0, w: 45 + (h % 15), h: 45 + ((h >> 2) % 15) },
    {
      x: 50 + ((h >> 3) % 10),
      y: 5,
      w: 40 + ((h >> 4) % 15),
      h: 35 + ((h >> 5) % 15),
    },
    {
      x: 5,
      y: 55 + ((h >> 6) % 10),
      w: 35 + ((h >> 7) % 15),
      h: 38 + ((h >> 8) % 12),
    },
    { x: 45 + ((h >> 9) % 10), y: 45 + ((h >> 10) % 10), w: 50, h: 50 },
  ]
})
</script>
