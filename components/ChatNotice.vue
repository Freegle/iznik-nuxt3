<template>
  <div
    class="chat-notice"
    :class="[
      `chat-notice--${variant}`,
      { 'chat-notice--dismissible': dismissible },
    ]"
  >
    <div class="chat-notice__icon">
      <v-icon :icon="iconName" />
    </div>
    <div class="chat-notice__content">
      <div v-if="title" class="chat-notice__title">{{ title }}</div>
      <div class="chat-notice__text">
        <slot />
      </div>
    </div>
    <button
      v-if="dismissible"
      class="chat-notice__dismiss"
      aria-label="Dismiss"
      @click="$emit('dismiss')"
    >
      <v-icon icon="times" />
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'info',
    validator: (v) => ['info', 'warning', 'danger'].includes(v),
  },
  title: {
    type: String,
    default: null,
  },
  icon: {
    type: String,
    default: null,
  },
  dismissible: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['dismiss'])

const iconName = computed(() => {
  if (props.icon) return props.icon
  switch (props.variant) {
    case 'danger':
      return 'ban'
    case 'warning':
      return 'exclamation-triangle'
    default:
      return 'info-circle'
  }
})
</script>

<style scoped lang="scss">
@import 'assets/css/_color-vars.scss';

.chat-notice {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  margin: 8px;
  font-size: 0.85rem;
  line-height: 1.4;
}

.chat-notice__icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 0.75rem;
}

.chat-notice__content {
  flex: 1;
  min-width: 0;
}

.chat-notice__title {
  font-weight: 600;
  margin-bottom: 2px;
}

.chat-notice__text {
  color: inherit;
  opacity: 0.9;
}

.chat-notice__dismiss {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s;
  border-radius: 4px;

  &:hover {
    opacity: 1;
  }
}

// Variants
.chat-notice--info {
  background-color: $color-blue--x-light;
  color: $color-blue--1;

  .chat-notice__icon {
    background-color: rgba($color-blue--1, 0.15);
    color: $color-blue--1;
  }

  .chat-notice__dismiss {
    color: $color-blue--1;
  }
}

.chat-notice--warning {
  background-color: #fff8e6;
  color: #8a6d00;

  .chat-notice__icon {
    background-color: rgba(#d4a000, 0.2);
    color: #d4a000;
  }

  .chat-notice__dismiss {
    color: #8a6d00;
  }
}

.chat-notice--danger {
  background-color: #fce8e8;
  color: #a11a1a;

  .chat-notice__icon {
    background-color: rgba(#c62828, 0.15);
    color: #c62828;
  }

  .chat-notice__dismiss {
    color: #a11a1a;
  }
}
</style>
