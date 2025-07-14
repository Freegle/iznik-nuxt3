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
      <MessageFreegled :id="id" summary />
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
    <div :class="classes" :data-id="id" @click="expand">
      <MessageItemLocation
        :id="id"
        :matchedon="matchedon"
        class="header-title"
        :expanded="false"
        :show-location="showLocation"
      />
      <MessageHistory :id="id" summary class="mb-1 header-history" />
      <div
        class="mb-1 header-description"
        :class="{
          noAttachments: !message?.attachments?.length,
        }"
      >
        <MessageDescription
          :id="id"
          :matchedon="matchedon"
          class="d-none d-md-block description"
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
      <div
        class="image-wrapper d-flex justify-content-around mb-2 mb-md-3"
        @click="expandAndAttachments"
      >
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
<script setup>
import { computed } from '#imports'
import { useMessageStore } from '~/stores/message'
import { useAuthStore } from '~/stores/auth'
import MessageItemLocation from '~/components/MessageItemLocation.vue'

const MessageFreegled = defineAsyncComponent(() =>
  import('~/components/MessageFreegled')
)
const MessagePromised = defineAsyncComponent(() =>
  import('~/components/MessagePromised')
)

const emit = defineEmits(['expand', 'attachments'])

const props = defineProps({
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
})

const messageStore = useMessageStore()
const me = useAuthStore().user

const message = computed(() => messageStore?.byId(props.id))

const classes = computed(() => {
  const ret = {
    messagecard: true,
    'test-message-card': true,
    'pb-0': true,
    freegled: message.value?.successful && props.showFreegled,
    offer: message.value?.type === 'Offer',
    wanted: message.value?.type === 'Wanted',
    clickme: !message.value?.successful,
    promisedfade:
      props.showPromised &&
      message.value?.promised &&
      props.replyable &&
      !message.value?.promisedtome &&
      !message.value?.successful,
    noAttachments: !message.value?.attachments?.length,
  }

  if (props.bgClass) {
    ret[props.bgClass] = true
  }

  return ret
})

const view = async () => {
  if (me && message.value?.unseen) {
    await messageStore.view(props.id)
  }
}

const expand = (e) => {
  if (message.value) {
    emit('expand')

    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
  }
}

const expandAndAttachments = (e) => {
  // This is a slightly different case because on My Posts we want to trigger an image zoom (there is no expand
  // on My Posts).
  if (message.value) {
    emit('expand')
    emit('attachments')

    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
  }
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
  grid-template-rows: 1fr min-content;

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
    grid-row: 3 / 4;

    @include media-breakpoint-up(md) {
      grid-column: 2 / 3;
      grid-row: 2 / 3;
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
    grid-row: 5 / 6;

    @include media-breakpoint-up(md) {
      grid-column: 1 / 2;
      grid-row: 1 / 5;
      width: unset;
    }
  }

  .header-expand {
    grid-column: 1 / 2;
    grid-row: 6 / 7;
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
