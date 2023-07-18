<template>
  <NoticeMessage>
    <div v-if="showConfirm">
      <p>We've sent you a verification mail.</p>
      <p>Don't forget to check your spam folder!</p>
      <p>
        Once you've merged the accounts, you can come back here to continue your
        post.
      </p>
    </div>
    <div v-else>
      <p>
        {{ theirs }} belongs to a different account from the one you're using
        right now.
        <span v-if="me.email"> ({{ me.email }}) </span>
        . But don't worry! You probably have two acounts, and we can merge them
        together.
      </p>
      <p>
        Click this button and we'll send an email to {{ theirs }} to confirm
        that you want to merge the accounts.
      </p>
      <b-button size="lg" class="mb-2" variant="white" @click="requestMerge"
        >Request merge</b-button
      >
    </div>
  </NoticeMessage>
</template>
<script>
import { useAuthStore } from '../stores/auth'
import NoticeMessage from './NoticeMessage'

export default {
  components: { NoticeMessage },
  props: {
    theirs: {
      type: String,
      required: true,
    },
  },
  setup() {
    const authStore = useAuthStore()

    return { authStore }
  },
  data: function () {
    return {
      showConfirm: false,
    }
  },
  methods: {
    async requestMerge() {
      const data = await this.authStore.saveEmail({
        email: this.theirs,
      })

      console.log('data', data)

      this.showConfirm = true
    },
  },
}
</script>
