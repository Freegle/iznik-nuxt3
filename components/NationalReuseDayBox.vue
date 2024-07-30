<template>
  <div class="box-wrapper">
    <ExternalLink :href="url">
      <div class="box" :class="boxClass">
        <div class="button">
          <h2 class="text-center">{{ title }}</h2>
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
  title: String,
  description: String,
  url: String,
  colour: String,
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
  width: 200px;
  height: 150px;
  align-content: center;
}

.box-wrapper {
  width: 200px;
}

h2 {
  color: white !important;
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
