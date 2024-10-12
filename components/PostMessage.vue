<template>
  <div>
    <div class="photoholder">
      <label for="uploader" class="d-none d-md-block mt-2">
        Please add photos:
      </label>
      <draggable
        v-model="currentAtts"
        class="d-flex flex-wrap pl-2 mt-2 mb-2"
        :item-key="(el) => `image-${el.id}`"
        :animation="150"
        ghost-class="ghost"
        @start="dragging = true"
        @end="dragging = false"
      >
        <template #header>
          <div class="mr-2 mb-1">
            <OurUploader
              v-if="!dragging"
              :key="bump"
              v-model="currentAtts"
              type="Message"
              multiple
            />
          </div>
        </template>
        <template #item="{ element, index }">
          <div class="bg-transparent p-0">
            <PostPhoto
              :id="element.id"
              :path="element.path"
              :paththumb="element.paththumb"
              :thumbnail="element.thumbnail"
              :externaluid="element.externaluid"
              :ouruid="element.ouruid"
              :externalmods="element.externalmods"
              :primary="index === 0"
              class="mr-1 mt-1 mt-md-0"
              @remove="removePhoto"
            />
          </div>
        </template>
      </draggable>
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
          :size="inputSize"
        />
      </div>
      <PostItem :id="id" ref="item" :type="type" class="item pt-1" />
      <NumberIncrementDecrement
        v-if="type === 'Offer'"
        v-model="availablenow"
        label="Quantity"
        append-text=" available"
        class="count pt-1"
        :size="numberInputSize"
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
        :size="textareaSize"
      />
    </div>
  </div>
</template>
<script setup>
import { uid } from '../composables/useId'
import { useComposeStore } from '../stores/compose'
import NumberIncrementDecrement from './NumberIncrementDecrement'
import { ref, watch } from '#imports'
import { useMiscStore } from '~/stores/misc'

const OurUploader = defineAsyncComponent(() =>
  import('~/components/OurUploader')
)
const PostItem = defineAsyncComponent(() => import('~/components/PostItem'))
const draggable = defineAsyncComponent(() => import('vuedraggable'))

const props = defineProps({
  id: {
    type: Number,
    required: false,
    default: null,
  },
  type: {
    type: String,
    required: true,
  },
})

const composeStore = useComposeStore()

composeStore.setType({
  id: props.id,
  type: props.type,
})

const ret = composeStore.attachments(props.id).filter((a) => 'id' in a)

// Need a separate variable to avoid watching on object causing tizzy.
const currentAtts = ref([])

watch(
  currentAtts,
  (newVal) => {
    try {
      console.log('Current atts changed', props.id, newVal)
      composeStore.setAttachmentsForMessage(props.id, newVal)
    } catch (e) {
      console.error('Watch error', e)
    }
  },
  { deep: true }
)

currentAtts.value = JSON.parse(JSON.stringify(ret || []))

const availablenow = computed({
  get() {
    const msg = composeStore?.message(props.id)
    return msg &&
      'availablenow' in msg &&
      typeof msg.availablenow !== 'undefined'
      ? msg.availablenow
      : 1
  },
  set(newValue) {
    composeStore.setAvailableNow(props.id, newValue)
  },
})

const description = computed({
  get() {
    const msg = composeStore?.message(props.id)
    return msg?.description
  },
  set(newValue) {
    composeStore.setDescription({
      id: props.id,
      description: newValue,
    })
  },
})

const placeholder = computed(() => {
  return props.type === 'Offer'
    ? "e.g. colour, condition, size, whether it's working etc."
    : "Explain what you're looking for, and why you'd like it."
})

function $id(type) {
  return uid(type)
}

const bump = ref(0)

function removePhoto(id) {
  // We just remove it from our store here.  The attachment on the server will get tidied up.
  composeStore.removeAttachment({
    id: props.id,
    photoid: id,
  })

  currentAtts.value = currentAtts.value.filter((a) => a.id !== id)

  if (!currentAtts.value.length) {
    bump.value++
  }
}

const dragging = ref(false)

const miscStore = useMiscStore()

const inputSize = computed(() => (miscStore.breakpoint === 'xs' ? 'md' : 'lg'))
const numberInputSize = computed(() =>
  miscStore.breakpoint === 'xs' ? 'small' : 'normal'
)
const textareaSize = computed(() =>
  miscStore.breakpoint === 'xs' ? 'sm' : 'md'
)
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';

.subject-layout {
  display: grid;
  grid-template-columns: 1fr 25px 1fr;
  grid-template-rows: auto auto;
  grid-column-gap: 5px;

  @include media-breakpoint-up(sm) {
    grid-template-columns: 1fr 50px 1fr;
  }

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
