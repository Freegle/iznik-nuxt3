<template>
  <span>
    <Highlighter
      v-if="text"
      :search-words="searchWords"
      :text-to-highlight="formattedString"
      highlight-class-name="highlight"
      class="nopara"
      auto-escape
    />

    <span v-show="text && text.length > maxChars">
      <a
        v-show="!isReadMore"
        id="readmore"
        class="highlight"
        :href="link"
        @click="triggerReadMore($event, true)"
        >{{ moreStr }}</a
      >
      <a
        v-show="isReadMore"
        id="readmore"
        class="highlight"
        :href="link"
        @click="triggerReadMore($event, false)"
        >{{ lessStr }}</a
      >
    </span>
  </span>
</template>
<script setup>
// Originally based on https://github.com/orlyyani/read-more
import { ref, computed } from 'vue'
import Highlighter from 'vue-highlight-words'

const props = defineProps({
  moreStr: {
    type: String,
    default: 'read more',
  },
  lessStr: {
    type: String,
    default: '',
  },
  text: {
    validator: (prop) => typeof prop === 'string' || prop === null,
    required: true,
  },
  link: {
    type: String,
    default: '#',
  },
  maxChars: {
    type: Number,
    default: 100,
  },
  searchWords: {
    type: Array,
    required: true,
  },
  highlightClassName: {
    type: String,
    required: false,
    default: 'highlight',
  },
})

const isReadMore = ref(false)

const formattedString = computed(() => {
  let valContainer = props.text

  if (!isReadMore.value && props.text && props.text.length > props.maxChars) {
    valContainer = valContainer.substring(0, props.maxChars) + '...'
  }

  return valContainer
})

function triggerReadMore(e, b) {
  if (props.link === '#') {
    e.preventDefault()
  }
  if (props.lessStr !== null || props.lessStr !== '') isReadMore.value = b
}
</script>
<style scoped lang="scss">
:deep(.highlight) {
  color: $color-blue--base !important;
  background-color: initial !important;
}
</style>
