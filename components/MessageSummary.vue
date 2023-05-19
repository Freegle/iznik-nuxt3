<template>
  <div :id="'msg-' + id" class="position-relative">
    <template v-if="message.successful">
      <MessageFreegled :id="id" />
    </template>
    <template v-else-if="message.promised">
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
        class="mb-1 header-title"
        :expanded="false"
      />
      <MessageHistory
        :id="id"
        class="mb-1 header-history"
        display-message-link
      />
      <div class="mb-1 header-description">
        <div
          v-if="!message.attachments || !message.attachments?.length"
          class="d-flex d-md-none"
          @click="zoom"
        >
          <MessageTag :id="id" class="ps-2 pe-2" inline />
          <div class="flex-grow-1" />
        </div>
        <MessageDescription :id="id" :matchedon="matchedon" />
      </div>
      <div
        v-if="!message.successful && replyable"
        class="header-expand mt-2 mt-sm-0"
      >
        <b-button variant="primary" class="mt-2" @click="expand">
          {{ expandButtonText }}
        </b-button>
      </div>
      <div class="image-wrapper" @click="zoom">
        <MessageAttachments
          :id="id"
          :attachments="message.attachments"
          :disabled="message.successful"
          thumbnail
        />
      </div>
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
        freegled: this.message.successful,
        offer: this.message.type === 'Offer',
        wanted: this.message.type === 'Wanted',
        clickme: !this.message.successful,
        promisedfade:
          this.message.promised &&
          this.replyable &&
          !this.message.promisedtome &&
          !this.message.successful,
        'p-2': true,
        'p-sm-3': true,
      }

      if (this.bgClass) {
        ret[this.bgClass] = true
      }

      return ret
    },
  },
  methods: {
    expand() {
      this.$emit('expand')
    },
    zoom(e) {
      if (this.message) {
        if (!this.message.attachments || !this.message.attachments?.length) {
          // No photos - show the description.
          this.$emit('expand')
        } else {
          this.$emit('zoom')
        }

        e.preventDefault()
        e.stopPropagation()
      }
    },
  },
}
</script>
<style scoped lang="scss">
@import '~bootstrap/scss/functions';
@import '~bootstrap/scss/variables';
@import '~bootstrap/scss/mixins/_breakpoints';

.card-body {
  padding: 0px;
}

.promisedfade {
  filter: contrast(50%);
}

.messagecard {
  padding: 16px;
  border-radius: 4px;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2);
  border: solid 1px $color-gray--light;

  display: grid;
  align-items: start;
  grid-template-columns: minmax(0, 1fr);

  @include media-breakpoint-up(sm) {
    grid-template-columns: 200px 1fr;
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

    @include media-breakpoint-up(sm) {
      grid-column: 2 / 3;
    }
  }

  .header-history {
    grid-column: 1 / 2;
    grid-row: 2 / 3;

    @include media-breakpoint-up(sm) {
      grid-column: 2 / 3;
    }
  }

  .header-description {
    grid-column: 1 / 2;
    grid-row: 4 / 5;

    @include media-breakpoint-up(sm) {
      grid-column: 2 / 3;
      grid-row: 3 / 4;
    }
  }

  .image-wrapper {
    position: relative;

    grid-column: 1 / 2;
    grid-row: 3 / 4;

    @include media-breakpoint-up(sm) {
      grid-column: 1 / 2;
      grid-row: 1 / 5;
      width: unset;
    }

    &.noattachments {
      display: none;

      @include media-breakpoint-up(md) {
        display: block;
      }
    }
  }

  .header-expand {
    grid-column: 1 / 2;
    grid-row: 5 / 6;
    align-self: end;
    justify-self: end;

    @include media-breakpoint-up(sm) {
      grid-column: 2 / 3;
      grid-row: 4 / 5;
    }
  }
}

.freegled {
  filter: contrast(50%);
}
</style>
