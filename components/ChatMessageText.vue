<template>
  <div
    class="chatMessageWrapper"
    :class="{ myChatMessage: messageIsFromCurrentUser }"
  >
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
      <l-map
        v-if="lat || lng"
        ref="map"
        :zoom="16"
        :max-zoom="maxZoom"
        :center="[lat, lng]"
        :style="'width: 100%; height: 200px'"
      >
        <l-tile-layer :url="osmtile" :attribution="attribution" />
        <l-marker :lat-lng="[lat, lng]" :interactive="false" />
      </l-map>
    </div>
    <div class="chatMessageProfilePic">
      <ProfileImage
        :image="chatMessageProfileImage"
        class="ml-1 mb-1 mt-1 inline"
        is-thumbnail
        size="sm"
      />
    </div>
  </div>
</template>
<script>
import Highlighter from 'vue-highlight-words'
import ChatBase from '~/components/ChatBase'
import ProfileImage from '~/components/ProfileImage'
import { MAX_MAP_ZOOM, POSTCODE_REGEX } from '~/constants'
import { attribution, osmtile } from '~/composables/useMap'
import { useLocationStore } from '~/stores/location'

export default {
  components: {
    ProfileImage,
    Highlighter,
  },
  extends: ChatBase,
  data: function () {
    return {
      lat: null,
      lng: null,
    }
  },
  computed: {
    osmtile: () => osmtile(),
    attribution: () => attribution(),
    maxZoom() {
      return MAX_MAP_ZOOM
    },
    messageIsNew() {
      return (
        this.chatmessage?.secondsago < 60 ||
        this.chatmessage?.id > this.chat?.lastmsgseen
      )
    },
    postcode() {
      let ret = null

      const postcode = this.chatmessage?.message.match(POSTCODE_REGEX)

      if (postcode?.length) {
        if (!postcode[0].includes(' ')) {
          // Make sure we have a space in the right place, because this helps with autocomplete
          ret = postcode[0].replace(/^(.*)(\d)/, '$1 $2')
        } else {
          ret = postcode[0]
        }
      }

      return ret
    },
  },
  async mounted() {
    console.log('Mounted, postcode', this.postcode)
    if (this.postcode) {
      // Use typeahead to find the postcode location.
      const locationStore = useLocationStore()
      const locs = await locationStore.typeahead(this.postcode)
      console.log('Typeahead returned', locs)

      if (locs?.length) {
        this.lat = locs[0].lat
        this.lng = locs[0].lng
      }
    }
  },
}
</script>
