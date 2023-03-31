<template>
  <client-only>
    <DatePicker v-bind="$attrs">
      <template v-for="(_, slot) of $slots" #[slot]="scope">
        <slot :name="slot" v-bind="scope" />
      </template>
    </DatePicker>
  </client-only>
</template>
<script setup>
// We use script setup because of https://github.com/nuxt/nuxt/issues/19964.  We put this into a subcomponent so that
// we don't have to rework the other components which use it into script setup.
import DatePicker from 'vue-datepicker-next'
import 'vue-datepicker-next/index.css'
</script>
