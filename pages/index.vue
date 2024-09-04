<template>
  <div
    v-if="!me"
    class="grid m-0 pl-1 pr-1 pl-sm-0 pr-sm-0 mt-0 mt-lg-5 ml-2 mr-2"
  >
    <div class="info">
      <h1 class="text--largest-responsive">
        Edit this line and see if the HMR works.
      </h1>
    </div>
  </div>
</template>
<script>
export default {}
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';

.black {
  color: $color-black !important;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  grid-template-rows: 0px 1fr 60px minmax(50px, auto);

  @include media-breakpoint-up(sm) {
    grid-template-columns: 0.4fr 0.6fr;
    grid-template-rows: 100px auto auto auto;
    grid-column-gap: 50px;
    grid-row-gap: 30px;
  }
}

.map {
  grid-row: 3 / 4;
  grid-column: 1 / 3;

  @include media-breakpoint-up(sm) {
    height: 300px;
  }

  @include media-breakpoint-up(lg) {
    grid-row: 1 / 3;
    grid-column: 1 / 2;
    // 100vh includes the header and margins etc so they need to be taken off
    height: calc(100vh - 150px);
    max-height: 800px;
  }
}

.info {
  grid-row: 1 / 3;
  grid-column: 1 / 3;
  text-align: center;
  justify-self: center;

  @include media-breakpoint-up(lg) {
    grid-column: 2 / 3;
    text-align: left;
  }
}

.app-download {
  grid-row: 3 / 4;
  grid-column: 1 / 3;
  justify-self: center;

  @include media-breakpoint-up(sm) {
    grid-row: 4 / 5;
  }

  @include media-breakpoint-up(lg) {
    grid-row: 3 / 4;
  }
}

.app-download__image {
  max-height: 25px;

  @include media-breakpoint-up(lg) {
    max-height: 40px;
  }
}

.thefooter {
  grid-row: 4 / 5;
  grid-column: 1 / 3;

  @include media-breakpoint-up(sm) {
    grid-row: 5 / 6;
  }

  @include media-breakpoint-up(lg) {
    grid-row: 4 / 5;
  }
}

.shadow {
  box-shadow: 0px 0px 20px 10px grey !important;

  @include media-breakpoint-down(md) {
    box-shadow: 0px 0px 10px 5px grey !important;
  }

  @include media-breakpoint-down(md) {
    box-shadow: none;
  }
}

.iconlarge {
  min-width: 48px;
}

.explore {
  padding-top: 9px;
  padding-bottom: 9px;
}

main {
  margin-top: 0px;
}
</style>
