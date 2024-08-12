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
<script>
// Originally based on https://github.com/orlyyani/read-more
import Highlighter from 'vue-highlight-words'

export default {
  components: {
    Highlighter,
  },
  props: {
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
  },

  data() {
    return {
      isReadMore: false,
    }
  },

  computed: {
    formattedString() {
      let valContainer = this.text

      if (!this.isReadMore && this.text && this.text.length > this.maxChars) {
        valContainer = valContainer.substring(0, this.maxChars) + '...'
      }

      return valContainer
    },
  },

  methods: {
    triggerReadMore(e, b) {
      if (this.link === '#') {
        e.preventDefault()
      }
      if (this.lessStr !== null || this.lessStr !== '') this.isReadMore = b
    },
  },
}
</script>
<style scoped lang="scss">
:deep(.highlight) {
  color: $color-blue--base !important;
  background-color: initial !important;
}
</style>
