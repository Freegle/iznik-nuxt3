<template>
  <div class="up-to-date-wrapper">
    <NoticeMessage
      variant="info"
      class="text-center mt-1 ms-2 me-2 ms-md-0 me-md-0 up-to-date-notice"
    >
      <v-icon icon="check-circle" class="text-success icon-size" />
      <p class="title-text font-weight-bold mb-0">You're up to date.</p>
      <p class="subtitle-text mb-0">You've already seen posts below here.</p>
    </NoticeMessage>
  </div>
</template>
<script setup>
import NoticeMessage from './NoticeMessage'
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';

.up-to-date-wrapper {
  margin-top: 0.25rem;
  margin-bottom: 0.25rem;
}

.up-to-date-notice {
  padding: 0.5rem !important;
}

.icon-size {
  font-size: 1.5rem;

  @include media-breakpoint-up(md) {
    font-size: 2rem;
  }
}

.title-text {
  font-size: 0.85rem;

  @include media-breakpoint-up(md) {
    font-size: 1.1rem;
  }
}

.subtitle-text {
  font-size: 0.75rem;

  @include media-breakpoint-up(md) {
    font-size: 0.9rem;
  }
}
</style>
