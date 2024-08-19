<template>
  <div
    v-if="message"
    :id="'msg-' + id"
    v-observe-visibility="{
      callback: view,
      options: {
        observeFullElement: true,
      },
    }"
    class="position-relative"
  >
    <template v-if="message.successful && showFreegled">
      <MessageFreegled :id="id" />
    </template>
    <template v-else-if="message.promised && showPromised">
      <MessagePromised
        :id="id"
        summary
        class="clickme"
        :to-me="message.promisedtome"
        @click="expand"
      />
    </template>
    <div :class="classes" @click="expand">
      <MessageItemLocation
        :id="id"
        :matchedon="matchedon"
        class="header-title"
        :expanded="false"
        :show-location="showLocation"
      />
      <MessageHistory :id="id" summary class="mb-1 header-history" />
      <div class="mb-1 header-description">
        <MessageDescription
          :id="id"
          :matchedon="matchedon"
          class="d-none d-md-block"
        />
      </div>
      <div
        v-if="!message.successful && replyable"
        class="header-expand mt-2 mt-sm-0 d-none d-md-block"
      >
        <client-only>
          <b-button variant="primary" class="mt-2 mb-2" @click="expand">
            {{ expandButtonText }}
          </b-button>
        </client-only>
      </div>
      <div class="image-wrapper" @click="expandAndAttachments">
        <MessageAttachments
          :id="id"
          :attachments="message.attachments"
          :disabled="message.successful"
          thumbnail
          :preload="preload"
        />
      </div>
    </div>
  </div>
</template>
<script>
import { useMessageStore } from '~/stores/message'
const MessageFreegled = defineAsyncComponent(() =>
  import('~/components/MessageFreegled')
)
const MessagePromised = defineAsyncComponent(() =>
  import('~/components/MessagePromised')
)
const MessageItemLocation = defineAsyncComponent(() =>
  import('~/components/MessageItemLocation')
)

export default {
  components: {
    MessageFreegled,
    MessagePromised,
    MessageItemLocation,
  },
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
    expandButtonText: {
      type: String,
      required: false,
      default: 'See details and reply',
    },
    replyable: {
      type: Boolean,
      required: false,
      default: true,
    },
    bgClass: {
      type: String,
      required: false,
      default: null,
    },
    showFreegled: {
      type: Boolean,
      required: false,
      default: true,
    },
    showPromised: {
      type: Boolean,
      required: false,
      default: true,
    },
    showLocation: {
      type: Boolean,
      required: false,
      default: true,
    },
    preload: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  setup() {
    const messageStore = useMessageStore()
    return { messageStore }
  },
  data() {
    return {}
  },
  computed: {
    message() {
      return this.messageStore?.byId(this.id)
    },
    classes() {
      const ret = {
        messagecard: true,
        'pb-0': true,
        freegled: this.message?.successful && this.showFreegled,
        offer: this.message.type === 'Offer',
        wanted: this.message.type === 'Wanted',
        clickme: !this.message?.successful,
        promisedfade:
          this.showPromised &&
          this.message?.promised &&
          this.replyable &&
          !this.message?.promisedtome &&
          !this.message?.successful,
      }

      if (this.bgClass) {
        ret[this.bgClass] = true
      }

      return ret
    },
  },
  methods: {
    async view() {
      if (this.me && this.message?.unseen) {
        await this.messageStore.view(this.id)
      }
    },
    expand(e) {
      if (this.message) {
        this.$emit('expand')

        if (e) {
          e.preventDefault()
          e.stopPropagation()
        }
      }
    },
    expandAndAttachments(e) {
      // This is a slightly different case because on My Posts we want to trigger an image zoom (there is no expand
      // on My Posts).
      if (this.message) {
        this.$emit('expand')
        this.$emit('attachments')

        if (e) {
          e.preventDefault()
          e.stopPropagation()
        }
      }
    },
  },
}
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';
@import 'assets/css/message-images.scss';

.card-body {
  padding: 0px;
}

.promisedfade {
  filter: contrast(50%);
}

.messagecard {
  padding: 10px;
  border-radius: 4px;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2);
  border: solid 1px $color-gray--light;

  display: grid;
  align-items: start;
  grid-template-columns: minmax(0, 1fr);

  @include media-breakpoint-up(md) {
    padding: 16px;
    grid-template-columns: $thumbnail-size-md 1fr;
    grid-column-gap: 1rem;
    grid-template-rows: max-content max-content max-content auto auto auto;
  }

  &.offer {
    background-color: $color-white;
  }

  &.wanted {
    background-color: $color-green--light;
  }

  .header-title {
    grid-column: 1 / 2;
    grid-row: 1 / 2;

    @include media-breakpoint-up(md) {
      grid-column: 2 / 3;
    }
  }

  .header-history {
    grid-column: 1 / 2;
    grid-row: 2 / 3;

    @include media-breakpoint-up(md) {
      grid-column: 2 / 3;
    }
  }

  .header-description {
    grid-column: 1 / 2;
    grid-row: 4 / 5;

    @include media-breakpoint-up(md) {
      grid-column: 2 / 3;
      grid-row: 3 / 4;
    }
  }

  .image-wrapper {
    position: relative;

    grid-column: 1 / 2;
    grid-row: 3 / 4;

    @include media-breakpoint-up(md) {
      grid-column: 1 / 2;
      grid-row: 1 / 5;
      width: unset;
    }
  }

  .header-expand {
    grid-column: 1 / 2;
    grid-row: 5 / 6;
    align-self: end;
    justify-self: end;

    @include media-breakpoint-up(md) {
      grid-column: 2 / 3;
      grid-row: 4 / 5;
    }
  }
}

.freegled {
  filter: contrast(50%);
}
</style>
