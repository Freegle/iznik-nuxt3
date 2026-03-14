<template>
  <div v-if="shortlink">
    <!-- eslint-disable-next-line -->
    <a :href="'https://freegle.in/' + shortlink.name" rel="noopener noreferrer">freegle.in/{{ shortlink.name }}</a>
    <span class="text-muted small">
      created {{ timeago(shortlink.created) }}
      {{ pluralise('click', shortlink.clicks, true) }}
    </span>
  </div>
</template>
<script setup>
import { useShortlinkStore } from '~/stores/shortlinks'

const props = defineProps({
  shortlinkid: {
    type: Number,
    required: true,
  },
})

const shortlinkStore = useShortlinkStore()
const shortlink = computed(() => shortlinkStore.byId(props.shortlinkid))
</script>
