<template>
  <div>
    <em class="pt-2 flex-shrink-1">{{ email.email }}</em>
    <b-button
      v-if="me?.email"
      variant="link"
      class="align-baseline"
      size="sm"
      @click="deleteIt"
    >
      Remove
    </b-button>
    <b-button
      v-if="me?.email"
      variant="link"
      class="align-baseline"
      size="sm"
      @click="makePrimary"
    >
      Make Primary
    </b-button>
  </div>
</template>
<script setup>
import { useAuthStore } from '~/stores/auth'
const me = useAuthStore().user

const props = defineProps({
  email: {
    type: Object,
    required: true,
  },
})

const authStore = useAuthStore()

async function deleteIt() {
  await authStore.removeEmail(props.email.email)
}

async function makePrimary() {
  await authStore.makeEmailPrimary(props.email.email)
}
</script>
