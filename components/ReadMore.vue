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
<script>
// Based on https://github.com/avxkim/read-more but removing use of v-html which allows escape attacks.

export default {
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
  },

  data() {
    return {
      isReadMore: false,
    }
  },

  computed: {
    formattedString() {
      let valContainer = this.text

      if (!this.isReadMore && this.text.length > this.maxChars) {
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
