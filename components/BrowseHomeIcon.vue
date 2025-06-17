<template>
  <div class="icon d-flex flex-column justify-content-center">
    <span class="normal">
      <v-icon icon="home" />
    </span>
  </div>
</template>
<script setup>
// This component has no script logic
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';

.icon {
  width: 46px;
  height: 46px;
  margin-left: -23px;
  margin-top: -23px;
  border-radius: 50%;
  border: 5px solid $color-blue--bright;
  text-align: center;
  font-weight: bold;
  color: $color-blue--bright;
  background-color: white;
  font-size: 16px;
}

.normal {
  line-height: 16px;
  font-size: 16px;
  font-weight: bold;
}
</style>
