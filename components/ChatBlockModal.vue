<template>
  <b-modal
    ref="modal"
    scrollable
    :title="'Block ' + props.user.displayname"
    no-stacking
    modal-class="confirm-modal"
  >
    <template #default>
      <b-row>
        <b-col>
          <p>
            If you do this, you won't ever get any more chat messages or emails
            from them.
          </p>
          <p>Are you sure?</p>
        </b-col>
      </b-row>
    </template>
    <template #footer>
      <b-button variant="white" @click="hide"> Cancel </b-button>
      <b-button variant="primary" @click="confirm"> Confirm </b-button>
    </template>
  </b-modal>
</template>

<script setup>
import { useOurModal } from '~/composables/useOurModal'

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
  user: {
    type: Object,
    required: true,
  },
})

const { modal, hide } = useOurModal()

const emit = defineEmits(['confirm'])

function confirm() {
  emit('confirm')
  hide()
}
</script>
