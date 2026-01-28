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
<script setup>
import { ref } from 'vue'

const showMergeMemberModal = ref(false)

function mergeMember() {
  showMergeMemberModal.value = true
}
</script>
