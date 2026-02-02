<template>
  <b-card no-body>
    <b-card-header class="bg-info"> KML Converter </b-card-header>
    <b-card-body>
      <p>
        This converts KML to WKT. It is mostly useful for NGT when changing
        group areas.
      </p>
      <b-form-textarea v-model="kml" rows="2" placeholder="Enter KML here" />
      <b-button variant="white" class="mt-2" @click="convert">
        Convert
      </b-button>
      <div v-if="wkt">
        <b-form-textarea v-model="wkt" rows="2" />
      </div>
    </b-card-body>
  </b-card>
</template>
<script setup>
import { ref } from 'vue'
import { useLocationStore } from '@/stores/location'

const locationStore = useLocationStore()

const kml = ref(null)
const wkt = ref(null)

async function convert() {
  wkt.value = await locationStore.convertKML(kml.value)
}
</script>
