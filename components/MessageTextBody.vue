<template>
  <div>
    <Highlighter
      v-if="message.matchedon"
      :search-words="[message.matchedon.word]"
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
<script>
import { twem } from '~/composables/useTwem'
import { useMessageStore } from '~/stores/message'

const Highlighter = () => import('vue-highlight-words')

export default {
  components: { Highlighter },
  props: {
    id: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const messageStore = useMessageStore()

    return { messageStore }
  },
  computed: {
    message() {
      return this.messageStore.byId(this.id)
    },
    safeBody() {
      return twem(this.message.textbody)
    },
  },
}
</script>
<style scoped lang="scss">
.highlight {
  color: $color-orange--dark;
  background-color: initial;
  padding: 0;
}
</style>
