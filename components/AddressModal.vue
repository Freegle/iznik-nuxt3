<template>
  <div>
    <client-only>
      <b-modal
        id="addressmodal"
        v-model="showModal"
        :title="choose ? 'Please choose an address' : 'Address Book'"
        :alt="choose ? 'Please choose an address' : 'Address Book'"
        size="lg"
        no-stacking
        @shown="showMap = true"
      >
        <template #default>
          <p>
            We'll store your address here so that you can easily send it to
            other people in future. We won't give it out to anyone or send you
            any junk mail.
          </p>
          <h4 v-if="!choose">Your addresses</h4>
          <div v-if="addressOptions && addressOptions.length">
            <p v-if="!choose">These are your current addresses.</p>
            <b-row>
              <b-col cols="12" sm="8">
                <b-form-select
                  v-model="selectedAddress"
                  :options="addressOptions"
                  class="mb-2 font-weight-bold"
                />
              </b-col>
              <b-col cols="12" sm="4">
                <SpinButton
                  name="trash-alt"
                  label="Delete"
                  variant="secondary"
                  :handler="deleteIt"
                />
              </b-col>
            </b-row>
            <div v-if="selectedAddress">
              <b-row class="mb-2">
                <b-col cols="12" sm="8">
                  <div :style="'width: 100%; height: 200px'">
                    <l-map
                      v-if="showMap && selectedAddressObject"
                      ref="map"
                      :zoom="16"
                      :center="[
                        selectedAddressObject.lat,
                        selectedAddressObject.lng,
                      ]"
                    >
                      <l-tile-layer :url="osmtile" :attribution="attribution" />
                      <l-marker
                        :lat-lng="markerLatLng"
                        draggable
                        @update:latLng="updateMarker"
                      />
                    </l-map>
                  </div>
                  <p class="mt-2">
                    <v-icon icon="info-circle" /> Drag the marker if it's not in
                    the right place.
                  </p>
                </b-col>
              </b-row>
              <h5>Directions</h5>
              <p>
                Any instructions about how to find it, or where you'll leave
                items.
              </p>
              <b-row>
                <b-col cols="12" sm="8">
                  <b-form-textarea
                    v-model="updatedInstructions"
                    rows="2"
                    max-rows="6"
                    class="mb-1"
                  />
                </b-col>
                <b-col cols="12" sm="4">
                  <SpinButton
                    name="save"
                    variant="primary"
                    size="lg"
                    :handler="saveInstructions"
                    label="Save"
                    spinclass="text-white"
                  />
                </b-col>
              </b-row>
            </div>
          </div>
          <p v-else>You don't have any addresses yet.</p>
          <b-button
            v-if="!showAdd"
            variant="secondary"
            class="mt-2"
            @click="addnew"
          >
            <v-icon icon="plus" /> Add a new address
          </b-button>
          <div v-else>
            <h4 class="mt-2">Add a new address</h4>
            <p>Choose a postcode:</p>
            <b-row>
              <b-col>
                <PostCode
                  focus
                  @selected="postcodeSelect"
                  @cleared="postcodeCleared"
                />
              </b-col>
            </b-row>
            <p class="mt-2">Choose an address:</p>
            <b-row v-if="propertyOptions && propertyOptions.length">
              <b-col cols="12" sm="8">
                <b-form-select
                  v-model="selectedProperty"
                  :options="propertyOptions"
                  class="mb-2 font-weight-bold"
                />
              </b-col>
              <b-col cols="12" sm="4">
                <SpinButton
                  v-if="selectedProperty"
                  label="Add"
                  variant="primary"
                  name="plus"
                  :handler="add"
                />
              </b-col>
            </b-row>
          </div>
        </template>
        <template #footer>
          <b-button v-if="!choose" variant="white" class="mr-2" @click="hide">
            Close
          </b-button>
          <div v-else>
            <b-button variant="white" @click="hide"> Cancel </b-button>
            <b-button
              variant="primary"
              :disabled="!selectedAddress"
              class="ml-2"
              @click="chooseIt"
            >
              Send this Address
            </b-button>
          </div>
        </template>
      </b-modal>
    </client-only>
  </div>
</template>
<script>
import { ref } from 'vue'
import { useAddressStore } from '../stores/address'
import { constructSingleLine } from '../composables/usePAF'
import { useAuthStore } from '../stores/auth'
import { attribution, osmtile } from '../composables/useMap'
import SpinButton from './SpinButton'
import modal from '@/mixins/modal'
import PostCode from '~/components/PostCode'

export default {
  components: {
    PostCode,
    SpinButton,
  },
  mixins: [modal],
  props: {
    choose: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  async setup() {
    const addressStore = useAddressStore()
    const authStore = useAuthStore()

    await addressStore.fetch()

    const addresses = ref(addressStore.list)

    return {
      authStore,
      addressStore,
      addresses,
      osmtile: osmtile(),
      attribution: attribution(),
    }
  },
  data() {
    return {
      showAdd: false,
      updatedInstructions: null,
      postcode: null,
      properties: {},
      selectedProperty: 0,
      showMap: false,
    }
  },
  computed: {
    addressOptions() {
      const ret = []
      Object.values(this.addresses).forEach((address) => {
        ret.push({
          value: address.id,
          text: constructSingleLine(address),
        })
      })

      return ret
    },
    propertyOptions() {
      const ret = [
        {
          value: 0,
          text: 'Please choose your property...',
        },
      ]

      const singles = {}

      if (this.addressStore.properties) {
        Object.values(this.addressStore.properties).forEach((address) => {
          if (!singles[address.singleline]) {
            ret.push({
              value: address.id,
              text: address.singleline,
            })

            singles[address.singleline] = true
          }
        })
      }

      return ret
    },
    selectedAddress: {
      // We remember the preferred address.
      get() {
        console.log(this.me?.settings, this.addresses)
        return this.me?.settings?.selectedAddress
      },
      async set(newValue) {
        if (newValue) {
          const settings = this.me.settings
          settings.selectedAddress = newValue

          await this.authStore.saveAndGet({
            settings,
          })
        }
      },
    },
    selectedAddressObject() {
      return this.selectedAddress
        ? this.addresses.find((a) => a.id === this.selectedAddress)
        : null
    },
    markerLatLng: {
      get() {
        if (!this.selectedAddressObject) {
          return null
        }

        if (this.selectedAddressObject.lat || this.selectedAddressObject.lng) {
          return [
            this.selectedAddressObject.lat,
            this.selectedAddressObject.lng,
          ]
        }

        return [
          this.selectedAddressObject.postcode.lat,
          this.selectedAddressObject.postcode.lng,
        ]
      },
      set(newValue) {
        this.selectedAddressObject.lat = newValue[0]
        this.selectedAddressObject.lng = newValue[1]
      },
    },
    instructions: {
      get() {
        return this.selectedAddressObject?.instructions
      },
      set(newValue) {
        this.updatedInstructions = newValue
      },
    },
  },
  watch: {
    selectedAddressObject(newVal) {
      this.updatedInstructions = newVal?.instructions
    },
  },
  methods: {
    selectFirst() {
      if (
        !this.selectedAddress &&
        this.addresses &&
        this.addresses.length > 0
      ) {
        this.selectedAddress = this.addresses[0].id
        this.instructions = this.addresses[0].instructions
      } else {
        this.selectedAddress = null
        this.instructions = null
      }

      this.updatedInstructions = this.instructions
    },
    show() {
      // Fetch the current addresses before opening the modal.
      this.showModal = true

      this.selectFirst()

      if (this.addresses.length === 0) {
        this.showAdd = true
      }
    },
    hide() {
      this.showModal = false
      this.showAdd = false
      this.showMap = false
    },
    async add() {
      this.adding = true

      const id = await this.$store.dispatch('address/add', {
        pafid: this.selectedProperty,
        instructions: this.updatedInstructions,
      })

      await this.$store.dispatch('address/fetch')
      this.selectedAddress = id

      this.adding = false
    },
    async deleteIt() {
      await this.addressStore.delete(this.selectedAddress)
    },
    postcodeCleared() {
      this.postcode = null
    },
    async postcodeSelect(pc) {
      this.postcode = pc

      // Fetch the postal addresses within that postcode
      await this.addressStore.fetchProperties(pc.id)

      this.selectedProperty = 0
    },
    async saveInstructions() {
      await this.$store.dispatch('address/update', {
        id: this.selectedAddress,
        instructions: this.updatedInstructions,
      })
    },
    addnew() {
      this.showAdd = true
    },
    chooseIt() {
      this.$emit('chosen', this.selectedAddress)
      this.hide()
    },
    async updateMarker(val) {
      await this.$store.dispatch('address/update', {
        id: this.selectedAddress,
        lat: val.lat,
        lng: val.lng,
      })
    },
  },
}
</script>
