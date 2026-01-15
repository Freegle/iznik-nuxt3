<template>
  <div class="bg-white">
    <p>
      This should redirect you back to Discourse. If it doesn't, mail
      geeks@ilovefreegle.org.
    </p>
    <b-img src="/loader.gif" alt="Loading" />
  </div>
</template>
<script>
import { useAuthStore } from '~/stores/auth'
import { useMe } from '~/composables/useMe'

export default {
  setup() {
    const { myid } = useMe()
    return { myid }
  },
  watch: {
    myid(newVal, oldVal) {
      console.log('modtools discourse watch myid', newVal, oldVal)
      if (!oldVal && newVal) {
        this.redirect()
      }
    },
  },
  mounted() {
    console.log('modtools discourse mounted A', this.myid)
    if (this.myid) {
      this.redirect()
      return
    }
    console.log('modtools discourse mounted B')
    const authStore = useAuthStore()
    const me = authStore.user
    if (me && me.id) {
      console.log('modtools discourse mounted C', me.id)
      this.redirect()
    }
  },
  methods: {
    redirect() {
      console.log('modtools discourse redirect')
      window.location = 'https://discourse.ilovefreegle.org'
    },
  },
}
</script>
