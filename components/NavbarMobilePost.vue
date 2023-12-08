<template>
  <nuxt-link to="/post">
    <v-icon icon="plus" class="plus" />
  </nuxt-link>
</template>
<script setup></script>
<style scoped lang="scss">
@import 'assets/css/_color-vars.scss';

.plus {
  background-color: $color-green-background;
  color: $color-white;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 1px solid $color-green-background;
  box-shadow: 0 0 4px 2px $color-gray--dark;
  box-sizing: border-box;
}
</style>
