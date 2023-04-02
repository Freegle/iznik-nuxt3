<template>
  <client-only>
    <AtTa v-bind="$attrs">
      <template v-for="(_, slot) of $slots" #[slot]="scope">
        <slot :name="slot" v-bind="scope" />
      </template>
    </AtTa>
  </client-only>
</template>
<script setup>
// We use script setup because of https://github.com/nuxt/nuxt/issues/19964.  We put this into a subcomponent so that
// we don't have to rework the other components which use it into script setup.
import AtTa from 'vue-at/dist/vue-at-textarea'
</script>
