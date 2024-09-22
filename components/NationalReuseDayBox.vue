<template>
  <div class="box-wrapper d-flex justify-content-around" :title="title">
    <ExternalLink :href="url">
      <div
        :class="boxClass"
        class="box"
        :style="
          'background-image: url(' +
          image +
          '); background-size: cover; background-repeat: no-repease; background-position: center center'
        "
      ></div>
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
  image: {
    type: String,
    required: false,
    default: '',
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
  width: 120px;
  height: 90px;
  align-content: center;

  @include media-breakpoint-up(md) {
    width: 200px;
    height: 150px;
  }

  @include media-breakpoint-up(xl) {
    width: 200px;
    height: 150px;
  }
}

p {
  font-size: 0.9rem;
  width: 120px;

  @include media-breakpoint-up(md) {
    width: 150px;
  }

  @include media-breakpoint-up(xl) {
    width: 200px;
  }
}

.box-wrapper {
  width: 120px;

  @include media-breakpoint-up(md) {
    width: 150px;
  }

  @include media-breakpoint-up(xl) {
    width: 200px;
  }
}

h2 {
  color: black !important;
  background-color: #f7f5ef !important;
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
