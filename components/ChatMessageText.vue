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
    <div class="chatMessage forcebreak chatMessage__owner">
      <div>
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
import { ref, computed, onMounted } from '#imports'
import ProfileImage from '~/components/ProfileImage'
import { MAX_MAP_ZOOM, POSTCODE_REGEX } from '~/constants'
import { attribution, osmtile } from '~/composables/useMap'
import { useLocationStore } from '~/stores/location'

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
