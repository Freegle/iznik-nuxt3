<template>
  <div>
    <Highlighter
      v-if="message.matchedon"
      :search-words="[String(message.matchedon.word)]"
      :text-to-highlight="message.textbody"
      highlight-class-name="highlight"
      auto-escape
      class="prewrap"
    />
    <span v-else class="prewrap forcebreak font-weight-bold">{{
      safeBody
    }}</span>
  </div>
</template>
<script setup>
import { computed } from 'vue'
import Highlighter from 'vue-highlight-words'
import { twem } from '~/composables/useTwem'
import { useMessageStore } from '~/stores/message'

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
})

const messageStore = useMessageStore()

const message = computed(() => {
  return messageStore?.byId(props.id)
})

const safeBody = computed(() => {
  return twem(message.value.textbody)
})
</script>
<style scoped lang="scss">
.highlight {
  color: $color-orange--dark;
  background-color: initial;
  padding: 0;
}
</style>
