<template>
  <div>
    <em class="pt-2 flex-shrink-1">{{ email.email }}</em>
    <b-button variant="link" class="align-baseline" size="sm" @click="deleteIt">
      Remove
    </b-button>
    <b-button
      variant="link"
      class="align-baseline"
      size="sm"
      @click="makePrimary"
    >
      Make Primary
    </b-button>
  </div>
</template>
<script>
import { useAuthStore } from '~/stores/auth'

export default {
  props: {
    email: {
      type: Object,
      required: true,
    },
  },
  setup() {
    const authStore = useAuthStore()

    return {
      authStore,
    }
  },
  methods: {
    async deleteIt() {
      await this.authStore.removeEmail(this.email.email)
    },
    async makePrimary() {
      await this.authStore.makeEmailPrimary(this.email.email)
    },
  },
}
</script>
