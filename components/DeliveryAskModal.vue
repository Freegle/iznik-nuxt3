<template>
  <b-modal ref="modal" scrollable no-stacking>
    <template #title>
      <h2>Could you deliver?</h2>
    </template>
    <template #default>
      <p>
        Usually, the freegler who receives something will collect it. But
        sometimes they don't have transport, and some people don't mind dropping
        things off.
      </p>
      <p>
        Could you deliver your item<span v-if="ids.length">s</span>, if it works
        for you?
      </p>
    </template>
    <template #footer>
      <div class="d-flex justify-content-between w-100">
        <b-button variant="primary" data-label="Delivery: Maybe" @click="maybe">
          Maybe
        </b-button>
        <b-button
          variant="primary"
          data-label="Delivery: Collection only"
          @click="no"
        >
          Collection only
        </b-button>
      </div>
    </template>
  </b-modal>
</template>
<script setup>
import { useOurModal } from '~/composables/useOurModal'
import { useMessageStore } from '~/stores/message'

const props = defineProps({
  ids: {
    type: Array,
    required: true,
  },
})

const messageStore = useMessageStore()
const emit = defineEmits(['hide'])

async function maybe() {
  const promises = []

  props.ids.forEach((id) => {
    promises.push(
      messageStore.patch({
        id,
        deliverypossible: true,
      })
    )
  })

  await Promise.all(promises)
  emit('hide')
  hide()
}

function no() {
  emit('hide')
  hide()
}

const { modal, hide } = useOurModal()
</script>
