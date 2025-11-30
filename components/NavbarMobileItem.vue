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
        <span v-if="badge" class="nav-badge">{{ badge }}</span>
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
})

defineEmits(['click', 'mousedown'])
</script>

<style scoped lang="scss">
@import 'assets/css/_color-vars.scss';

.navbar-mobile-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  min-width: 0;
  height: 51px;
}

.item-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  height: 100%;
}

.icon-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 26px;
}

.nav-icon {
  width: 24px !important;
  height: 24px !important;
  color: #757575;
}

.nav-label {
  font-size: 10px;
  font-weight: 500;
  color: #757575;
  line-height: 1;
  text-align: center;
  white-space: nowrap;
}

.nav-badge {
  position: absolute;
  top: -6px;
  right: -8px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  background: #ef5350;
  color: white;
  font-size: 10px;
  font-weight: 600;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
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
