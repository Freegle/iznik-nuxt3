<template>
  <div class="d-inline">
    <b-button :variant="variant(stdmsg)" class="mb-1 mr-2" @click="click">
      <v-icon :icon="icon(stdmsg)" /> {{ stdmsg.title }}
    </b-button>
    <ModSettingsStandardMessageModal
      v-if="showModal"
      :id="stdmsg.id"
      ref="stdMsgModal"
      @hidden="showModal = false"
    />
  </div>
</template>
<script setup>
import { ref } from 'vue'

defineProps({
  stdmsg: {
    type: Object,
    required: true,
  },
})

const showModal = ref(false)
const stdMsgModal = ref(null)

function click() {
  showModal.value = true
  stdMsgModal.value?.show()
}
</script>
