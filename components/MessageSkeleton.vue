<template>
  <div class="message-skeleton">
    <div class="skeleton-photo-area" />
    <div class="skeleton-content">
      <div class="skeleton-line skeleton-line--title" />
      <div class="skeleton-line skeleton-line--text" />
      <div class="skeleton-line skeleton-line--text skeleton-line--short" />
    </div>
  </div>
</template>

<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';
@import 'assets/css/_color-vars.scss';

.message-skeleton {
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 8px $color-black-opacity-12;
  background: $color-white;

  @include media-breakpoint-up(lg) {
    display: flex;
    flex-direction: row;
    max-height: 200px;
    border: 1px solid $color-gray--light;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
}

.skeleton-photo-area {
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 115%;
  background: $color-gray--light;
  overflow: hidden;

  @include media-breakpoint-up(md) {
    padding-bottom: 75%;
  }

  @include media-breakpoint-up(lg) {
    width: 200px;
    height: 200px;
    padding-bottom: 0;
    flex-shrink: 0;
  }
}

.skeleton-content {
  display: none;
  padding: 1rem 1.5rem;
  flex: 1;

  @include media-breakpoint-up(lg) {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
}

.skeleton-line {
  height: 0.8rem;
  background: rgba(0, 0, 0, 0.06);

  &--title {
    width: 60%;
    height: 1rem;
  }

  &--text {
    width: 90%;
  }

  &--short {
    width: 40%;
  }
}
</style>
