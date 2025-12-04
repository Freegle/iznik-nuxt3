<template>
  <div v-if="browseCount" class="unread-divider">
    <div class="divider-line" />
    <div class="divider-content">
      <v-icon icon="eye" class="unread-icon" />
      <span class="unread-text">{{ browseCountPlural }}</span>
      <button class="mark-seen-btn" @click="markSeen">Mark seen</button>
    </div>
    <div class="divider-line" />
  </div>
</template>
<script setup>
import pluralize from 'pluralize'
import { computed } from 'vue'

const props = defineProps({
  count: {
    type: Number,
    required: false,
    default: 0,
  },
})

const emit = defineEmits(['markSeen'])

const browseCount = computed(() => {
  return Math.min(99, props.count)
})

const browseCountPlural = computed(() => {
  return pluralize('unread post', props.count, true)
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
  justify-content: center;
  gap: 12px;
  padding: 12px 16px;
  margin: 4px 0;
  background: $color-white;
  text-align: center;
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
  justify-content: center;
  gap: 8px;
  white-space: nowrap;
  flex-shrink: 0;
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
