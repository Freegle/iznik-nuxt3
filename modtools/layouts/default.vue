<template>
  <div>
    <Html>

    <Head>
      <Title>{{ title }}</Title>
    </Head>

    </Html>
    <div class="container">
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import { useMiscStore } from '@/stores/misc'

export default {
  setup() {
    const miscStore = useMiscStore()

    return {miscStore }
  },
  data: function () {
    return {
      title: "ModTools"
    }
  },
  computed: {
  },
  mounted() {
  },
  methods: {
  }
}
</script>

<style>
</style>
