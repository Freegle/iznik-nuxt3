<template>
  <div class="d-inline-block">
    <b-badge
      v-b-tooltip="{
        title: 'Charity Partner - click for more info',
      }"
      variant="primary rounded charity-partner"
      :class="'clickme ' + 'size-' + size"
      @click="showModal"
    >
      <svg
        class="charity-icon"
        viewBox="0 0 24 24"
        :width="size === 'lg' ? 20 : 16"
        :height="size === 'lg' ? 20 : 16"
        aria-hidden="true"
      >
        <path
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          fill="currentColor"
        />
        <path
          d="M9 12l2 2 4.5-4.5"
          fill="none"
          stroke="white"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      Charity Partner
    </b-badge>
    <CharityInfoModal
      v-if="showInfoModal"
      ref="modal"
      @hidden="showInfoModal = false"
    />
  </div>
</template>
<script setup>
const CharityInfoModal = defineAsyncComponent(() =>
  import('~/components/CharityInfoModal.vue')
)

defineProps({
  size: {
    type: String,
    required: false,
    default: 'md',
  },
})

const showInfoModal = ref(false)

const showModal = (e) => {
  e.preventDefault()
  e.stopPropagation()
  showInfoModal.value = true
}
</script>
<style scoped lang="scss">
.charity-partner {
  color: white;
  background-color: #2563eb !important;
  display: inline-flex;
  align-items: center;
  gap: 0.35em;
  padding: 0.35em 0.65em;
  line-height: 1.2;
}

.charity-icon {
  flex-shrink: 0;
}

.size-lg {
  font-size: 1.25rem;
}
</style>
