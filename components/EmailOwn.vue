<template>
  <div class="d-flex justify-content-between">
    <em class="pt-2">{{ email.email }}</em>
    <b-button variant="link" class="align-baseline" @click="deleteIt">
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
