<template>
  <div class="pulsate">
    <div class="d-flex justify-content-around">
      <div class="stacked" title="Network is offline">
        <v-icon icon="cloud" class="text-white" size="2x" />
        <v-icon icon="ban" class="marg mt-1 text-danger" />
      </div>
    </div>
    <div class="d-flex justify-content-around text--smallest text-white mb-1">
      Offline
    </div>
  </div>
</template>

<script setup>
// Static component with no reactive state
</script>
<style scoped lang="scss">
.stacked {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;

  svg {
    grid-row: 1 / 2;
    grid-column: 1 / 2;
  }

  svg:nth-child(2) {
    z-index: 10000;
    color: white;
    padding-top: 7px;
    padding-right: 7px;
  }
}

.pulsate {
  width: 66px;
  height: 58px;
}

.marg {
  margin-left: 12px;
}
</style>
