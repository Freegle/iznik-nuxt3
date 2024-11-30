<template>
  <span>
    {{ intro }}
    {{ username }}
    <span v-if="showId" class="text-muted small">
      (<v-icon icon="hashtag" class="fa-0-8x" />{{ props.id }})
    </span>
  </span>
</template>
<script setup>
import { useUserStore } from '~/stores/user'

const userStore = useUserStore()

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
  showId: {
    type: Boolean,
    default: true,
  },
  intro: {
    type: String,
    required: false,
    default: '',
  },
})

try {
  userStore.fetch(props.id)
} catch (error) {}

const username = computed(() => {
  const user = userStore.byId(props.id)

  return user?.displayname
})
</script>
