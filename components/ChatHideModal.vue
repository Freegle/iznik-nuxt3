<template>
  <b-modal
    ref="modal"
    scrollable
    :title="title"
    no-stacking
    modal-class="confirm-modal"
  >
    <template #default>
      <b-row>
        <b-col>
          <p v-if="props.id">
            If you do this, this chat won't show in your list until there are
            new messages from them.
          </p>
          <p v-else>
            If you do this, all these chats will be removed until there are new
            messages
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
import { computed } from 'vue'
import { useOurModal } from '~/composables/useOurModal'

const props = defineProps({
  id: {
    type: Number,
    required: false,
    default: null,
  },
  user: {
    type: Object,
    required: false,
    default: null,
  },
})

const emit = defineEmits(['confirm'])

const { modal, hide } = useOurModal()

const title = computed(() => {
  if (props.user) {
    return 'Hide chat with ' + props.user.displayname
  } else {
    return 'Hide chat'
  }
})

function confirm() {
  emit('confirm')
  hide()
}
</script>
