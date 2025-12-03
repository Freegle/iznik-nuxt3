<template>
  <div class="test-place-autocomplete">
    <label :for="inputId" class="smaller font-weight-bold mb-1">
      <span v-if="labeltextSr" class="visually-hidden">
        {{ labeltextSr }}
      </span>
      {{ labeltext }}
    </label>
    <AutoComplete
      :id="inputId"
      ref="autocomplete"
      v-model="wip"
      :init-value="value"
      restrict
      :url="source"
      param="q"
      :custom-params="{
        bbox: '-7.57216793459,49.959999905,1.68153079591,58.6350001085',
      }"
      anchor="name"
      label=""
      placeholder="Type your location"
      :classes="{
        input:
          'form-control form-control-' + size + ' text-center test-place-input',
        list: 'locationlist test-place-suggestions',
        listentry: 'w-100 listentry test-place-suggestion-item',
        listentrylist: 'listentrylist',
      }"
      :min="3"
      :debounce="200"
      :process="process"
      :on-select="select"
      :size="30"
      variant="success"
      :on-before-ajax="postcodeSearch"
    />
    <div />
  </div>
</template>
<script setup>
import { ref, computed, useRuntimeConfig } from '#imports'
import AutoComplete from '~/components/AutoComplete'
import { POSTCODE_REGEX } from '~/constants'
import { useLocationStore } from '~/stores/location'

defineProps({
  value: {
    type: String,
    required: false,
    default: null,
  },
  labeltext: {
    type: String,
    required: false,
    default: null,
  },
  labeltextSr: {
    type: String,
    required: false,
    default: null,
  },
  size: {
    type: String,
    required: false,
    default: 'lg',
  },
  inputId: {
    type: String,
    required: false,
    default: 'placeautocomplete',
  },
})

const emit = defineEmits(['selected', 'cleared'])

const locationStore = useLocationStore()
const runtimeConfig = useRuntimeConfig()

const wip = ref(null)
const autocomplete = ref(null)

const source = computed(() => {
  return runtimeConfig.public.GEOCODE
})

async function postcodeSearch(val) {
  const ret = []

  if (POSTCODE_REGEX.test(val)) {
    // We have a probable postcode. We can search for it. This is because our list of postcodes is more
    // reliable than the Photon geocoder handling of postcodes.
    const loc = await locationStore.typeahead(val)

    if (loc?.length) {
      loc.forEach((l) => {
        const bbox = [
          [l.lat - 0.01, l.lng - 0.01],
          [l.lat + 0.01, l.lng + 0.01],
        ]

        ret.push({
          id: -l.id,
          name: l.area?.name ? l.name + ', ' + l.area.name : l.name,
          lat: l.lat,
          lng: l.lng,
          bbox,
        })
      })
    }
  }

  return ret
}

function process(processResults) {
  const ret = []

  if (processResults && processResults.features) {
    const feat = processResults.features.slice(0, 5)

    feat.forEach((f) => {
      if (f.geometry && f.geometry.coordinates && f.properties) {
        // We want a bounding box. There may be one in properties.extent.
        let bbox = null

        if (f.properties.extent) {
          // There is. That's what we need.
          bbox = [
            [f.properties.extent[1], f.properties.extent[0]],
            [f.properties.extent[3], f.properties.extent[2]],
          ]
        } else if (f.geometry.type === 'Point') {
          // No extent, so make up a bounding box very close to this point. PostMap will zoom out.
          bbox = [
            [
              f.geometry.coordinates[1] - 0.01,
              f.geometry.coordinates[0] - 0.01,
            ],
            [
              f.geometry.coordinates[1] + 0.01,
              f.geometry.coordinates[0] + 0.01,
            ],
          ]
        }

        if (bbox) {
          let str = ''

          // Take the bits we want and make a string.
          ;['name', 'street', 'suburb', 'hamlet', 'town', 'city'].forEach(
            (k) => {
              if (k in f.properties) {
                if (str === '') {
                  str = f.properties[k]
                } else {
                  str += ', ' + f.properties[k]
                }
              }
            }
          )

          ret.push({
            id: f.properties.osm_id,
            name: str,
            bbox,
            lat: f.geometry.coordinates[1],
            lng: f.geometry.coordinates[0],
          })
        }
      }
    })
  }

  return ret
}

function select(place) {
  if (place) {
    emit('selected', place)
  } else {
    emit('cleared')
  }
}
</script>
<style scoped lang="scss">
:deep(.listentrylist) {
  width: 100%;
  right: 0 !important;
  border-color: $color-blue--light;
  outline: 0;
  box-shadow: 0 1px 0 0.2rem rgba(0, 123, 255, 0.25);
}

:deep(.listentry mark) {
  padding-left: 0;
  padding-right: 0;
}
</style>
