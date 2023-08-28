<template>
  <div>
    <b-row class="pb-1">
      <b-col cols="12" sm="6" :offset-sm="chatmessage.userid != myid ? 0 : 6">
        <div v-if="chatmessage.userid != myid" class="media">
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
                    :center="[address.lat, address.lng]"
                    :style="'width: 100%; height: 200px'"
                  >
                    <l-tile-layer :url="osmtile" :attribution="attribution" />
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
                  <pre
                    v-if="address"
                    :class="address.instructions ? '' : 'mb-2'"
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
                    :zoom="14"
                    :center="[address.lat, address.lng]"
                    :style="'width: 100%; height: 200px'"
                  >
                    <l-tile-layer :url="osmtile" :attribution="attribution" />
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
  </div>
</template>
<script>
import { useAddressStore } from '../stores/address'
import { useChatStore } from '../stores/chat'
import ExternalLink from './ExternalLink'
import ChatBase from '~/components/ChatBase'
import { constructMultiLine } from '~/composables/usePAF'
import { attribution, osmtile } from '~/composables/useMap'
import { ref } from '#imports'

export default {
  components: { ExternalLink },
  extends: ChatBase,
  async setup(props) {
    let L = null

    if (process.client) {
      L = await import('leaflet/dist/leaflet-src.esm')
    }

    // Make sure we have the addresses.
    const addressStore = useAddressStore()
    const chatStore = useChatStore()

    // The addressid is (wrongly) stored in the message.
    const chatmsg = chatStore.messageById(props.id)
    const addressid = ref(parseInt(chatmsg?.message))

    const address = await addressStore.fetch(addressid.value)

    return {
      addressStore,
      L,
      osmtile: osmtile(),
      attribution: attribution(),
      addressid,
      address: ref(address),
    }
  },
  computed: {
    multiline() {
      return constructMultiLine(this.address)
    },
  },
}
</script>
