<template>
  <b-modal
    ref="modal"
    scrollable
    size="xl"
    no-trap
    hide-header
    :fullscreen="showImagesProxy ? true : 'lg-down'"
    class="hide-footer message-modal"
    body-class="p-0"
    dialog-class="message-modal-dialog"
    content-class="message-modal-content"
    @shown="bumpMessage++"
  >
    <template #default>
      <div v-if="message" class="message-content-wrapper">
        <div v-if="showImagesProxy">
          <div>
            <b-button
              variant="primary"
              size="md"
              class="w-100 d-block d-md-none"
              block
              @click="showImagesProxy = false"
            >
              <v-icon icon="angle-double-left" /> Back to description
            </b-button>
          </div>
          <ImageCarousel
            v-if="message?.attachments?.length"
            :message-id="id"
            :attachments="message.attachments"
          />
          <hr />
          <div class="d-flex justify-content-around p-2 mb-2 p-md-0 mb-md-0">
            <div>
              <b-button
                variant="secondary"
                size="lg"
                class="d-none d-md-block"
                block
                @click="showImagesProxy = false"
              >
                Close
              </b-button>
            </div>
          </div>
        </div>
        <MessageExpanded
          v-else-if="bumpMessage"
          :id="id"
          :key="bumpMessage"
          :replyable="replyable"
          :hide-close="hideClose"
          :actions="actions"
          class="ml-md-2 mr-md-2 mt-md-2 ml-0 mr-0 mt-0"
          in-modal
          @close="hide"
        />
      </div>
      <div
        v-else
        class="d-flex flex-column -justify-content-around align-content-center"
      >
        <Spinner :size="50" />
      </div>
    </template>
  </b-modal>
</template>
<script setup>
import { computed, ref, defineAsyncComponent } from 'vue'
import { useMessageStore } from '~/stores/message'
import { useOurModal } from '~/composables/useOurModal'
import ImageCarousel from '~/components/ImageCarousel'

const MessageExpanded = defineAsyncComponent(() =>
  import('~/components/MessageExpanded')
)

const messageStore = useMessageStore()

const props = defineProps({
  // model
  showImages: {
    type: Boolean,
    required: false,
    default: false,
  },
  id: {
    type: Number,
    required: true,
  },
  hideClose: {
    type: Boolean,
    required: false,
    default: false,
  },
  replyable: {
    type: Boolean,
    required: false,
    default: true,
  },
  actions: {
    type: Boolean,
    required: false,
    default: true,
  },
})

const emit = defineEmits(['update:showImages'])

const { modal, hide } = useOurModal()

const bumpMessage = ref(0)

const message = computed(() => {
  return messageStore.byId(props.id)
})

const showImagesProxy = computed({
  get() {
    return props.showImages ?? false
  },

  set(value) {
    emit('update:showImages', value)
  },
})
</script>

<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';

.close {
  top: -15px;
  right: -15px;
  position: absolute;
  z-index: 10000;
  opacity: 1;
  background-color: white;
  border-radius: 50%;

  @include media-breakpoint-down(sm) {
    top: 3px;
    right: 3px;
  }
}

:deep(.carousel-caption) {
  position: unset !important;
  padding-top: 0px !important;
  padding-bottom: 0px !important;
}

:deep(.carousel-item.active) {
  background-color: transparent !important;
}

.maybeAd {
  visibility: hidden;

  @media only screen and (min-width: 386px) {
    visibility: visible;
    height: 50px;
    width: 320px;
  }
}

.noborder {
  border: none !important;
  border-color: $color-white !important;
}

.layout {
  display: grid;
  width: 100%;
  align-items: center;
  grid-template-rows: 1fr;
  grid-template-columns: calc(100% - 5rem) 5rem;

  .closebutton {
    max-width: 5rem;
    align-content: end;
  }
}
</style>

<style lang="scss">
@import 'assets/css/_color-vars.scss';

/* Global styles for message modal - always near-full height */
.message-modal-dialog {
  height: 96vh;
  margin-top: 2vh;
  margin-bottom: 2vh;
}

.message-modal-content {
  height: 100%;
  overflow: hidden;
  padding: 0.5rem;
  background: $color-white;
  position: relative;
}

/* Ensure body fills content */
.message-modal .modal-body {
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Wrapper div for conditional content - fill flex parent */
.message-content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}
</style>
