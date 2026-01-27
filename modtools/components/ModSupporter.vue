<template>
  <div
    :class="{
      hidden: hidden,
    }"
  >
    <b-badge
      variant="primary rounded supporter"
      :class="'ms-1 clickme ' + 'size-' + size"
      title="Kindly supports Freegle - click for more info?"
      @click="showModal"
    >
      <v-icon icon="trophy" />
      Supporter
    </b-badge>
    <SupporterInfoModal
      v-if="showSupporterInfoModal"
      ref="modal"
      @hidden="showSupporterInfoModal = false"
    />
  </div>
</template>
<script setup>
import { ref } from 'vue'

defineProps({
  size: {
    type: String,
    required: false,
    default: 'md',
  },
  hidden: {
    type: Boolean,
    required: false,
    default: false,
  },
})

const showSupporterInfoModal = ref(false)

function showModal(e) {
  e.preventDefault()
  e.stopPropagation()
  showSupporterInfoModal.value = true
}
</script>
<style scoped lang="scss">
//@import 'color-vars';

.supporter {
  color: white;
  background-color: $color-gold;
}

.size-lg {
  font-size: 1.25rem;
}

.hidden {
  opacity: 0.5;
}
</style>
