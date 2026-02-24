<template>
  <div class="message-skeleton">
    <div class="skeleton-photo-area" />
    <div class="skeleton-content">
      <!-- Matches .content-header (tag badge + title + location) -->
      <div class="skeleton-header">
        <div class="skeleton-tag" />
        <div class="skeleton-title-group">
          <div class="skeleton-line skeleton-line--title" />
          <div class="skeleton-line skeleton-line--subtitle" />
        </div>
      </div>
      <!-- Matches .content-description (2 lines) -->
      <div class="skeleton-line skeleton-line--text" />
      <div class="skeleton-line skeleton-line--text skeleton-line--short" />
      <!-- Matches .content-meta (location + time) -->
      <div class="skeleton-meta">
        <div class="skeleton-line skeleton-line--meta" />
        <div class="skeleton-line skeleton-line--meta" />
      </div>
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
  padding: 0.75rem;
  flex: 1;

  @include media-breakpoint-up(md) {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    min-height: 0;
    border: 1px solid $color-gray--light;
    border-top: none;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  @include media-breakpoint-up(lg) {
    padding: 1rem 1.5rem;
    gap: 0.5rem;
    border: none;
    border-left: 1px solid $color-gray--light;
    box-shadow: none;
    overflow: hidden;
    min-width: 0;
  }
}

/* Matches .content-header grid layout */
.skeleton-header {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 0.35rem;
}

.skeleton-tag {
  width: 55px;
  height: 1.5rem;
  background: rgba(0, 0, 0, 0.06);
}

.skeleton-title-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

/* Matches .content-meta at bottom */
.skeleton-meta {
  margin-top: auto;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.skeleton-line {
  height: 0.8rem;
  background: rgba(0, 0, 0, 0.06);

  &--title {
    width: 70%;
    height: 0.95rem;
  }

  &--subtitle {
    width: 40%;
    height: 0.75rem;
  }

  &--text {
    width: 90%;
  }

  &--short {
    width: 55%;
  }

  &--meta {
    width: 60px;
    height: 0.7rem;
  }
}
</style>
