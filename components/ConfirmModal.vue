<template>
  <b-modal ref="modal" scrollable :title="props.title">
    <template #default>
      <slot name="default">
        <!-- eslint-disable-next-line -->
        <div v-html="props.message" />
      </slot>
    </template>
    <template #footer>
      <b-button variant="white" @click="hide"> Cancel </b-button>
      <b-button variant="primary" @click="confirm"> Confirm </b-button>
    </template>
  </b-modal>
</template>

<script setup>
import { useModal } from '~/composables/useModal'

const props = defineProps({
  title: {
    type: String,
    required: false,
    default: 'Are you sure?',
  },
  message: {
    type: String,
    required: false,
    default: '<p>Are you sure you want to do this?</p>',
  },
})

const emit = defineEmits(['confirm'])

const { modal, hide } = useModal()

function confirm() {
  emit('confirm')
  hide()
}
</script>
