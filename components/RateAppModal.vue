<template>
  <b-modal
    ref="modal"
    :title="''"
    hide-header
    hide-footer
    size="lg"
    no-stacking
    body-class="p-3 bg-transparent overflow-visible"
    content-class="bg-transparent border-0"
    @hidden="emit('hidden')"
  >
    <template #default>
      <RateAppAsk @hide="hide" />
    </template>
  </b-modal>
</template>
<script setup>
import { useOurModal } from '~/composables/useOurModal'
import RateAppAsk from '~/components/RateAppAsk.vue'

const emit = defineEmits(['hidden'])

const { modal, hide } = useOurModal()
</script>
