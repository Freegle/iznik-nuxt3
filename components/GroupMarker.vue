<template>
  <l-marker
    :key="'groupmarker-' + group.id + '-' + size"
    :lat-lng="[group.lat, group.lng]"
    @click="goto"
  >
    <l-icon v-if="size === 'rich'">
      <GroupMarkerRich :group="group" />
    </l-icon>
    <l-icon v-else icon-url="/mapmarker.gif" :icon-size="[15, 19]" />
    <l-tooltip v-if="size === 'poor'">
      {{ group.namedisplay }}
    </l-tooltip>
  </l-marker>
</template>
<script>
import GroupMarkerRich from './GroupMarkerRich'

export default {
  components: {
    GroupMarkerRich,
  },
  props: {
    group: {
      type: Object,
      required: true,
    },
    size: {
      type: String,
      required: true,
    },
  },
  methods: {
    goto() {
      this.$router.push('/explore/' + this.group.nameshort)
    },
  },
}
</script>
<style scoped lang="scss">
.thick {
  border: 2px solid $color-green--darker !important;
}

.clear {
  background: transparent;
  border: none;
}
</style>
