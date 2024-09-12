<template>
  <div class="box-wrapper">
    <ExternalLink :href="url">
      <div :class="boxClass" class="box">
        <div class="button">
          <h2 class="text-center mb-0 ms-2 me-2">
            {{ title }}
          </h2>
        </div>
      </div>
      <p class="text-center mt-2 font-weight-normal">
        {{ description }}
      </p>
    </ExternalLink>
  </div>
</template>
<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  colour: {
    type: String,
    required: true,
  },
})

const boxClass = computed(() => {
  const ret = {}
  ret[props.colour] = true
  return ret
})
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';

.box {
  border-radius: 10px;
  border: 3px solid white;
  padding: 10px;
  width: 150px;
  height: 100px;
  align-content: center;

  @include media-breakpoint-up(md) {
    width: 200px;
    height: 150px;
  }
}

p {
  font-size: 0.75rem;
  width: 150px;

  @include media-breakpoint-up(md) {
    width: 200px;
  }
}

.box-wrapper {
  width: 200px;
}

h2 {
  color: black !important;
  background-color: white !important;
  box-shadow: 0 0 9px 10px white;
  font-size: 1rem;

  @include media-breakpoint-up(md) {
    font-size: 1rem;
  }
}

:deep(.magenta) {
  background-color: #ff66c4;
}

.blue {
  background-color: #38b6ff;
}

.purple {
  background-color: #8c52ff;
}

.gold {
  background-color: #ffd21d;
}

.orange {
  background-color: #ffad4d;
}

.teal {
  background-color: #10bbb0;
}

:deep(a) {
  color: unset;
  text-decoration: none;
}
</style>
