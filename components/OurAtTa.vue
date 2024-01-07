<template>
  <client-only>
    <Mentionable :keys="['@']" :items="items">
      <slot name="default" />
    </Mentionable>
  </client-only>
</template>
<script setup>
// We use script setup because of https://github.com/nuxt/nuxt/issues/19964.  We put this into a subcomponent so that
// we don't have to rework the other components which use it into script setup.
import 'floating-vue/dist/style.css'
import { Mentionable } from 'vue-mention'

const props = defineProps({
  members: {
    type: Array,
    required: true,
  },
})

const items = computed(() =>
  props.members.map((m) => {
    return {
      value: m,
      label: m,
    }
  })
)
</script>
