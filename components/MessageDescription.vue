<template>
  <div>
    <div v-if="textbody && textbody !== 'null'" class="textbody">
      <span class="d-none" itemprop="description">{{ description }} </span>
      <Highlighter
        v-if="matchedon"
        :search-words="[String(matchedon.word)]"
        :text-to-highlight="textbody"
        highlight-class-name="highlight"
        auto-escape
      />
      <span v-else>{{ textbody }}</span>
    </div>
    <MessageDeadline :id="id" class="mt-2" />
  </div>
</template>
<script setup>
import { computed } from 'vue'
import Highlighter from 'vue-highlight-words'
import { useMessageStore } from '~/stores/message'
import { twem } from '~/composables/useTwem'
import MessageDeadline from '~/components/MessageDeadline.vue'

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
  matchedon: {
    type: Object,
    required: false,
    default: null,
  },
})

const messageStore = useMessageStore()

const message = computed(() => {
  return messageStore?.byId(props.id)
})

const textbody = computed(() => {
  return message.value ? twem(message.value.textbody) : null
})

const description = computed(() => {
  // Descriptions that are too long give Google errors.
  return message.value ? twem(message.value.textbody)?.substring(0, 160) : null
})
</script>
<style scoped lang="scss">
.textbody {
  font-size: 1.25rem;
  word-break: break-word !important;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
