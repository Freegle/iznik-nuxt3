<template>
  <div>
    <b-button variant="white" @click="mergeMember">
      <v-icon name="equals" /> Merge
    </b-button>
    <ModMergeMemberModal ref="mergemodal" />
  </div>
</template>
<script>
export default {
  methods: {
    mergeMember() {
      this.waitForRef('mergemodal', () => {
        this.$refs.mergemodal.show()
      })
    }
  }
}
</script>
