<template>
  <div>
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
</template>
<script>
import { useMessageStore } from '../stores/message'

export default {
  props: {
    id: {
      type: Number,
      required: true,
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
.freegled__image {
  position: absolute;
  width: 225px;
  z-index: 2;
  transform: rotate(15deg);
  top: 30%;

  // Centre the absolute positioned div in its container
  left: 50%;
  margin-left: -125px;
}
</style>
