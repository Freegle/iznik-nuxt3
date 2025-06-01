<template>
  <div
    class="chatMessageWrapper"
    :class="{ myChatMessage: messageIsFromCurrentUser }"
  >
    <div class="chatMessage forcebreak chatMessage__owner">
      <div>
        <span v-if="isMT && emessageMThasTNlinks">
          <span v-html="emessageMTTN" class="preline forcebreak"></span>
        </span>
        <span v-else-if="!highlightEmails">
          <span v-if="messageIsNew" class="prewrap font-weight-bold"> WWW {{
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
              :search-words="[regexEmailMT]"
              highlight-class-name="highlight"
              class="prewrap"
            />
          </span>
          <span v-else>
            <Highlighter
              :text-to-highlight="emessage"
              :search-words="[regexEmailMT]"
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
      <div v-if="lat || lng" :style="'width: 100%; height: 200px'">
        <l-map
          ref="map"
          :zoom="16"
          :max-zoom="maxZoom"
          :center="[lat, lng]"
        >
          <l-tile-layer :url="osmtile" :attribution="attribution" />
          <l-marker :lat-lng="[lat, lng]" :interactive="false" />
        </l-map>
        <div class="small text-muted">
          (Map shows approximate location of {{ postcode }})
        </div>
      </div>
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
import { LMap, LTileLayer, LMarker } from '@vue-leaflet/vue-leaflet'
import ChatBase from '~/components/ChatBase'
import ProfileImage from '~/components/ProfileImage'
import { MAX_MAP_ZOOM, POSTCODE_REGEX } from '~/constants'
import { attribution, osmtile } from '~/composables/useMap'
import { useLocationStore } from '~/stores/location'
import { useMiscStore } from '../stores/misc'

export default {
  components: {
    ProfileImage,
    Highlighter,
    LMap,
    LTileLayer,
    LMarker,
  },
  extends: ChatBase,
  data: function () {
    return {
      lat: null,
      lng: null,
    }
  },
  computed: {
    isMT() {
      const miscStore = useMiscStore()
      return miscStore.modtools
    },
    emessageMThasTNlinks() {
      return this.emessage.includes('https://trashnothing.com/fd/')
    },
    emessageMTTN() {
      let ret = this.emessage
      ret = ret.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
      let tnpos = -1
      while( true){
        tnpos = ret.indexOf('https://trashnothing.com/fd/',tnpos+1)
        if( tnpos===-1) break
        const endtn = ret.indexOf('\n',tnpos)
        if( endtn===-1) break
        const tnurl = ret.substring(tnpos,endtn)
        const tnlink = '<a href='+tnurl+' target="_blank">'+tnurl+'</a>'
        ret = ret.substring(0,tnpos)+tnlink+ret.substring(endtn)
        tnpos += tnlink.length
      }
      return ret
    },
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
  methods: {
    // MTTODO: Use if need be or remove if not
    // Replace Highlighter with highlightedEmails as it does not support regex for emails
    makesafeforhtml(input) {
      input = input.replace(/&/g, '&amp;')
      input = input.replace(/</g, '&lt;')
      input = input.replace(/>/g, '&gt;')
      return input
    },
    highlightedEmails(c) {
      const regex = new RegExp(this.regexEmailMT)
      // let count = 0
      const giventext = this.makesafeforhtml(this.emessage)
      let highlightedText = ''
      let lastix = 0
      let match
      while ((match = regex.exec(giventext))) {
        const start = match.index
        const end = regex.lastIndex
        // Do not highlight zero-length matches
        if (end > start) {
          highlightedText += giventext.substring(lastix, start)
          highlightedText +=
            `<span class="${c}">` + giventext.substring(start, end) + '</span>'
          lastix = end
        }
        // if (++count === 10) break
      }
      if (lastix < giventext.length) {
        highlightedText += giventext.substring(lastix)
      }

      return highlightedText
    },
  },
}
</script>
