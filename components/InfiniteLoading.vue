<template>
  <client-only>
    <div
      :key="bump"
      v-observe-visibility="{
        callback: visibilityChanged,
        options: {
          rootMargin: '0px 0px ' + distance + 'px 0px',
        },
      }"
      class="infinite-loader"
    >
      <slot v-if="state == 'loading'" name="spinner"></slot>
      <slot v-if="state == 'complete'" name="complete"></slot>
      <slot v-if="state == 'error'" name="error"></slot>
    </div>
  </client-only>
</template>
<script setup>
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'

// Derived from https://github.com/oumoussa98/vue3-infinite-loading.  Reworked radically to allow an async event
// handler, and to make consistent with the rest of this codebase.
const props = defineProps({
  top: { type: Boolean, required: false },
  target: { type: [String, Boolean], required: false, default: null },
  distance: { type: Number, required: false, default: 0 },
  identifier: { type: [String, Number], required: false, default: null },
  firstload: { type: Boolean, required: false, default: true },
  slots: { type: Object, required: false, default: null },
})

const emit = defineEmits(['infinite'])

const state = ref('ready')
const bump = ref(0)
const visible = ref(false)
let timer = null

// Methods
function visibilityChanged(isVisible) {
  visible.value = isVisible
}

function loading() {
  state.value = 'loading'
}

function loaded() {
  state.value = 'loaded'
}

function complete() {
  state.value = 'complete'
}

function error() {
  state.value = 'error'
}

function stopObserver() {
  complete()
}

async function emitInfinite() {
  loading()

  // Wait for the next tick otherwise if the event handlers return synchronously we may not end up triggering
  // the watch.
  await nextTick()
  emit('infinite', {
    loading,
    loaded,
    complete,
    error,
    stopObserver,
  })
}

function fallback() {
  timer = null

  if (visible.value && state.value === 'loaded') {
    // We have loaded and not completed, and yet it's still visible.  We need to do some more.
    emitInfinite()
  }

  timer = setTimeout(fallback, 100)
}

// Watch state changes
watch(state, (newVal) => {
  // console.log('state changed', newVal)
  if (newVal === 'loading') {
    // This is an internal change - nothing to do.
  } else if (newVal === 'complete') {
    // console.log('Complete, stop observer')
    stopObserver()
  } else {
    const parentEl = props.target || document.documentElement
    const prevHeight = parentEl.scrollHeight

    if (newVal === 'loaded' && props.top) {
      // console.log('Adjust scrollTop')
      parentEl.scrollTop = parentEl.scrollHeight - prevHeight
    }
  }
})

// Watch identifier changes
watch(
  () => props.identifier,
  () => {
    // We've been asked to kick the component to reset it.
    bump.value++
    emitInfinite()
  }
)

// Lifecycle hooks
onMounted(async () => {
  if (props.firstload) {
    await emitInfinite()
  }

  // It would be nice if we didn't need a timer and could be purely event-driven.  But there is no guarantee
  // that what happens in response to our emit will result in all the components being rendered, and although
  // Vue3 has Suspense I can't see an easy way of waiting for all renders to finish.
  timer = setTimeout(fallback, 100)
})

onBeforeUnmount(() => {
  if (timer) {
    clearTimeout(timer)
  }
})

// Expose methods to parent components
defineExpose({
  loading,
  loaded,
  complete,
  error,
  stopObserver,
})
</script>
