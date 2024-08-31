<template>
  <div class="freegleg">
    <div v-if="summary">
      <b-img lazy src="/freegled.jpg" class="freegled__image" />
      <b-popover
        v-model="showing"
        :content="title"
        placement="top"
        variant="primary"
        triggers="hover"
        :target="'msg-' + id"
        custom-class="primary"
        @shown="shown"
        @hidden="hidden"
      />
    </div>
    <div v-else>
      <notice-message variant="warning">
        This item has already been successfully freegled.
      </notice-message>
    </div>
  </div>
</template>
<script>
import { useMessageStore } from '../stores/message'

export default {
  props: {
    id: {
      type: Number,
      required: true,
    },
    summary: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  setup() {
    const messageStore = useMessageStore()

    return {
      messageStore,
    }
  },
  data: function () {
    return {
      scrollHandler: null,
      showing: false,
    }
  },

  computed: {
    message() {
      return this.messageStore?.byId(this.id)
    },
    title() {
      let ret = null

      if (this.message.type === 'Offer') {
        ret = 'Yay, someone took it!'
      } else {
        ret = 'Hurray, they got what they were looking for!'
      }

      ret += " Don't forget to Mark your posts as TAKEN/RECEIVED from My Posts."

      return ret
    },
  },
  beforeUnmount() {
    if (this.scrollHandler) {
      window.removeEventListener('scroll', this.scrollHandler)
      this.scrollHandler = null
    }
  },
  methods: {
    shown() {
      if (!this.scrollHandler) {
        this.scrollHandler = window.addEventListener(
          'scroll',
          this.handleScroll
        )
      }
    },
    hidden() {
      if (this.scrollHandler) {
        window.removeEventListener('scroll', this.scrollHandler)
        this.scrollHandler = null
      }
    },
    handleScroll() {
      this.showing = false
    },
  },
}
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/_functions';
@import 'bootstrap/scss/_variables';
@import 'bootstrap/scss/mixins/_breakpoints';

.freegled__image {
  position: absolute;
  z-index: 2;
  transform: rotate(15deg);
  top: 50%;
  left: 50%;

  width: 150px;
  margin-left: -75px;

  @include media-breakpoint-up(md) {
    width: 225px;
    margin-left: -125px;
  }
}
</style>
