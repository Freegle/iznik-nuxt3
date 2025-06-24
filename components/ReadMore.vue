<template>
  <div>
    <p>
      {{ formattedString }}
      <span v-show="text.length > maxChars">
        <a
          v-show="!isReadMore"
          id="readmore"
          :href="link"
          @click="triggerReadMore($event, true)"
          >{{ moreStr }}</a
        >
        <a
          v-show="isReadMore"
          id="readmore"
          :href="link"
          @click="triggerReadMore($event, false)"
          >{{ lessStr }}</a
        >
      </span>
    </p>
  </div>
</template>
<script setup>
// Based on https://github.com/avxkim/read-more but removing use of v-html which allows escape attacks.
import { ref, computed } from 'vue'

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
    type: String,
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
})

const isReadMore = ref(false)

const formattedString = computed(() => {
  let valContainer = props.text

  if (!isReadMore.value && props.text.length > props.maxChars) {
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
