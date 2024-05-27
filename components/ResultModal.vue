<template>
  <b-modal ref="modal" scrollable :title="props.title">
    <template #default>
      <slot name="default">
        <!-- eslint-disable-next-line -->
        <div v-html="props.message" />
      </slot>
    </template>
    <template #footer>
      <b-button variant="white" @click="hide"> Close </b-button>
    </template>
  </b-modal>
</template>

<script setup>
import { useOurModal } from '~/composables/useOurModal'

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: false,
    default: '',
  },
})

const { modal, hide } = useOurModal()
</script>
