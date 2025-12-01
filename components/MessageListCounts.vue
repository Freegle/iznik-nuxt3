<template>
  <!-- Mobile Layout -->
  <div v-if="browseCount" class="d-block d-md-none unread-divider">
    <div class="divider-line" />
    <div class="divider-content">
      <v-icon icon="eye" class="unread-icon" />
      <span class="unread-text">{{ browseCountPlural }}</span>
      <button class="mark-seen-btn" @click="markSeen">Mark seen</button>
    </div>
    <div class="divider-line" />
  </div>

  <!-- Desktop Layout (original) -->
  <div class="d-none d-md-block">
    <NoticeMessage
      v-if="browseCount"
      variant="info"
      class="text-center mt-3 ms-2 me-2 ms-md-0 me-md-0"
    >
      <p class="text--large font-weight-bold">{{ browseCountPlural }}.</p>
      <p>
        Posts you've not seen before show first. Posts you've seen before are
        further down.
      </p>
      <b-button class="mt-2" size="sm" variant="white" @click="markSeen">
        Mark all Seen
      </b-button>
    </NoticeMessage>
  </div>
</template>
<script setup>
import pluralize from 'pluralize'
import { computed } from 'vue'
import { useMessageStore } from '~/stores/message'

const emit = defineEmits(['markSeen'])
const messageStore = useMessageStore()

const browseCount = computed(() => {
  return Math.min(99, messageStore.count)
})

const browseCountPlural = computed(() => {
  return pluralize('unread post', messageStore.count, true)
})

function markSeen() {
  emit('markSeen')
}
</script>
<style scoped lang="scss">
@import 'assets/css/_color-vars.scss';

.unread-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  margin: 4px 0;
  background: $color-white;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(
    to right,
    transparent,
    rgba($colour-secondary, 0.3),
    rgba($colour-secondary, 0.3),
    transparent
  );
}

.divider-content {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.unread-icon {
  font-size: 0.9rem;
  color: $colour-secondary;
}

.unread-text {
  font-size: 0.8rem;
  font-weight: 600;
  color: $colour-secondary;
}

.mark-seen-btn {
  font-size: 0.75rem;
  font-weight: 500;
  color: $color-gray--dark;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  text-decoration: underline;

  &:hover {
    color: $colour-secondary;
  }
}
</style>
