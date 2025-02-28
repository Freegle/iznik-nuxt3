<template>
  <div>
    <div v-if="textbody && textbody !== 'null'" class="textbody">
      <span class="d-none" itemprop="description">{{ description }} </span>
      <Highlighter
        v-if="matchedon"
        :search-words="[matchedon.word]"
        :text-to-highlight="textbody"
        highlight-class-name="highlight"
        auto-escape
      />
      <span v-else>{{ textbody }}</span>
    </div>
    <MessageDeadline :id="id" class="mt-2" />
  </div>
</template>
<script>
import Highlighter from 'vue-highlight-words'
import { useMessageStore } from '~/stores/message'
import { twem } from '~/composables/useTwem'
import MessageDeadline from '~/components/MessageDeadline.vue'

export default {
  components: { MessageDeadline, Highlighter },
  props: {
    id: {
      type: Number,
      required: true,
    },
    matchedon: {
      type: Object,
      required: false,
      default: null,
    },
  },
  setup() {
    const messageStore = useMessageStore()
    return { messageStore }
  },
  computed: {
    clamp() {
      if (this.me) {
        return 2
      } else {
        return 10
      }
    },
    message() {
      return this.messageStore?.byId(this.id)
    },
    textbody() {
      return this.message ? twem(this.message.textbody) : null
    },
    description() {
      // Descriptions that are too long give Google errors.
      return this.message
        ? twem(this.message.textbody)?.substring(0, 160)
        : null
    },
  },
}
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
