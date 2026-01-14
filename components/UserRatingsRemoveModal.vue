<template>
  <b-modal
    ref="modal"
    scrollable
    title="Removing a rating"
    ok-title="Remove rating"
    @ok="removeRating"
  >
    <p>
      You've already given this freegler a
      <span v-if="user?.info?.ratings?.Mine === 'Up'"> thumbs up </span>
      <span v-if="user?.info?.ratings?.Mine === 'Down'"> thumbs down </span>
      rating. You can only rate each freegler once.
    </p>
    <p>You can remove your rating if you wish, or cancel.</p>
  </b-modal>
</template>
<script setup>
import { useUserStore } from '~/stores/user'
import { useOurModal } from '~/composables/useOurModal'

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(['rated'])

const { modal, hide } = useOurModal()

const userStore = useUserStore()

const user = computed(() => {
  let ret = null

  if (props.id) {
    const user = userStore?.byId(props.id)

    if (user && user.info) {
      ret = user
    }
  }

  return ret
})

async function rate(rating, reason, text) {
  await userStore.rate(props.id, rating, reason, text)
}

async function removeRating() {
  emit('rated', 'None')
  await rate(null)
  hide()
}
</script>
