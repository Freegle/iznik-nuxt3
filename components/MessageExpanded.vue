<template>
  <div v-if="message" :id="'msg-' + id" class="position-relative">
    <MessageAttachments
      v-if="gotAttachments"
      :id="id"
      :attachments="message?.attachments"
      class="image-wrapper"
      :disabled="message?.successful"
      show-zoom
      @zoom="$emit('zoom')"
    />
    <div class="d-flex mb-1 mt-2 justify-content-between p-2 p-md-0">
      <div class="d-flex flex-column justify-content-between w-100">
        <div v-if="!gotAttachments" class="d-flex">
          <MessageTag :id="id" def inline class="pl-2 pr-2" />
        </div>
        <MessageItemLocation
          :id="id"
          :matchedon="message.matchedon"
          class="mb-1 header-title flex-grow-1"
          :expanded="true"
        />
        <MessageActions v-if="actions" :id="id" />
      </div>
      <MessageHistoryExpanded :id="id" class="mb-1 d-none d-md-block" />
    </div>
    <div class="bg-white mb-3 p-2 p-md-0">
      <MessagePromised
        v-if="message.promised && replyable"
        :id="message.id"
        :to-me="message.promisedtome"
        class="mb-3 mt-1"
      />
      <MessageTextBody :id="id" />
      <MessageReplyInfo :message="message" />
      <div v-if="validPosition" class="mt-2 d-flex">
        <MessageMap
          v-if="showMap && adRendered"
          :home="home"
          :position="{ lat: message.lat, lng: message.lng }"
          class="messagemap flex-grow-1"
          :height="breakpoint === 'xs' || breakpoint === 'sm' ? 150 : 250"
        />
      </div>
      <MessageHistoryExpanded :id="id" class="d-block d-md-none mt-2 mt-md-0" />
      <VisibleWhen v-if="showAd && adId && !noAd" :at="['xs', 'sm']">
        <div class="d-flex justify-content-around mt-2">
          <ExternalDa
            :ad-unit-path="adUnitPath"
            :ad-id="adId"
            max-height="250px"
            :div-id="adId"
            :in-modal="inModal"
            show-logged-out
            @rendered="rendered"
          />
        </div>
      </VisibleWhen>
      <MessageReplySection
        v-if="replyable && !replied"
        :id="id"
        class="mt-3"
        @close="$emit('close')"
        @sent="sent"
      />
      <b-alert
        v-if="replied"
        variant="info"
        :model-value="true"
        class="mt-2"
        fade
      >
        We've sent your message. You'll get replies in the
        <nuxt-link no-prefetch to="/chats">Chats</nuxt-link> section on here,
        and by email.
      </b-alert>
    </div>
  </div>
</template>
<script>
import { useReplyStore } from '../stores/reply'
import MessageReplyInfo from './MessageReplyInfo'
import { useMessageStore } from '~/stores/message'
import { useMiscStore } from '~/stores/misc'
import MessagePromised from '~/components/MessagePromised'
import MessageActions from '~/components/MessageActions'
import MessageTextBody from '~/components/MessageTextBody'

import MessageTag from '~/components/MessageTag'
import MessageItemLocation from '~/components/MessageItemLocation'
import MessageAttachments from '~/components/MessageAttachments'

const MessageHistoryExpanded = () =>
  import('~/components/MessageHistoryExpanded')

export default {
  components: {
    MessageTag,
    MessageTextBody,
    MessageActions,
    MessagePromised,
    MessageItemLocation,
    MessageAttachments,
    MessageReplyInfo,
    MessageHistoryExpanded,
  },
  props: {
    id: {
      type: Number,
      required: true,
    },
    showMap: {
      type: Boolean,
      required: false,
      default: true,
    },
    showAd: {
      type: Boolean,
      required: false,
      default: true,
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
    inModal: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const messageStore = useMessageStore()
    const miscStore = useMiscStore()

    return { messageStore, miscStore }
  },
  data() {
    return {
      replied: false,
      adRendered: false,
      noAd: false,
    }
  },
  computed: {
    breakpoint() {
      const store = useMiscStore()
      return store.breakpoint
    },
    message() {
      return this.messageStore?.byId(this.id)
    },
    gotAttachments() {
      return (
        this.message &&
        this.message.attachments &&
        this.message.attachments?.length
      )
    },
    validPosition() {
      return this.message.lat || this.message.lng
    },
    home() {
      let ret = null

      if (this.me?.lat || this.me?.lng) {
        ret = {
          lat: this.me.lat,
          lng: this.me.lng,
        }
      }

      return ret
    },
    replyToSend() {
      let ret = null

      if (this.me) {
        const replyStore = useReplyStore()
        ret = replyStore.state
      }

      return ret
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
    breakpoint: {
      immediate: true,
      handler(newVal) {
        // The ad is only shown on xs and sm, so for others we need to pretend it has been.
        if (newVal !== 'xs' && newVal !== 'sm') {
          this.adRendered = true
        }
      },
    },
  },
  methods: {
    sent() {
      this.$emit('close')
      this.replied = true
    },
    rendered(shown) {
      this.adRendered = true
      this.noAd = !shown
    },
  },
}
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';

.header--size4 {
  color: $colour-info-fg !important;
  font-weight: bold;
}

.image-wrapper {
  position: relative;
}
</style>
