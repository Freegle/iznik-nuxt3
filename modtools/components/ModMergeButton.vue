<template>
  <div>
    <b-button variant="white" @click="mergeMember">
      <v-icon icon="equals" /> Merge
    </b-button>
    <ModMergeMemberModal
      v-if="showMergeMemberModal"
      ref="mergemodal"
      @hidden="showMergeMemberModal = false"
    />
  </div>
</template>
<script>
export default {
  data() {
    return {
      showMergeMemberModal: false,
    }
  },
  methods: {
    mergeMember() {
      this.showMergeMemberModal = true
    },
  },
}
</script>
