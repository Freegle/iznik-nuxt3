<template>
  <div class="up-to-date-divider">
    <div class="divider-line"></div>
    <div class="divider-content">
      <v-icon icon="check-circle" class="check-icon" />
      <span class="divider-text">You're up to date</span>
    </div>
    <div class="divider-line"></div>
  </div>
</template>
<script setup></script>
<style scoped lang="scss">
@import 'assets/css/_color-vars.scss';

.up-to-date-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  margin: 0;
  background: $color-white;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(
    to right,
    transparent,
    rgba($colour-success, 0.4),
    rgba($colour-success, 0.4),
    transparent
  );
}

.divider-content {
  display: flex;
  align-items: center;
  gap: 6px;
  color: $colour-success;
  white-space: nowrap;
}

.check-icon {
  font-size: 1rem;
}

.divider-text {
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
</style>
