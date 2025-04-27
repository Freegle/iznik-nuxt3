<template>
  <b-img
    v-if="showImage"
    lazy
    thumbnail
    class="sponsorClass m-0"
    :alt="altText"
    :src="image"
    @error="brokenSponsorImage"
  />
</template>

<script setup>
// This component should be imported, rather than using async require.  This is because async requires result in more
// Vue DOM patching overall, and this component is used in places like chat where it appears many times.  Testing shows
// this has a significant performance benefit.
import { ref } from 'vue'

const props = defineProps({
  image: {
    type: String,
    required: false,
    default: '',
  },
  altText: {
    type: String,
    required: false,
    default: 'Sponsor logo',
  },
})

const showImage = ref(true)

function brokenSponsorImage(event) {
  console.log('Broken', props.image)
  showImage.value = false
}
</script>

<style scoped lang="scss">
.sponsorClass {
  width: 100px;
  height: 100px;
  object-fit: cover;
}
</style>
