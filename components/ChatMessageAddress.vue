<template>
  <div>
    <b-row>
      <b-col cols="12" sm="6" :offset-sm="chatmessage.userid != me?.id ? 0 : 6">
        <div v-if="chatmessage.userid != me?.id" class="media">
          <b-card border-variant="success">
            <b-card-title>
              <h4>{{ otheruser.displayname }} sent an address:</h4>
            </b-card-title>
            <b-card-text>
              <b-row>
                <b-col>
                  <pre
                    v-if="address"
                    :class="address.instructions ? '' : 'mb-2'"
                    style="text-wrap: wrap"
                    >{{ multiline }}</pre
                  >
                  <pre v-else>This address has been deleted.</pre>
                  <hr v-if="address?.instructions" />
                  <div v-if="address?.instructions" class="mb-2">
                    {{ address.instructions }}
                  </div>
                </b-col>
              </b-row>
              <b-row v-if="address?.postcode">
                <b-col>
                  <l-map
                    ref="map"
                    :zoom="16"
                    :max-zoom="maxZoom"
                    :center="[address.lat, address.lng]"
                    :style="'width: 100%; height: 200px'"
                  >
                    <l-tile-layer
                      :url="osmtile()"
                      :attribution="attribution()"
                    />
                    <l-marker
                      :lat-lng="[address.lat, address.lng]"
                      :interactive="false"
                    />
                  </l-map>
                  <ExternalLink
                    :href="
                      'https://maps.google.com/?q=' +
                      address.lat +
                      ',' +
                      address.lng +
                      '&z=16'
                    "
                    class="mt-1 small"
                  >
                    View in Google Maps
                  </ExternalLink>
                </b-col>
              </b-row>
            </b-card-text>
          </b-card>
        </div>
        <div v-else class="media float-end">
          <b-card border-variant="success">
            <b-card-title>
              <h4>You sent an address:</h4>
            </b-card-title>
            <b-card-text>
              <b-row>
                <b-col cols="12">
                  <div v-if="address" class="d-flex justify-content-between">
                    <pre
                      :class="address.instructions ? '' : 'mb-2'"
                      style="text-wrap: wrap"
                      >{{ multiline }}</pre
                    >
                    <div>
                      <b-button
                        variant="white"
                        class="ml-2"
                        @click="editAddress"
                        >Address Book</b-button
                      >
                    </div>
                  </div>
                  <pre v-else>This address has been deleted.</pre>
                  <div class="text-muted small">
                    Your address book lets you easily send addresses, and also
                    add instructions so that people can find you.
                  </div>
                  <hr v-if="address?.instructions" />
                  <div v-if="address?.instructions" class="mb-2">
                    {{ address.instructions }}
                  </div>
                </b-col>
              </b-row>
              <b-row v-if="address?.postcode">
                <b-col>
                  <l-map
                    ref="map"
                    :zoom="14"
                    :max-zoom="maxZoom"
                    :center="[address.lat, address.lng]"
                    :style="'width: 100%; height: 200px'"
                  >
                    <l-tile-layer
                      :url="osmtile()"
                      :attribution="attribution()"
                    />
                    <l-marker
                      :lat-lng="[address.lat, address.lng]"
                      :interactive="false"
                    />
                  </l-map>
                  <ExternalLink
                    :href="
                      'https://maps.google.com/?q=' +
                      address.lat +
                      ',' +
                      address.lng +
                      '&z=16'
                    "
                    class="mt-1 small"
                  >
                    View in Google Maps
                  </ExternalLink>
                </b-col>
              </b-row>
            </b-card-text>
          </b-card>
        </div>
      </b-col>
    </b-row>
    <AddressModal
      v-if="showAddress"
      :choose="true"
      t-o-d-o
      @chosen="sendAddress"
      @hidden="addressClosed"
    />
  </div>
</template>
<script setup>
import ExternalLink from './ExternalLink'
import AddressModal from './AddressModal'
import { useAddressStore } from '~/stores/address'
import { useChatStore } from '~/stores/chat'
import { useChatMessageBase } from '~/composables/useChat'
import { constructMultiLine } from '~/composables/usePAF'
import { attribution, osmtile } from '~/composables/useMap'
import { MAX_MAP_ZOOM } from '~/constants'
import { ref, computed, onMounted } from '#imports'

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
})

// Store access
const addressStore = useAddressStore()
const chatStore = useChatStore()

// Chat base properties
const { otheruser, chatmessage, me } = useChatMessageBase(
  props.chatid,
  props.id,
  props.pov
)

// Component state
const showAddress = ref(false)
const address = ref(null)

// Computed properties
const maxZoom = computed(() => MAX_MAP_ZOOM)
const multiline = computed(() => constructMultiLine(address.value))

// Methods
const editAddress = async () => {
  await addressStore.fetch()
  showAddress.value = true
}

const addressClosed = async () => {
  await chatStore.fetchMessages(props.chatid)
  showAddress.value = false
}

const sendAddress = async (id) => {
  await chatStore.send(props.chatid, null, id)
  showAddress.value = false
}

// Setup
onMounted(async () => {
  if (process.client) {
    await import('leaflet/dist/leaflet-src.esm')
  }

  // The addressid is (wrongly) stored in the message.
  const addressid = parseInt(chatmessage.value?.message)
  if (addressid) {
    address.value = await addressStore.fetch(addressid)
  }
})
</script>
