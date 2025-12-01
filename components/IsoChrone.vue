<template>
  <div>
    <div v-if="!id">
      <hr />
      <p>
        You can add extra postcodes, and we'll show you the posts from near
        there too.
      </p>
      <div class="d-flex flex-wrap justify-content-between mb-2">
        <div>
          <label class="font-weight-bold"> New Postcode: </label>
          <PostCode
            v-if="!id"
            :value="pcname"
            size="sm"
            @selected="selectPostcode"
            @cleared="clearPostcode"
          />
        </div>
        <div>
          <label class="font-weight-bold"> Nickname (e.g. Work): </label>
          <b-form-input
            v-model="nickname"
            placeholder="Where is this?"
            max-length="20"
            :state="nameState"
          />
        </div>
      </div>
    </div>
    <template v-if="isochrone">
      <div class="layout">
        <label class="font-weight-bold sliderLabel mb-1">
          <div v-if="id">
            <div v-if="isochrone.nickname">
              {{ isochrone.nickname }}:
              <span class="text-faded">({{ location?.name }})</span>
            </div>
            <div v-else>
              <span v-if="myLocation"> Posts near {{ myLocation }}: </span>
              <span v-else> Nearby posts: </span>
            </div>
          </div>
          <div v-else>Nearby posts:</div>
          <div class="d-flex flex-column justify-content-around">
            <b-button
              v-if="addButton"
              variant="link"
              class="ml-2 p-0"
              size="sm"
              @click="$emit('add')"
            >
              Add location
            </b-button>
            <SpinButton
              v-else-if="isochrone.nickname"
              variant="link"
              button-class="ml-2 p-0 mb-1"
              confirm
              size="sm"
              label="Remove"
              @handle="deleteLocation"
            />
          </div>
        </label>
        <div class="slider">
          <b-button
            variant="white"
            size="sm"
            class="mr-2"
            title="Show nearer posts"
            @click="decrement"
          >
            <v-icon icon="minus" />
            <span class="d-none d-md-inline-block ml-1">Near</span>
          </b-button>
          <b-form-input
            v-model="minutes"
            type="range"
            :min="minMinutes"
            :max="maxMinutes"
            :step="step"
            class="pt-2"
          />
          <b-button
            variant="white"
            size="sm"
            class="ml-2"
            title="Show further posts"
            @click="increment"
          >
            <span class="d-none d-md-inline-block mr-1">Far</span>
            <v-icon icon="plus" />
          </b-button>
        </div>
        <label class="font-weight-bold travelLabel"> Travel by: </label>
        <div class="travel">
          <b-button
            :variant="transport === 'Walk' ? 'primary' : 'white'"
            @click="changeTransport('Walk')"
          >
            <v-icon icon="walking" /><span class="d-none d-md-inline-block"
              >&nbsp;Walk</span
            >
          </b-button>
          <b-button
            :variant="transport === 'Cycle' ? 'primary' : 'white'"
            @click="changeTransport('Cycle')"
          >
            <v-icon icon="bicycle" /><span class="d-none d-md-inline-block"
              >&nbsp;Cycle</span
            >
          </b-button>
          <b-button
            :variant="transport === 'Drive' ? 'primary' : 'white'"
            @click="changeTransport('Drive')"
          >
            <v-icon icon="car" /><span class="d-none d-md-inline-block"
              >&nbsp;Drive</span
            >
          </b-button>
        </div>
      </div>
      <div v-if="!id">
        <b-button
          v-if="showAdd"
          :disabled="!pc?.id"
          variant="primary"
          size="lg"
          class="mt-2"
          @click="add"
        >
          Add location
        </b-button>
        <b-button
          v-else
          variant="secondary"
          size="lg"
          class="mt-2"
          @click="$emit('cancel')"
        >
          Cancel
        </b-button>
      </div>
      <hr v-if="!last" class="text-muted mb-1 mt-1" />
    </template>
  </div>
</template>
<script setup>
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useLocationStore } from '~/stores/location'
import { useMessageStore } from '~/stores/message'
import PostCode from '~/components/PostCode'
import SpinButton from '~/components/SpinButton'
import { useIsochroneStore } from '~/stores/isochrone'
import { useAuthStore } from '~/stores/auth'

const props = defineProps({
  id: {
    type: Number,
    required: false,
    default: null,
  },
  addButton: {
    type: Boolean,
    required: false,
    default: false,
  },
  last: {
    type: Boolean,
    required: false,
    default: false,
  },
})

const emit = defineEmits(['add', 'cancel', 'added'])

const isochroneStore = useIsochroneStore()
const locationStore = useLocationStore()
const messageStore = useMessageStore()

// Get the list from store
const { list } = storeToRefs(isochroneStore)

// Local refs
const minutes = ref(20)
const transport = ref('Drive')
const minMinutes = ref(5)
const maxMinutes = ref(45)
const pc = ref(null)
const nickname = ref(null)
const step = ref(5)

// Initialize from store if id is provided
if (props.id) {
  minutes.value = isochroneStore.get(props.id).minutes
  transport.value = isochroneStore.get(props.id).transport
}

// Computed properties
const isochrone = computed(() => {
  if (props.id) {
    return isochroneStore.get(props.id)
  } else {
    return {
      minutes: minutes.value,
      transport: transport.value,
    }
  }
})

const location = computed(() => {
  if (isochrone.value.locationid) {
    return locationStore.byId(isochrone.value.locationid)
  }

  return null
})

const pcname = computed(() => {
  return pc.value ? pc.value.name : ''
})

const showAdd = computed(() => {
  let ret = false

  if (
    !props.id &&
    pc.value &&
    minutes.value &&
    transport.value &&
    nickname.value
  ) {
    // Check the postcode doesn't already appear.
    ret = true

    Object.values(list.value).forEach((i) => {
      if (i.location?.name === pc.value) {
        ret = false
      }
    })
  }

  return ret
})

const nameState = computed(() => {
  if (props.id) {
    return null
  } else if (nickname.value) {
    return true
  } else if (!pcname.value) {
    return null
  } else {
    // We're adding, we have a postcode but no name.
    return false
  }
})

// Fetch location data if needed
if (isochrone.value.locationid) {
  await locationStore.fetchv2(isochrone.value.locationid)
}

// Methods
function increment() {
  minutes.value = Math.min(minutes.value + step.value, maxMinutes.value)
  changeMinutes(minutes.value)
}

function decrement() {
  minutes.value = Math.max(minutes.value - step.value, minMinutes.value)
  changeMinutes(minutes.value)
}

const me = computed(() => useAuthStore().user)

function changeMinutes(newVal) {
  if (props.id) {
    isochroneStore.edit({
      id: props.id,
      minutes: newVal,
      transport: isochrone.value.transport,
    })

    if (me.value?.settings?.browseView) {
      // This might change the count we should see
      messageStore.fetchCount(me.value.settings.browseView, false)
    }
  }

  minutes.value = newVal
}

function changeTransport(type) {
  if (props.id) {
    isochroneStore.edit({
      id: props.id,
      minutes: minutes.value,
      transport: type,
    })
  }

  transport.value = type
}

function selectPostcode(postcode) {
  pc.value = postcode
}

function clearPostcode() {
  pc.value = null
}

async function add() {
  if (pc.value?.id) {
    await isochroneStore.add({
      minutes: minutes.value,
      transport: transport.value,
      locationid: pc.value.id,
      nickname: nickname.value,
    })

    minutes.value = 25
    transport.value = null
    pc.value = null
    nickname.value = null
    emit('added')
  }
}

async function deleteLocation(callback) {
  await isochroneStore.delete({ id: props.id })
  callback()
}

// Watch for changes to minutes
watch(minutes, (newVal) => {
  changeMinutes(newVal)
})
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';
@import 'assets/css/_color-vars.scss';

// Remove curved corners from buttons
:deep(button),
:deep(.btn) {
  box-shadow: none !important;
  border-radius: 0;
}

// Compact labels
label {
  font-size: 0.85rem;
}

// Slider styling
:deep(input[type='range']) {
  accent-color: $colour-success;
}

.layout {
  display: grid;

  grid-template-rows: auto auto auto auto;
  grid-template-columns: auto auto;

  .sliderLabel {
    grid-row: 1 / 2;
    grid-column: 1 / 3;
    display: flex;
    justify-content: flex-start;
  }

  .slider {
    grid-row: 2 / 3;
    grid-column: 1 / 2;
    display: flex;
  }

  .travelLabel {
    grid-row: 3 / 4;
    grid-column: 1 / 2;
    display: none;
  }

  .travel {
    grid-row: 2 / 3;
    grid-column: 2 / 3;
    display: flex;
    justify-content: flex-end;
    margin-left: 1rem;
  }

  @include media-breakpoint-up(md) {
    grid-template-rows: auto auto;
    grid-template-columns: 1fr 1fr;
    grid-column-gap: 50px;

    .sliderLabel {
      grid-row: 1 / 2;
      grid-column: 1 / 2;
      display: flex;
      justify-content: space-between;
    }

    .slider {
      grid-row: 2 / 3;
      grid-column: 1 / 2;
      display: flex;
    }

    .travelLabel {
      grid-row: 1 / 2;
      grid-column: 2 / 3;
      display: flex;
      justify-content: flex-end;
    }

    .travel {
      grid-row: 2 / 3;
      grid-column: 2 / 3;
      display: flex;
      justify-content: flex-end;
    }
  }
}
</style>
