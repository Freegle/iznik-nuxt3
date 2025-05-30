<template>
  <div class="bg-white">
    <p>This should redirect you back to Discourse. If it doesn't, mail geeks@ilovefreegle.org.</p>
    <b-img src="~/static/loader.gif" alt="Loading" />
  </div>
</template>
<script>
export default {
  watch: {
    myid(newVal, oldVal) {
      console.log('modtools discourse watch myid', newVal, oldVal)
      if (!oldVal && newVal) {
        this.redirect()
      }
    }
  },
  mounted() {
    console.log('modtools discourse mounted', this.myid)
    if (this.myid) {
      this.redirect()
    }
  },
  methods: {
    redirect() {
      console.log('modtools discourse redirect')
      window.location = 'https://discourse.ilovefreegle.org'
    }
  }
}
</script>
