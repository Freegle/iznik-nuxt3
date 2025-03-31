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
            <span v-if="messageIsNew" class="font-weight-bold" v-html="highlightedEmails('highlight prewrap')">
            </span>
            <span v-else v-html="highlightedEmails('highlight preline forcebreak')">
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
      <!--div v-if="lat || lng">
        <l-map
          ref="map"
          :zoom="16"
          :max-zoom="maxZoom"
          :center="[lat, lng]"
          :style="'width: 100%; height: 200px'"
        >
          <l-tile-layer :url="osmtile" :attribution="attribution" />
          <l-marker :lat-lng="[lat, lng]" :interactive="false" />
        </l-map>
        <div class="small text-muted">
          (Map shows approximate location of {{ postcode }})
        </div>
      </div-->
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
import { LMap, LTileLayer, LMarker } from '@vue-leaflet/vue-leaflet'

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
  methods:{
    // Replace Highlighter with highlightedEmails as it does not support regex for emails
    makesafeforhtml(input) {
      input = input.replace(/&/g, '&amp;')
      input = input.replace(/</g, '&lt;')
      input = input.replace(/>/g, '&gt;')
      return input;
    },
    highlightedEmails(c) {
      const regex = new RegExp(this.regexEmailMT)
      //let count = 0
      const giventext = this.makesafeforhtml(this.emessage)
      let highlightedText = ''
      let lastix = 0
      let match
      while ((match = regex.exec(giventext))) {
        let start = match.index
        let end = regex.lastIndex
        // Do not highlight zero-length matches
        if (end > start) {
          highlightedText += giventext.substring(lastix, start)
          highlightedText += `<span class="${c}">` + giventext.substring(start, end) + '</span>'
          lastix = end
        }
        //if (++count === 10) break
      }
      if (lastix < giventext.length) {
        highlightedText += giventext.substring(lastix)
      }

      return highlightedText
    }
  },
  async mounted() {
    console.log('Mounted, postcode', this.postcode)
    if (this.postcode) {
      // Use typeahead to find the postcode location.
      const locationStore = useLocationStore()
      if( locationStore && locationStore.typeahead){
      const locs = await locationStore.typeahead(this.postcode)
      console.log('Typeahead returned', locs)

      if (locs?.length) {
        this.lat = locs[0].lat
        this.lng = locs[0].lng
      }
    }
    }
  },
}
</script>
