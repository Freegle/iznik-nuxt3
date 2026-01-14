<template>
  <nuxt-link
    no-prefetch
    class="navbar-mobile-item"
    :to="to"
    @click="$emit('click')"
    @mousedown="$emit('mousedown')"
  >
    <div class="item-content">
      <div class="icon-container">
        <v-icon :icon="icon" class="nav-icon" />
        <span v-if="badge" class="nav-badge" :class="'badge-' + badgeVariant">{{
          badge
        }}</span>
      </div>
      <span class="nav-label">{{ label }}</span>
    </div>
  </nuxt-link>
</template>

<script setup>
defineProps({
  to: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  badge: {
    type: [Number, String],
    default: null,
  },
  badgeVariant: {
    type: String,
    default: 'info',
    validator: (value) => ['info', 'danger'].includes(value),
  },
})

defineEmits(['click', 'mousedown'])
</script>

<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';
@import 'assets/css/_color-vars.scss';

.navbar-mobile-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  min-width: 0;
  height: 51px;

  @include media-breakpoint-up(md) {
    height: 60px;
  }
}

.item-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  height: 100%;

  @include media-breakpoint-up(md) {
    gap: 4px;
  }
}

.icon-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 26px;

  @include media-breakpoint-up(md) {
    width: 36px;
    height: 32px;
  }
}

.nav-icon {
  width: 24px !important;
  height: 24px !important;
  color: #757575;

  @include media-breakpoint-up(md) {
    width: 28px !important;
    height: 28px !important;
  }
}

.nav-label {
  font-size: 10px;
  font-weight: 500;
  color: #757575;
  line-height: 1;
  text-align: center;
  white-space: nowrap;

  @include media-breakpoint-up(md) {
    font-size: 12px;
  }
}

.nav-badge {
  position: absolute;
  top: -6px;
  right: -8px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  color: white;
  font-size: 10px;
  font-weight: 600;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;

  @include media-breakpoint-up(md) {
    min-width: 18px;
    height: 18px;
    font-size: 11px;
    top: -8px;
    right: -10px;
  }

  &.badge-info {
    background: #17a2b8;
  }

  &.badge-danger {
    background: #ef5350;
  }
}

// Active state
.nuxt-link-active,
.router-link-active {
  .nav-icon {
    color: $color-green-background;
  }

  .nav-label {
    color: $color-green-background;
    font-weight: 600;
  }
}
</style>
