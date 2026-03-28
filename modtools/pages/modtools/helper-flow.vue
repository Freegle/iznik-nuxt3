<template>
  <div class="helper-flow-page p-3">
    <h2 class="mb-3">Freegle Helper — Conversation Flow</h2>
    <p class="text-muted mb-4">
      How the Helper manages replies to bulk-posted items. Each box is a
      conversation state; arrows show what triggers a transition.
    </p>
    <ClientOnly>
      <div class="flow-container">
        <HelperFlowChart />
      </div>
    </ClientOnly>
  </div>
</template>

<script setup>
import HelperFlowChart from '~/modtools/components/HelperFlowChart.client.vue'

definePageMeta({
  layout: 'modtools',
})
</script>

<style scoped>
.flow-container {
  width: 100%;
  height: 80vh;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}
</style>
