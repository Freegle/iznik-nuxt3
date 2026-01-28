<template>
  <div>
    <b-modal
      id="modRulesModal"
      ref="modal"
      size="lg"
      no-stacking
      no-close-on-backdrop
      no-close-on-esc
      hide-header-close
    >
      <template #title> Please configure group rules </template>
      <template #default>
        <ModMissingRules expanded />
      </template>
      <template #footer>
        <b-button variant="secondary" :disabled="enableIn > 0" @click="hide">
          Not now
          <span v-if="enableIn > 0">({{ enableIn }})</span>
        </b-button>
      </template>
    </b-modal>
  </div>
</template>
<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useOurModal } from '~/composables/useOurModal'

const { modal, show, hide } = useOurModal()

const enableIn = ref(0)
const timer = ref(null)

const delay = computed(() => {
  const now = new Date()
  const start = new Date(now.getFullYear(), 3, 6)
  const diff = now - start
  const oneDay = 1000 * 60 * 60 * 24
  return Math.floor(diff / oneDay)
})

function tick() {
  timer.value = null
  if (enableIn.value > 0) {
    enableIn.value -= 1
    timer.value = setTimeout(tick, 1000)
  }
}

onMounted(() => {
  enableIn.value = delay.value
  timer.value = setTimeout(tick, 1000)
})

onBeforeUnmount(() => {
  if (timer.value) {
    clearTimeout(timer.value)
  }
})

defineExpose({ show, hide })
</script>
