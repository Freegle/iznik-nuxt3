<template>
  <div>
    <em class="pt-2 flex-shrink-1">{{ email.email }}</em>
    <b-button variant="link" class="align-baseline" size="sm" @click="deleteIt">
      Remove
    </b-button>
  </div>
</template>
<script>
import { useUserStore } from '../stores/user'

export default {
  props: {
    email: {
      type: Object,
      required: true,
    },
  },
  methods: {
    async deleteIt() {
      const userStore = useUserStore()
      await userStore.removeEmail(this.myid, this.email.email)
    },
  },
}
</script>
