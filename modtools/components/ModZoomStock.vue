<template>
  <div class="font-weight-bold">
    <!-- DONE -->
    <div v-if="now" class="d-flex">
      <!-- eslint-disable-next-line-->
      <ExternalLink href="https://zoom.us/j/95789187203?pwd=VE9Va1M5YWJWY0M1dC9sc014L0xjQT09" class="text-warning">ZoomStock happening now till 5pm!
        Join other volunteers for a natter - click here.</ExternalLink>
    </div>
    <div v-else-if="today" class="d-flex">
      <!-- eslint-disable-next-line-->
      <ExternalLink href="https://zoom.us/j/95789187203?pwd=VE9Va1M5YWJWY0M1dC9sc014L0xjQT09" :class="colorClass">ZoomStock Thursdays - join other
        volunteers for a natter. Link will be here 2pm-5pm.</ExternalLink>
    </div>
    <div v-else class="d-flex">
      ZoomStock Thursdays @ 2pm-5pm, next {{ timeago(fromNow) }}. Join other
      volunteers for a natter. Link will be here.
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import dayjs from 'dayjs'
import { useMiscStore } from '~/stores/misc'

const DAY_OF_WEEK = 4
const START = '1400'
const STARTHOUR = 13
const END = '1700'

defineProps({
  colorClass: {
    type: String,
    required: false,
    default: 'text-white',
  },
})

const miscStore = useMiscStore()

const nextOne = ref(null)

const timeNow = computed(() => {
  return miscStore.time ? dayjs().format('HHmm') : ''
})

const fromNow = computed(() => {
  return miscStore.time && nextOne.value ? nextOne.value : null
})

const today = computed(() => {
  const d = dayjs()
  return d.day() === DAY_OF_WEEK && timeNow.value < START
})

const now = computed(() => {
  return (
    dayjs().day() === DAY_OF_WEEK &&
    timeNow.value >= START &&
    timeNow.value <= END
  )
})

onMounted(() => {
  let d = dayjs().hour(STARTHOUR).minute(0).second(0)

  if (d.day() < DAY_OF_WEEK) {
    d = d.day(DAY_OF_WEEK)
  } else {
    d = d.add(1, 'week').day(DAY_OF_WEEK)
  }
  nextOne.value = d
})
</script>
