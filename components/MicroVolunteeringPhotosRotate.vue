<template>
  <div>
    <h2 class="text-center header--size4">
      Click any photos that need rotating
    </h2>
    <div class="d-flex justify-content-around">
      <div class="layout">
        <MicroVolunteeringPhotoRotate
          v-for="photo in currentPhotos"
          :key="'photo-' + photo.id"
          :photo="photo"
          class="m-1"
          @rotate="rotate(photo, $event)"
        />
      </div>
    </div>
    <div class="d-flex justify-content-around mt-2">
      <SpinButton
        icon-name="save"
        variant="primary"
        size="lg"
        label="All photos look good"
        @handle="done"
      />
    </div>
  </div>
</template>
<script setup>
import { ref, onBeforeMount } from 'vue'
import MicroVolunteeringPhotoRotate from './MicroVolunteeringPhotoRotate'
import SpinButton from './SpinButton'
import { useMicroVolunteeringStore } from '~/stores/microvolunteering'

const props = defineProps({
  photos: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['done'])

const microVolunteeringStore = useMicroVolunteeringStore()
const currentPhotos = ref([])
const bump = ref(1)

onBeforeMount(() => {
  // Create a deep copy of the photos array to avoid mutation issues
  currentPhotos.value = JSON.parse(JSON.stringify(props.photos))

  currentPhotos.value.forEach((p) => {
    p.rotate = 0
  })
})

function rotate(photo, rotate) {
  currentPhotos.value.forEach((p, i) => {
    if (p.id === photo.id) {
      currentPhotos.value[i].rotate = rotate
    }
  })

  bump.value++
}

async function done(callback) {
  const promises = []
  for (const p of currentPhotos.value) {
    promises.push(
      microVolunteeringStore.respond({
        photoid: p.id,
        response: p.rotate === 0 ? 'Approve' : 'Reject',
        deg: p.rotate,
      })
    )
  }

  await Promise.all(promises)
  callback()

  emit('done')
}
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';

.layout {
  display: grid;
  grid-template-columns: repeat(3, 90px);
  grid-template-rows: repeat(3, 90px);

  @include media-breakpoint-up(sm) {
    grid-template-columns: repeat(3, 140px);
    grid-template-rows: repeat(3, 140px);
  }

  @include media-breakpoint-up(lg) {
    grid-template-columns: repeat(3, 170px);
    grid-template-rows: repeat(3, 170px);
  }
}
</style>
