<template>
  <Avatar :size="size" :name="name" :variant="variant" :colors="colors" />
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

// Generate a simple hash from a string for deterministic variant selection
function hashString(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

// Available variants - all styles for maximum variety
const variants = ['marble', 'sunset', 'ring', 'bauhaus', 'beam', 'pixel']

// Color palettes - expanded for more variety
const colorPalettes = [
  ['#2E7D32', '#4CAF50', '#81C784', '#A5D6A7', '#C8E6C9'], // Greens
  ['#1565C0', '#42A5F5', '#90CAF9', '#4DB6AC', '#80CBC4'], // Blue-teal
  ['#7B1FA2', '#BA68C8', '#E1BEE7', '#F48FB1', '#F8BBD9'], // Purple-pink
  ['#E65100', '#FF9800', '#FFB74D', '#FFCC80', '#FFE0B2'], // Orange-warm
  ['#00695C', '#26A69A', '#80CBC4', '#4DD0E1', '#80DEEA'], // Teal-cyan
  ['#5D4037', '#8D6E63', '#BCAAA4', '#A1887F', '#D7CCC8'], // Earth tones
  ['#C62828', '#EF5350', '#FFCDD2', '#FF8A65', '#FFAB91'], // Red-coral
  ['#AD1457', '#EC407A', '#F48FB1', '#CE93D8', '#E1BEE7'], // Pink-purple
  ['#1A237E', '#3949AB', '#7986CB', '#9FA8DA', '#C5CAE9'], // Indigo
  ['#004D40', '#00796B', '#4DB6AC', '#80CBC4', '#B2DFDB'], // Deep teal
  ['#F57F17', '#FBC02D', '#FFF176', '#FFEE58', '#FFF59D'], // Yellow-gold
  ['#3E2723', '#5D4037', '#8D6E63', '#A1887F', '#BCAAA4'], // Dark earth
]

const hash = computed(() => hashString(props.name || 'user'))

// Use different parts of the hash for variant vs colors for more combinations
const variant = computed(() => {
  return variants[hash.value % variants.length]
})

// Shift the hash for color selection to decouple from variant
const colors = computed(() => {
  const colorIndex =
    Math.floor(hash.value / variants.length) % colorPalettes.length
  return colorPalettes[colorIndex]
})
</script>
