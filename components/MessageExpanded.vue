<template>
  <div v-if="message" :id="'msg-' + id" class="position-relative">
    <MessageAttachments
      v-if="gotAttachments"
      :id="id"
      :attachments="message.attachments"
      class="image-wrapper"
      :disabled="message.successful"
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
          :type="message.type"
          :expanded="true"
        />
        <MessageActions v-if="!simple && actions" :id="id" />
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
      <MessageMap
        v-if="showMap && validPosition"
        :home="home"
        :position="{ lat: message.lat, lng: message.lng }"
        class="mt-2 messagemap"
        :height="150"
      />
      <MessageHistoryExpanded :id="id" class="d-block d-md-none mt-2 mt-md-0" />
      <!--      TODO-->
      <!--      <MessageReplySection-->
      <!--        v-if="replyable && !replied"-->
      <!--        :id="id"-->
      <!--        class="mt-3"-->
      <!--        @close="$emit('close')"-->
      <!--        @sent="sent"-->
      <!--      />-->
      <b-alert v-if="replied" variant="info" show class="mt-2" fade>
        We've sent your message. You'll get replies in the
        <nuxt-link to="/chats"> Chats </nuxt-link> section on here, and by
        email.
      </b-alert>
    </div>
  </div>
</template>

<script>
// Need to import rather than async otherwise the render doesn't happen and ref isn't set.
// import Vue from 'vue'
// import { TooltipPlugin } from 'bootstrap-vue'
import MessageReplyInfo from './MessageReplyInfo'
import { useMessageStore } from '~/stores/message'
import MessagePromised from '@/components/MessagePromised'
import MessageActions from '@/components/MessageActions'
import MessageTextBody from '@/components/MessageTextBody'

import MessageTag from '@/components/MessageTag'
import MessageItemLocation from '~/components/MessageItemLocation'
import MessageAttachments from '~/components/MessageAttachments'

const MessageHistoryExpanded = () =>
  import('~/components/MessageHistoryExpanded')

// TODO
// Vue.use(TooltipPlugin)

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
  setup(props) {
    const messageStore = useMessageStore()
    return { messageStore }
  },
  data() {
    return {
      replied: false,
      simple: false, // TODO
    }
  },
  computed: {
    message() {
      return this.messageStore.byId(this.id)
    },
    gotAttachments() {
      return (
        this.message &&
        this.message.attachments &&
        this.message.attachments.length
      )
    },
    validPosition() {
      return this.message.lat || this.message.lng
    },
    home() {
      // TODO
      return {
        lat: 53.945,
        lng: -2.5209,
      }

      // let ret = null
      //
      // if (this.me && this.me.settings && this.me.settings.mylocation) {
      //   ret = {
      //     lat: this.me.settings.mylocation.lat,
      //     lng: this.me.settings.mylocation.lng,
      //   }
      // }
      //
      // return ret
    },
    replyToSend() {
      let ret = null

      if (this.me) {
        ret = this.$store.getters['reply/get']
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
  methods: {
    sent() {
      this.$emit('close')
      this.replied = true
    },
  },
}
</script>
<style scoped lang="scss">
@import '~bootstrap/scss/functions';
@import '~bootstrap/scss/variables';
@import '~bootstrap/scss/mixins/_breakpoints';

.header--size4 {
  color: $colour-info-fg !important;
  font-weight: bold;
}

.image-wrapper {
  position: relative;
}
</style>
