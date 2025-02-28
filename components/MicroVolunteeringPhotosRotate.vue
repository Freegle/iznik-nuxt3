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
<script>
import { useMicroVolunteeringStore } from '../stores/microvolunteering'
import MicroVolunteeringPhotoRotate from './MicroVolunteeringPhotoRotate'
import SpinButton from './SpinButton'

export default {
  components: { SpinButton, MicroVolunteeringPhotoRotate },
  props: {
    photos: {
      type: Array,
      required: true,
    },
  },
  setup() {
    const microVolunteeringStore = useMicroVolunteeringStore()

    return {
      microVolunteeringStore,
    }
  },
  data() {
    return {
      currentPhotos: [],
      bump: 1,
    }
  },
  created() {
    this.currentPhotos = this.photos

    this.currentPhotos.forEach((p) => {
      p.rotate = 0
    })
  },
  methods: {
    rotate(photo, rotate) {
      this.currentPhotos.forEach((p, i) => {
        if (p.id === photo.id) {
          this.currentPhotos[i].rotate = rotate
        }
      })

      this.bump++
    },
    async done(callback) {
      const promises = []
      for (const p of this.currentPhotos) {
        promises.push(
          this.microVolunteeringStore.respond({
            photoid: p.id,
            response: p.rotate === 0 ? 'Approve' : 'Reject',
            deg: p.rotate,
          })
        )
      }

      await Promise.all(promises)
      callback()

      this.$emit('done')
    },
  },
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
