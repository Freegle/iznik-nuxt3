<template>
  <div class="w-100 d-flex justify-content-center text-center">
    <b-img lazy src="/loader.gif" alt="Loading" width="100px" />
  </div>
</template>
<script>
import { useUserStore } from '../stores/user'
import { useRouter } from '#imports'

export default {
  setup() {
    const userStore = useUserStore()

    return {
      userStore,
    }
  },
  data: function () {
    return {
      engageid: null,
      action: null,
    }
  },
  created() {
    this.engageid = this.$route.query.engageid
    this.action = this.$route.query.action
  },
  async mounted() {
    // Record the engagement.
    if (this.engageid) {
      await this.userStore.engaged(this.engageid)
    }

    // Now route on to where we were supposed to go.
    const router = useRouter()
    router.push('/' + (this.action ? this.action : ''))
  },
}
</script>
