<template>
  <b-modal
    ref="modal"
    scrollable
    title="Please check your mailbox"
    no-stacking
    size="lg"
  >
    <p>We've sent you a verification mail.</p>
    <p>Don't forget to check your spam folder!</p>
    <template #footer>
      <b-button variant="primary" @click="hide">Close</b-button>
    </template>
  </b-modal>
</template>

<script setup>
import { useModal } from '~/composables/useModal'

const { modal, hide } = useModal()
</script>
