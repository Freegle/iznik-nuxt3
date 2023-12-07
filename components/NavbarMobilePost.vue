<template>
  <nuxt-link to="/post">
    <v-icon icon="circle-plus" class="plus" />
  </nuxt-link>
</template>
<script setup></script>
<style scoped lang="scss">
@import 'assets/css/_color-vars.scss';

.plus {
  font-size: 2.5em;
  color: $color-green-background;
  background-color: $color-white;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: none;
}
</style>
