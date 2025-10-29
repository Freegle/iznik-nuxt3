<template>
  <b-card no-body class="p-2">
    <b-card-text class="">
      <div class="d-block d-sm-none w-100">
        <b-form-select
          v-model="selectedArea"
          :options="areaOptions"
          class="d-block"
        />
        <div v-if="areaname" class="d-block mt-1">
          <v-icon icon="map-marker-alt" />
          <span
            v-b-tooltip="
              'This is where other people will see that you are.  Change your location from Settings.'
            "
            class="ml-1"
            >{{ areaname }}</span
          >
        </div>
      </div>
      <div class="d-none d-sm-flex align-items-center">
        <div v-if="areaname" class="w-50">
          <v-icon icon="map-marker-alt" />
          <span
            v-b-tooltip="
              'This is where other people will see that you are.  Change your location from Settings.'
            "
            class="ml-1"
            >{{ areaname }}</span
          >
        </div>
        <b-form-select
          v-model="selectedArea"
          :options="areaOptions"
          class="w-50"
        />
      </div>
    </b-card-text>
  </b-card>
</template>
<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useLocationStore } from '~/stores/location'
import { useMe } from '~/composables/useMe'

const emit = defineEmits(['changed'])

const authStore = useAuthStore()
const locationStore = useLocationStore()
const { me } = useMe()

const areaOptions = [
  {
    value: 'nearby',
    text: 'Show chitchat from nearby',
  },
  {
    value: 1609,
    text: 'Show chitchat within 1 mile',
  },
  {
    value: 3128,
    text: 'Show chitchat within 2 miles',
  },
  {
    value: 8046,
    text: 'Show chitchat within 5 miles',
  },
  {
    value: 16093,
    text: 'Show chitchat within 10 miles',
  },
  {
    value: 32186,
    text: 'Show chitchat within 20 miles',
  },
  {
    value: 80467,
    text: 'Show chitchat within 50 miles',
  },
  {
    value: '0',
    text: 'Show chitchat from anywhere',
  },
]

// Sometimes the settings are wrong and don't contain the full area.
const areaname = ref(me.value?.settings?.mylocation?.area?.name)
const areaid = computed(() => me.value?.settings?.mylocation?.areaid)

// For the v-model binding
const selectedArea = computed({
  get() {
    const settings = me.value?.settings
    return settings?.newsfeedarea || 0
  },
  async set(newval) {
    const settings = me.value.settings
    settings.newsfeedarea = newval

    await authStore.saveAndGet({
      settings,
    })

    emit('changed')
  },
})

// Initialize location data if needed
const initialize = async () => {
  if (!areaname.value && areaid.value) {
    const loc = await locationStore.fetchv2(areaid.value)
    areaname.value = loc.name
  }
}

// Run initialization
initialize()
</script>
