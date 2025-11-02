<template>
  <b-modal
    ref="modal"
    scrollable
    :title="props.choose ? 'Please choose an address' : 'Address Book'"
    :alt="props.choose ? 'Please choose an address' : 'Address Book'"
    size="lg"
    no-stacking
    @shown="onShow"
    @hidden="onHide"
  >
    <template #default>
      <p>
        We'll store your address here so that you can easily send it to other
        people in future. We won't give it out to anyone or send you any junk
        mail.
      </p>
      <h4 v-if="!props.choose">Your addresses</h4>
      <div v-if="addressOptions?.length">
        <p v-if="!props.choose">These are your current addresses.</p>
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
              icon-name="trash-alt"
              label="Delete"
              variant="secondary"
              @handle="deleteIt"
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
                  :max-zoom="16"
                  :center="[
                    selectedAddressObject.lat,
                    selectedAddressObject.lng,
                  ]"
                >
                  <l-tile-layer :url="osmtile()" :attribution="attribution()" />
                  <l-marker
                    :lat-lng="markerLatLng"
                    draggable
                    @update:lat-lng="updateMarker"
                  />
                </l-map>
              </div>
              <p class="mt-2">
                <v-icon icon="info-circle" /> Drag the marker if it's not in the
                right place.
              </p>
            </b-col>
          </b-row>
          <h5>Directions</h5>
          <p>
            Any instructions about how to find it, or where you'll leave items.
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
                icon-name="save"
                variant="primary"
                size="lg"
                label="Save"
                @handle="saveInstructions"
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
        <div v-if="postcode">
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
                icon-name="plus"
                @handle="add"
              />
            </b-col>
          </b-row>
        </div>
      </div>
    </template>
    <template #footer>
      <b-button v-if="!props.choose" variant="white" class="mr-2" @click="hide">
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
</template>
<script setup>
import SpinButton from './SpinButton'
import { useAddressStore } from '~/stores/address'
import { constructSingleLine } from '~/composables/usePAF'
import { useAuthStore } from '~/stores/auth'
import { attribution, osmtile } from '~/composables/useMap'
import { ref, computed, watch } from '#imports'
import { useOurModal } from '~/composables/useOurModal'
import { useMe } from '~/composables/useMe'
import PostCode from '~/components/PostCode'

const props = defineProps({
  choose: {
    type: Boolean,
    required: false,
    default: false,
  },
})

const emit = defineEmits(['hidden', 'chosen'])

const addressStore = useAddressStore()
const authStore = useAuthStore()
const { modal, hide } = useOurModal()

const { me } = useMe()

// Data properties
const showAdd = ref(false)
const updatedInstructions = ref(null)
const postcode = ref(null)
const selectedProperty = ref(0)
const showMap = ref(false)
const map = ref(null)

// Computed properties
const addresses = computed(() => {
  return addressStore?.list
})

const addressOptions = computed(() => {
  const ret = []
  addresses.value?.forEach((address) => {
    ret.push({
      value: address.id,
      text: constructSingleLine(address),
    })
  })

  return ret
})

const propertyOptions = computed(() => {
  const ret = [
    {
      value: 0,
      text: 'Please choose your property...',
    },
  ]

  const singles = {}

  if (addressStore?.properties) {
    Object.values(addressStore.properties).forEach((address) => {
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
})

const selectedAddress = computed({
  // We remember the preferred address.
  get() {
    const selected = me.value?.settings?.selectedAddress

    if (addresses.value?.find((address) => address.id === selected)) {
      return selected
    } else {
      return null
    }
  },
  async set(newValue) {
    const settings = me.value.settings
    showMap.value = false
    settings.selectedAddress = newValue

    await authStore.saveAndGet({
      settings,
    })

    showMap.value = true
  },
})

const selectedAddressObject = computed(() => {
  return selectedAddress.value
    ? addresses.value?.find((a) => a.id === selectedAddress.value)
    : null
})

const markerLatLng = computed({
  get() {
    if (!selectedAddressObject.value) {
      return null
    }

    if (selectedAddressObject.value.lat || selectedAddressObject.value.lng) {
      return [selectedAddressObject.value.lat, selectedAddressObject.value.lng]
    }

    return [
      selectedAddressObject.value.postcode.lat,
      selectedAddressObject.value.postcode.lng,
    ]
  },
  set(newValue) {
    selectedAddressObject.value.lat = newValue[0]
    selectedAddressObject.value.lng = newValue[1]
  },
})

const instructions = computed({
  get() {
    return selectedAddressObject.value?.instructions
  },
  set(newValue) {
    updatedInstructions.value = newValue
  },
})

// Watch for changes
watch(selectedAddressObject, (newVal) => {
  updatedInstructions.value = newVal?.instructions
})

// Methods
function selectFirst() {
  if (selectedAddress.value) {
    const sel = addresses.value?.find(
      (address) => address.id === selectedAddress.value
    )
    if (sel) {
      // We have selected a valid address.
      instructions.value = sel.instructions
      updatedInstructions.value = instructions.value
      return
    }
  }

  // Select first.
  if (addresses.value?.length > 0) {
    selectedAddress.value = addresses.value[0].id
    instructions.value = addresses.value[0].instructions
    updatedInstructions.value = instructions.value
  } else {
    selectedAddress.value = null
    instructions.value = null
    updatedInstructions.value = null
  }
}

function onShow() {
  showMap.value = true
  // Fetch the current addresses before opening the modal.

  selectFirst()

  if (addresses.value?.length === 0) {
    showAdd.value = true
  }
}

function onHide() {
  showAdd.value = false
  showMap.value = false
  emit('hidden')
}

async function add(callback) {
  const id = await addressStore.add({
    pafid: selectedProperty.value,
    instructions: updatedInstructions.value,
  })

  selectedAddress.value = id

  showAdd.value = false
  callback()
}

async function deleteIt(callback) {
  await addressStore.delete(selectedAddress.value)
  selectFirst()
  callback()
}

function postcodeCleared() {
  postcode.value = null
}

async function postcodeSelect(pc) {
  postcode.value = pc

  // Fetch the postal addresses within that postcode
  await addressStore.fetchProperties(pc.id)

  selectedProperty.value = 0
}

async function saveInstructions(callback) {
  await addressStore.update({
    id: selectedAddress.value,
    instructions: updatedInstructions.value,
  })
  callback()
}

function addnew() {
  showAdd.value = true
  updatedInstructions.value = null
}

function chooseIt() {
  emit('chosen', selectedAddress.value)
  hide()
}

async function updateMarker(val) {
  await addressStore.update({
    id: selectedAddress.value,
    lat: val.lat,
    lng: val.lng,
  })
}
</script>
