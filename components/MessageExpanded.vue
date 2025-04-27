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
<script setup>
import { ref, computed, watch, defineAsyncComponent } from 'vue'
import MessageReplyInfo from './MessageReplyInfo'
import { useMessageStore } from '~/stores/message'
import { useMiscStore } from '~/stores/misc'
import MessagePromised from '~/components/MessagePromised'
import MessageActions from '~/components/MessageActions'
import MessageTextBody from '~/components/MessageTextBody'
import MessageTag from '~/components/MessageTag'
import MessageItemLocation from '~/components/MessageItemLocation'
import MessageAttachments from '~/components/MessageAttachments'
import { useMe } from '~/composables/useMe'

const MessageHistoryExpanded = defineAsyncComponent(() =>
  import('~/components/MessageHistoryExpanded')
)

const props = defineProps({
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
})

const emit = defineEmits(['zoom', 'close'])

const messageStore = useMessageStore()
const miscStore = useMiscStore()
const { me } = useMe()

// Data
const replied = ref(false)
const adRendered = ref(false)
const noAd = ref(false)

// Computed
const breakpoint = computed(() => {
  return miscStore.breakpoint
})

const message = computed(() => {
  return messageStore?.byId(props.id)
})

const gotAttachments = computed(() => {
  return (
    message.value &&
    message.value.attachments &&
    message.value.attachments?.length
  )
})

const validPosition = computed(() => {
  return message.value.lat || message.value.lng
})

const home = computed(() => {
  let ret = null

  if (me.value?.lat || me.value?.lng) {
    ret = {
      lat: me.value.lat,
      lng: me.value.lng,
    }
  }

  return ret
})

// Watch
watch(
  breakpoint,
  (newVal) => {
    // The ad is only shown on xs and sm, so for others we need to pretend it has been.
    if (newVal !== 'xs' && newVal !== 'sm') {
      adRendered.value = true
    }
  },
  { immediate: true }
)

// Methods
function sent() {
  emit('close')
  replied.value = true
}

function rendered(shown) {
  adRendered.value = true
  noAd.value = !shown
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
