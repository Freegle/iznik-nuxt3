<template>
  <div>
    <div class="d-flex flex-wrap">
      <div class="photoholder">
        <label for="uploader" class="d-none d-md-block mt-2">
          Please add photos:
        </label>
        <OurUploader
          id="uploader"
          :key="'uploader-' + uploaderBump"
          v-model="attachments"
          :multiple="true"
        />
      </div>
      <hr />
    </div>
    <div class="subject-layout mb-1 mt-1">
      <div class="d-flex flex-column">
        <label :for="$id('posttype')" class="d-none d-md-block pl-1">
          Type</label
        >
        <b-form-input
          :id="$id('posttype')"
          :model-value="type"
          disabled
          class="type text-uppercase bg-white mt-1"
          size="lg"
        />
      </div>
      <PostItem :id="id" ref="item" :type="type" class="item pt-1" />
      <NumberIncrementDecrement
        v-if="type === 'Offer'"
        v-model="availablenow"
        label="Quantity"
        append-text=" available"
        class="count pt-1"
      />
    </div>
    <div class="d-flex flex-column mt-2">
      <label :for="$id('description')" class="mb-1"
        >Please give a few details:</label
      >
      <b-form-textarea
        :id="$id('description')"
        v-model="description"
        :placeholder="placeholder"
        class="description"
      />
    </div>
  </div>
</template>
<script>
import { uid } from '../composables/useId'
import { useComposeStore } from '../stores/compose'
import { useMessageStore } from '../stores/message'
import { useMiscStore } from '../stores/misc'
import NumberIncrementDecrement from './NumberIncrementDecrement'
import { useImageStore } from '~/stores/image'

const OurUploader = defineAsyncComponent(() =>
  import('~/components/OurUploader')
)
const PostItem = defineAsyncComponent(() => import('~/components/PostItem'))

export default {
  components: {
    NumberIncrementDecrement,
    OurUploader,
    PostItem,
  },
  props: {
    id: {
      type: Number,
      required: false,
      default: null,
    },
    type: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const composeStore = useComposeStore()
    const messageStore = useMessageStore()
    const imageStore = useImageStore()

    composeStore.setType({
      id: props.id,
      type: props.type,
    })

    return { composeStore, messageStore, imageStore }
  },
  data() {
    return {
      uploaderBump: 0,
      showDraggable: false,
    }
  },
  computed: {
    breakpoint() {
      const store = useMiscStore()
      return store.getBreakpoint
    },
    availablenow: {
      get() {
        const msg = this.composeStore?.message(this.id)
        return msg &&
          'availablenow' in msg &&
          typeof msg.availablenow !== 'undefined'
          ? msg.availablenow
          : 1
      },
      set(newValue) {
        this.composeStore.setAvailableNow(this.id, newValue)
      },
    },
    description: {
      get() {
        const msg = this.composeStore?.message(this.id)
        return msg?.description
      },
      set(newValue) {
        this.composeStore.setDescription({
          id: this.id,
          description: newValue,
        })
      },
    },
    attachments: {
      get() {
        const ret = this.composeStore
          ?.attachments(this.id)
          .filter((a) => 'id' in a)

        console.log('Compute atts from store', ret)
        return ret || []
      },
      set(value) {
        // The uploader has updated the list of attachments.  Update the attachments for the message in the store.
        console.log('Set message attachments', value)
        return this.composeStore?.setAttachmentsForMessage(this.id, value)
      },
    },
    placeholder() {
      return this.type === 'Offer'
        ? "e.g. colour, condition, size, whether it's working etc."
        : "Explain what you're looking for, and why you'd like it."
    },
  },
  mounted() {
    // This is a workaround for a problem I don't properly understand, where loading the /give page in dev
    // throws a tizzy.
    setTimeout(() => {
      this.showDraggable = true
    }, 1)
  },
  methods: {
    $id(type) {
      return uid(type)
    },
  },
}
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';

.subject-layout {
  display: grid;
  grid-template-columns: 1fr 50px 1fr;
  grid-template-rows: auto auto;
  grid-column-gap: 5px;

  @include media-breakpoint-up(md) {
    grid-template-columns: 1fr 3fr auto;
    grid-template-rows: auto;
  }

  .type {
    grid-column: 1 / 2;
    grid-row: 1 / 2;

    @include media-breakpoint-up(md) {
      grid-column: 1 / 2;
      grid-row: 1 / 2;
    }
  }

  .item {
    grid-column: 1 / 4;
    grid-row: 2 / 3;

    @include media-breakpoint-up(md) {
      grid-column: 2 / 3;
      grid-row: 1 / 2;
    }
  }

  .count {
    grid-column: 3 / 4;
    grid-row: 1 / 2;
    justify-self: end;

    @include media-breakpoint-up(md) {
      grid-column: 3 / 4;
      grid-row: 1 / 2;
    }
  }
}

.photoholder {
  min-height: max(100px, 15vh);
  width: 100%;

  @include media-breakpoint-up(md) {
    min-height: unset;
  }
}

.ghost {
  opacity: 0.5;
}

.description {
  min-height: max(100px, 15vh);
  max-height: min(300px, 25vh);
}

:deep(.count label) {
  display: none;

  @include media-breakpoint-up(md) {
    display: inline;
  }
}
</style>
