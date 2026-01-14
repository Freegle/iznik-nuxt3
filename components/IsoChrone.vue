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
      <div class="isochrone-card">
        <!-- Header row -->
        <div class="isochrone-header">
          <span class="location-name">
            <template v-if="id">
              <template v-if="isochrone.nickname">
                {{ isochrone.nickname }}
                <span v-if="location?.name" class="postcode-hint">
                  ({{ location.name }})
                </span>
              </template>
              <template v-else-if="myLocation">
                {{ myLocation }}
              </template>
              <template v-else> Nearby </template>
            </template>
            <template v-else>Nearby</template>
          </span>
          <!-- Transport chips - inline with postcode on desktop -->
          <div class="transport-chips transport-chips-desktop">
            <button
              :class="['transport-chip', { active: transport === 'Walk' }]"
              @click="changeTransport('Walk')"
            >
              <v-icon icon="walking" />
            </button>
            <button
              :class="['transport-chip', { active: transport === 'Cycle' }]"
              @click="changeTransport('Cycle')"
            >
              <v-icon icon="bicycle" />
            </button>
            <button
              :class="['transport-chip', { active: transport === 'Drive' }]"
              @click="changeTransport('Drive')"
            >
              <v-icon icon="car" />
            </button>
          </div>
          <div class="header-actions">
            <button v-if="addButton" class="link-btn" @click="$emit('add')">
              + Add
            </button>
            <SpinButton
              v-else-if="isochrone.nickname"
              variant="link"
              button-class="link-btn"
              confirm
              size="sm"
              label="Remove"
              @handle="deleteLocation"
            />
          </div>
        </div>

        <!-- Slider row -->
        <div class="slider-row">
          <button class="slider-btn" title="Nearer" @click="decrement">
            <v-icon icon="minus" />
          </button>
          <input
            v-model="minutes"
            type="range"
            :min="minMinutes"
            :max="maxMinutes"
            :step="step"
            class="range-slider"
          />
          <button class="slider-btn" title="Further" @click="increment">
            <v-icon icon="plus" />
          </button>
        </div>

        <!-- Transport chips - mobile only -->
        <div class="transport-chips transport-chips-mobile">
          <button
            :class="['transport-chip', { active: transport === 'Walk' }]"
            @click="changeTransport('Walk')"
          >
            <v-icon icon="walking" />
          </button>
          <button
            :class="['transport-chip', { active: transport === 'Cycle' }]"
            @click="changeTransport('Cycle')"
          >
            <v-icon icon="bicycle" />
          </button>
          <button
            :class="['transport-chip', { active: transport === 'Drive' }]"
            @click="changeTransport('Drive')"
          >
            <v-icon icon="car" />
          </button>
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

.isochrone-card {
  background: $color-white;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  border-left: 3px solid $colour-success;
}

.isochrone-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.location-name {
  font-weight: 600;
  font-size: 0.9rem;
  color: $color-gray--darker;
}

.postcode-hint {
  font-weight: 400;
  font-size: 0.8rem;
  color: $color-gray--dark;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.link-btn {
  background: none;
  border: none;
  color: $colour-secondary;
  font-size: 0.8rem;
  cursor: pointer;
  padding: 0;

  &:hover {
    text-decoration: underline;
  }
}

.slider-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.slider-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $color-gray--lighter;
  border: 1px solid $color-gray-3;
  color: $color-gray--darker;
  cursor: pointer;
  flex-shrink: 0;

  &:hover {
    background: darken($color-gray--lighter, 5%);
  }

  &:active {
    background: darken($color-gray--lighter, 10%);
  }
}

.range-slider {
  flex: 1;
  height: 6px;
  accent-color: $colour-success;
  cursor: pointer;
}

.transport-chips {
  display: flex;
  gap: 0.25rem;
}

/* Mobile: show bottom chips, hide header chips */
.transport-chips-mobile {
  display: flex;
}

.transport-chips-desktop {
  display: none;
}

.transport-chip {
  width: 40px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $color-gray--lighter;
  border: 1px solid $color-gray-3;
  color: $color-gray--dark;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: darken($color-gray--lighter, 5%);
  }

  &.active {
    background: $colour-success;
    border-color: $colour-success;
    color: $color-white;
  }
}

/* Desktop layout */
@include media-breakpoint-up(md) {
  .isochrone-card {
    padding: 1rem;
  }

  .isochrone-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.5rem;
  }

  .slider-row {
    margin-bottom: 0;
  }

  /* Desktop: show header chips, hide bottom chips */
  .transport-chips-mobile {
    display: none;
  }

  .transport-chips-desktop {
    display: flex;
  }

  .header-actions {
    margin-left: auto;
  }

  .transport-chip {
    width: 36px;
    height: 32px;
  }
}
</style>
