<template>
  <div class="d-inline">
    <b-button
      v-if="stdmsg"
      :variant="variant(stdmsg)"
      class="mb-1 mr-2"
      @click="click"
    >
      <v-icon :icon="icon(stdmsg)" /> {{ stdmsg.title }}
    </b-button>
    <ModSettingsStandardMessageModal
      v-if="showModal"
      :id="stdmsgid"
      ref="stdMsgModal"
      @hidden="showModal = false"
    />
  </div>
</template>
<script setup>
import { ref, computed } from 'vue'
import { useStdmsgStore } from '~/stores/stdmsg'

const props = defineProps({
  stdmsgid: {
    type: Number,
    required: true,
  },
})

const stdmsgStore = useStdmsgStore()

const stdmsg = computed(() => {
  return stdmsgStore.byId(props.stdmsgid)
})

const showModal = ref(false)
const stdMsgModal = ref(null)

function click() {
  showModal.value = true
  stdMsgModal.value?.show()
}
</script>
