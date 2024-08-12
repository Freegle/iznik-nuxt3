<template>
  <div
    v-if="message"
    :id="'msg-' + id"
    ref="msg"
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
      <MessageExpanded
        :id="message.id"
        :replyable="replyable"
        :hide-close="hideClose"
        :actions="actions"
        :show-map="true"
        class="bg-white p-2"
        :ad-unit-path="adUnitPath"
        :ad-id="adId"
        @zoom="showPhotosModal"
      />
      <MessagePhotosModal
        v-if="showMessagePhotosModal && message.attachments?.length"
        :id="message.id"
        @hidden="showMessagePhotosModal = false"
      />
    </div>
    <div v-else>
      <MessageSummary
        :id="message.id"
        :expand-button-text="expandButtonText"
        :replyable="replyable"
        class="mt-3"
        :matchedon="matchedon"
        @expand="expand"
      />
      <MessageModal
        v-if="expanded"
        :id="message.id"
        v-model:showImages="showImages"
        :replyable="replyable"
        :hide-close="hideClose"
        :actions="actions"
        @hidden="expanded = false"
      />
    </div>
  </div>
</template>

<script>
import { useMessageStore } from '../stores/message'
import { useGroupStore } from '~/stores/group'
const MessageModal = defineAsyncComponent(() =>
  import('~/components/MessageModal')
)

export default {
  components: {
    MessageModal,
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
    scrollIntoView: {
      type: Boolean,
      required: false,
      default: false,
    },
    adUnitPath: {
      type: String,
      required: false,
      default: null,
    },
    adId: {
      type: String,
      required: false,
      default: null,
    },
  },
  emits: ['notFound', 'view', 'visible'],
  async setup(props, ctx) {
    const messageStore = useMessageStore()
    const groupStore = useGroupStore()

    try {
      const message = await messageStore.fetch(props.id)

      if (message) {
        // Get the groups into store too.
        const promises = []
        message.groups.forEach((g) => {
          if (!groupStore.get(g.groupid)) {
            try {
              promises.push(groupStore.fetch(g.groupid))
            } catch (e) {
              console.log('Fetch fail', e)
            }
          }
        })

        await Promise.all(promises)
      } else {
        ctx.emit('notFound')
      }
    } catch (e) {
      ctx.emit('notFound')
    }

    return { messageStore }
  },
  data() {
    return {
      expanded: false,
      reply: null,
      showImages: false,
      showMessagePhotosModal: false,
    }
  },
  computed: {
    message() {
      return this.messageStore?.byId(this.id)
    },
    showMap() {
      return this.message?.lat || this.message?.lng
    },
    home() {
      let ret = null

      if (this.me?.settings?.mylocation) {
        ret = {
          lat: this.me.settings?.mylocation.lat,
          lng: this.me.settings?.mylocation.lng,
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
        return this.message.fromuser
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
    if (this.startExpanded && this.message) {
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

    if (this.scrollIntoView) {
      await this.$nextTick()

      if (this.$refs.msg) {
        this.$refs.msg.scrollIntoView()
      }
    }
  },
  methods: {
    expand() {
      if (!this.message?.successful) {
        this.expanded = true

        this.view()
      }
    },
    zoom() {
      this.showImages = true
      this.expand()
    },
    showPhotosModal() {
      this.showMessagePhotosModal = true
    },
    async view() {
      if (this.recordView) {
        if (this.me && this.message?.unseen) {
          await this.messageStore.view(this.id)
        }

        this.$emit('view')
      }
    },
  },
}
</script>
