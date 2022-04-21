<template>
  <div v-if="textbody && textbody !== 'null'" v-line-clamp="2" class="textbody">
    <Highlighter
      v-if="me && matchedon"
      :search-words="[matchedon.word]"
      :text-to-highlight="textbody"
      highlight-class-name="highlight"
      auto-escape
    />
    <span v-else itemprop="description">{{ textbody }}</span>
  </div>
</template>
<script>
import { useMessageStore } from '~/stores/message'
import twem from '~/mixins/twem'

const Highlighter = () => import('vue-highlight-words')

export default {
  components: { Highlighter },
  mixins: [twem],
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
  setup(props) {
    const messageStore = useMessageStore()
    const me = useMe()

    useAsyncData('message-' + props.id, () => messageStore.fetch(props.id))

    return { me, messageStore }
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
      return this.message ? this.twem(this.message.textbody) : null
    },
  },
}
</script>
<style scoped lang="scss">
@import 'color-vars';

.textbody {
  font-size: 1.25rem;
  word-break: break-word !important;
}
</style>
