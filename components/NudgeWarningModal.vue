<template>
  <b-modal
    id="nudgewarningmodal"
    ref="modal"
    scrollable
    title="Nudging"
    no-stacking
  >
    <template #default>
      <p>
        Nudging is a gentle way to let the other person know that you're waiting
        for a reply.
      </p>
      <p>
        Before you use it, please remember that not everyone is online all the
        time. Some people are only able to check their messages every day or
        two.
      </p>
    </template>
    <template #footer>
      <b-button variant="white" @click="hide"> Cancel </b-button>
      <b-button variant="primary" @click="confirm">
        Got it - please nudge them
      </b-button>
    </template>
  </b-modal>
</template>

<script setup>
import { useOurModal } from '~/composables/useOurModal'

const emit = defineEmits(['confirm'])

const { modal, hide } = useOurModal()

function confirm() {
  emit('confirm')
  hide()
}
</script>
