<template>
  <div v-if="textbody && textbody !== 'null'" class="textbody">
    <Highlighter
      v-if="matchedon"
      :search-words="[matchedon.word]"
      :text-to-highlight="textbody"
      highlight-class-name="highlight"
      auto-escape
    />
    <span v-else itemprop="description">{{ textbody }}</span>
  </div>
</template>
<script>
import Highlighter from 'vue-highlight-words'
import { useMessageStore } from '~/stores/message'
import { twem } from '~/composables/useTwem'

export default {
  components: { Highlighter },
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
      return this.messageStore.byId(this.id)
    },
    textbody() {
      return this.message ? twem(this.message.textbody) : null
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
