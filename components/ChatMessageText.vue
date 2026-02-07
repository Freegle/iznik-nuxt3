<template>
  <div
    class="chatMessageWrapper"
    :class="{ myChatMessage: messageIsFromCurrentUser }"
  >
    <div class="chatMessageProfilePic">
      <ProfileImage
        :image="chatMessageProfileImage"
        :name="chatMessageProfileName"
        class="inline"
        is-thumbnail
        size="sm"
      />
    </div>
    <div
      class="chatMessage forcebreak chatMessage__owner"
      :class="{ 'chat-empty-message': isEmptyMessage }"
    >
      <div>
        <!-- ModTools: clickable links enabled -->
        <template v-if="isModTools">
          <span v-if="!highlightEmails">
            <span
              v-if="messageIsNew"
              class="prewrap font-weight-bold"
              v-html="linkifiedMessage"
            />
            <span v-else class="preline forcebreak" v-html="linkifiedMessage" />
            <b-img
              v-if="chatmessage?.image"
              fluid
              :src="chatmessage?.image.path"
              lazy
              rounded
            />
          </span>
          <span v-else>
            <span
              v-if="messageIsNew"
              class="prewrap font-weight-bold"
              v-html="linkifiedAndHighlightedMessage"
            />
            <span
              v-else
              class="preline forcebreak"
              v-html="linkifiedAndHighlightedMessage"
            />
            <b-img
              v-if="chatmessage?.image"
              fluid
              :src="chatmessage?.image.path"
              lazy
              rounded
            />
          </span>
        </template>
        <!-- Freegle: no clickable links for safety -->
        <template v-else>
          <span v-if="!highlightEmails">
            <span v-if="messageIsNew" class="prewrap font-weight-bold">{{
              emessage
            }}</span>
            <span v-else class="preline forcebreak">{{ emessage }}</span>
            <b-img
              v-if="chatmessage?.image"
              fluid
              :src="chatmessage?.image.path"
              lazy
              rounded
            />
          </span>
          <span v-else>
            <span v-if="messageIsNew" class="font-weight-bold">
              <Highlighter
                :text-to-highlight="emessage"
                :search-words="[regexEmail]"
                highlight-class-name="highlight"
                class="prewrap"
              />
            </span>
            <span v-else>
              <Highlighter
                :text-to-highlight="emessage"
                :search-words="[regexEmail]"
                highlight-class-name="highlight"
                class="preline forcebreak"
              />
            </span>
            <b-img
              v-if="chatmessage?.image"
              fluid
              :src="chatmessage?.image.path"
              lazy
              rounded
            />
          </span>
        </template>
      </div>
      <div v-if="lat || lng">
        <l-map
          ref="map"
          :zoom="16"
          :max-zoom="maxZoom"
          :center="[lat, lng]"
          :style="'width: 100%; height: 200px'"
        >
          <l-tile-layer :url="osmtile()" :attribution="attribution()" />
          <l-marker :lat-lng="[lat, lng]" :interactive="false" />
        </l-map>
        <div class="small text-muted">
          (Map shows approximate location of {{ postcode }})
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import Highlighter from 'vue-highlight-words'
import { useChatMessageBase } from '~/composables/useChat'
import {
  linkifyText,
  linkifyAndHighlightEmails,
} from '~/composables/useLinkify'
import { ref, computed, onMounted } from '#imports'
import ProfileImage from '~/components/ProfileImage'
import { MAX_MAP_ZOOM, POSTCODE_REGEX } from '~/constants'
import { attribution, osmtile } from '~/composables/useMap'
import { useLocationStore } from '~/stores/location'
import { useMiscStore } from '~/stores/misc'

const miscStore = useMiscStore()

const props = defineProps({
  chatid: {
    type: Number,
    required: true,
  },
  id: {
    type: Number,
    required: true,
  },
  pov: {
    type: Number,
    required: false,
    default: null,
  },
  highlightEmails: {
    type: Boolean,
    required: false,
    default: false,
  },
})

// Use properties from ChatBase component via composable
const {
  chat,
  chatmessage,
  emessage,
  isEmptyMessage,
  messageIsFromCurrentUser,
  chatMessageProfileImage,
  chatMessageProfileName,
  regexEmail,
} = useChatMessageBase(props.chatid, props.id, props.pov)

// Data properties
const lat = ref(null)
const lng = ref(null)

// Computed properties
const maxZoom = computed(() => MAX_MAP_ZOOM)

const messageIsNew = computed(() => {
  return (
    chatmessage.value?.secondsago < 60 ||
    chatmessage.value?.id > chat.value?.lastmsgseen
  )
})

const postcode = computed(() => {
  let ret = null

  const postcodeMatch = chatmessage.value?.message.match(POSTCODE_REGEX)

  if (postcodeMatch?.length) {
    if (!postcodeMatch[0].includes(' ')) {
      // Make sure we have a space in the right place, because this helps with autocomplete
      ret = postcodeMatch[0].replace(/^(.*)(\d)/, '$1 $2')
    } else {
      ret = postcodeMatch[0]
    }
  }

  return ret
})

// In ModTools, we make URLs clickable. In Freegle, we don't for safety reasons.
const isModTools = computed(() => miscStore.modtools)

// Linkified message for ModTools (without email highlighting)
const linkifiedMessage = computed(() => {
  return linkifyText(emessage.value)
})

// Linkified message with email highlighting for ModTools chat review
const linkifiedAndHighlightedMessage = computed(() => {
  return linkifyAndHighlightEmails(emessage.value, regexEmail.value)
})

// Lifecycle hooks
onMounted(async () => {
  if (postcode.value) {
    // Use typeahead to find the postcode location.
    const locationStore = useLocationStore()
    const locs = await locationStore.typeahead(postcode.value)

    if (locs?.length) {
      lat.value = locs[0].lat
      lng.value = locs[0].lng
    }
  }
})
</script>
<style scoped lang="scss">
/* Chat link styling for ModTools - uses :deep() since content is rendered via v-html */
:deep(.chat-link) {
  color: $color-blue--base;
  text-decoration: underline;

  &:hover {
    text-decoration: none;
  }
}

/* Email highlight styling for ModTools - matches the Highlighter component */
:deep(.highlight) {
  color: $color-blue--base;
  background-color: initial;
}

.chat-empty-message {
  font-style: italic;
  color: $color-gray--dark;
}
</style>
