<template>
  <div>
    <client-only>
      <b-modal
        id="messagemodal"
        v-model="showModal"
        size="lg"
        class="hide-footer"
        body-class="p-0 p-md-3"
        @shown="shown"
      >
        <template #default>
          <div v-if="message">
            <div v-if="showImages">
              <ImageCarousel
                :message-id="id"
                :attachments="message.attachments"
              />
              <hr />
              <div
                class="d-flex justify-content-between p-2 mb-2 p-md-0 mb-md-0"
              >
                <div class="pr-2 w-50">
                  <b-button
                    variant="secondary"
                    size="lg"
                    class="w-100"
                    block
                    @click="hide"
                  >
                    Close
                  </b-button>
                </div>
                <b-button
                  size="lg"
                  variant="primary"
                  block
                  class="w-50 pl-2"
                  @click="showImages = false"
                >
                  View description
                </b-button>
              </div>
            </div>
            <MessageExpanded
              v-else
              :id="id"
              :replyable="replyable"
              :hide-close="hideClose"
              :actions="actions"
              :show-map="modalShown"
              class="ml-md-2 mr-md-2 mt-md-2 ml-0 mr-0 mt-0"
              @close="hide"
              @zoom="showImages = true"
            />
          </div>
          <div
            v-else
            class="d-flex flex-column -justify-content-around align-content-center"
          >
            <b-img src="/loader.gif" alt="Loading..." />
          </div>
        </template>
      </b-modal>
    </client-only>
  </div>
</template>
<script>
import { useMessageStore } from '../stores/message'
import modal from '@/mixins/modal'
import MessageExpanded from '@/components/MessageExpanded'
import ImageCarousel from '@/components/ImageCarousel'

export default {
  components: { ImageCarousel, MessageExpanded },
  mixins: [modal],
  props: {
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
  },
  setup() {
    const messageStore = useMessageStore()

    return { messageStore }
  },
  data() {
    return {
      modalShown: false,
      showImages: false,
    }
  },
  computed: {
    message() {
      return this.messageStore.byId(this.id)
    },
  },
  methods: {
    show(showImages) {
      this.showModal = true
      this.modalShown = false
      this.showImages = showImages
    },
    shown() {
      this.modalShown = true
    },
  },
}
</script>
<style scoped lang="scss">
@import '~bootstrap/scss/functions';
@import '~bootstrap/scss/variables';
@import '~bootstrap/scss/mixins/_breakpoints';

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
</style>
