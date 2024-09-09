<template>
  <div class="promised" @click="$emit('click')">
    <div v-if="summary">
      <b-img lazy src="/promised.jpg" class="promised__image" />
      <b-popover
        v-if="message.fromuser !== myid"
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
      <notice-message v-if="!toMe" variant="warning">
        This item has already been promised to someone. You can still reply, but
        you'll probably only get it if someone else drops out.
      </notice-message>
      <notice-message v-else variant="primary">
        This has been promised to you.
      </notice-message>
    </div>
  </div>
</template>
<script>
import { useMessageStore } from '~/stores/message'

export default {
  props: {
    id: {
      type: Number,
      required: true,
    },
    toMe: {
      type: Boolean,
      required: false,
      default: false,
    },
    summary: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  setup() {
    const messageStore = useMessageStore()

    return { messageStore }
  },
  data: function () {
    return {
      scrollHandler: null,
      showing: false,
    }
  },
  computed: {
    title() {
      if (!this.toMe) {
        return "This item has already been promised to someone. You can still reply, but you'll probably only get it if someone else drops out."
      } else {
        return 'This has been promised to you.'
      }
    },
    message() {
      return this.messageStore?.byId(this.id)
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

.promised__image {
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
