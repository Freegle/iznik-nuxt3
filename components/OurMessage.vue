<template>
  <div
    v-if="message"
    :id="'msg-' + id"
    class="position-relative ms-2 me-2 ms-sm-0 me-sm-0"
    itemscope
    itemtype="http://schema.org/Product"
  >
    <div
      itemprop="offers"
      itemscope
      itemtype="http://schema.org/Offer"
      class="d-none"
    >
      <meta itemprop="priceCurrency" content="GBP" />
      <span itemprop="price">0</span> |
      <span itemprop="availability">Instock</span>
    </div>
    <div v-if="startExpanded">
      <!--      TODO-->
      <MessageExpanded
        :id="message.id"
        :replyable="replyable"
        :hide-close="hideClose"
        :actions="actions"
        :show-map="true"
        class="bg-white p-2"
        @zoom="showPhotosModal"
      />
      <!--      <MessagePhotosModal-->
      <!--          :id="message.id"-->
      <!--          ref="photoModal"-->
      <!--      />-->
    </div>
    <div v-else>
      <MessageSummary
        :id="message.id"
        :expand-button-text="expandButtonText"
        :replyable="replyable"
        class="mt-3"
        @expand="expand"
        @zoom="zoom"
      />
      <!--      todo-->
      <!--      <MessageModal-->
      <!--          :id="message.id"-->
      <!--          ref="modal"-->
      <!--          :replyable="replyable"-->
      <!--          :hide-close="hideClose"-->
      <!--          :actions="actions"-->
      <!--      />-->
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
    expandButtonText: {
      type: String,
      required: false,
      default: 'See details and reply',
    },
    startExpanded: {
      type: Boolean,
      required: false,
      default: false,
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
    recordView: {
      type: Boolean,
      required: true,
    },
  },
  setup(props) {
    const messageStore = useMessageStore()

    useAsyncData('message-' + props.id, () => messageStore.fetch(props.id))

    return { messageStore }
  },
  data() {
    return {
      expanded: false,
      reply: null,
    }
  },
  computed: {
    message() {
      return this.messageStore.byId(this.id)
    },
    showMap() {
      return this.message.lat || this.message.lng
    },
    home() {
      let ret = null

      if (this.me && this.me.settings && this.me.settings.mylocation) {
        ret = {
          lat: this.me.settings.mylocation.lat,
          lng: this.me.settings.mylocation.lng,
        }
      }

      return ret
    },
    stillAvailable() {
      return (
        this.message.type === 'Offer' &&
        this.reply &&
        this.reply.length <= 35 &&
        this.reply.toLowerCase().includes('still available')
      )
    },
    replyToUser() {
      if (this.message && this.message.fromuser) {
        return this.message.fromuser.id
      }

      return null
    },
    position() {
      let ret = null

      if (this.message) {
        if (this.message.location) {
          // This is what we put in for message submitted on FD.
          ret = this.message.location
        } else if (this.message.lat || this.message.lng) {
          // This happens for TN messages
          ret = {
            lat: this.message.lat,
            lng: this.message.lng,
          }
        }
      }

      return ret
    },
  },
  watch: {
    async replyToSend(newVal, oldVal) {
      // Because of the way persistent store is restored, we might only find out that we have a reply to send
      // post-mount.
      if (newVal && newVal.replyTo === this.id) {
        this.reply = newVal.replyMessage
        await this.expand()

        this.$nextTick(() => {
          this.sendReply()
        })
      }
    },
  },
  async mounted() {
    if (this.startExpanded) {
      this.view()
    }

    const reply = this.replyToSend

    if (reply && reply.replyTo === this.id) {
      // Because of the way persistent store is restored, we might or might not know that we have a reply to send
      // in the mount, or we might only pick it up in the watch.
      this.reply = reply.replyMessage
      await this.expand()
      this.sendReply()
    }
  },
  methods: {
    expand(zoom) {
      if (!this.message.successful) {
        this.expanded = true

        this.waitForRef('modal', () => {
          this.$refs.modal.show(zoom)
          this.$store.dispatch('messages/fetch', {
            id: this.id,
          })
        })

        this.view()
      }
    },
    zoom() {
      this.expand(true)
    },
    showPhotosModal() {
      this.waitForRef('photoModal', () => {
        this.$refs.photoModal.show()
      })
    },
    async view() {
      if (this.recordView) {
        if (this.me) {
          await this.$store.dispatch('messages/view', {
            id: this.id,
          })
        }

        this.$emit('view')
      }
    },
  },
}
</script>
