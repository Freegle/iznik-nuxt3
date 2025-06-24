<template>
  <div
    :class="{
      'bg-white': true,
      'd-block': mobile,
      'd-xl-none': mobile,
    }"
  >
    <div class="d-flex justify-content-between flex-wrap">
      <b-button to="/give" variant="primary" class="topbutton m-1 ml-2">
        <v-icon icon="gift" />&nbsp;Give
      </b-button>
      <b-button to="/find" variant="primary" class="topbutton m-1 mr-2">
        <v-icon icon="shopping-cart" />&nbsp;Ask
      </b-button>
    </div>
  </div>
</template>
<script setup>
defineProps({
  mobile: {
    type: Boolean,
    default: false,
  },
})
</script>
<style scoped lang="scss">
.topbutton {
  width: 40%;
}
</style>
