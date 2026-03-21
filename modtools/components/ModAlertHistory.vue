<template>
  <b-row v-if="alert">
    <b-col cols="6" lg="2">
      {{ datetimeshort(alert.created) }}
    </b-col>
    <b-col cols="6" lg="2">
      {{ datetimeshort(alert.complete) }}
    </b-col>
    <b-col cols="6" lg="2">
      <div v-if="alert.group">
        {{ alert.group.nameshort }}
      </div>
    </b-col>
    <b-col cols="6" lg="4">
      {{ alert.subject }}
    </b-col>
    <b-col cols="6" lg="2">
      <b-button variant="white" class="me-1" @click="stats">
        Show Stats
      </b-button>
      <b-button variant="white" @click="details"> Show Details </b-button>
    </b-col>
    <ModAlertHistoryDetailsModal
      v-if="showDetails"
      :id="alertid"
      ref="detailsModal"
      @hidden="showDetails = false"
    />
    <ModAlertHistoryStatsModal
      v-if="showStats"
      :id="alertid"
      ref="statsModal"
      @hidden="showStats = false"
    />
  </b-row>
</template>
<script setup>
import { ref, computed } from 'vue'
import { useAlertStore } from '~/stores/alert'

const alertStore = useAlertStore()

const props = defineProps({
  alertid: {
    type: Number,
    required: true,
  },
})

const alert = computed(() => alertStore.get(props.alertid))

const showDetails = ref(false)
const showStats = ref(false)
const detailsModal = ref(null)
const statsModal = ref(null)

function details() {
  showDetails.value = true
  detailsModal.value?.show()
}

function stats() {
  showStats.value = true
  statsModal.value?.show()
}
</script>
