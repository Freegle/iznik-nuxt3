<template>
  <div>
    <b-modal :id="'alertModal-' + alert.id" ref="modal" size="lg" no-stacking>
      <template #title>
        {{ alert.subject }}
      </template>
      <template #default>
        <div v-if="alert">
          <p v-if="!alert.complete">This hasn't finished sending yet.</p>
          <div v-else>
            <p>
              If we think a group or volunteer has been reached, then we're
              confident about it. If we think they haven't, then we could be
              wrong. But this gives a pretty good idea.
            </p>
            <h2>Group Stats</h2>
            <p>
              Sent to
              {{
                pluralise('group', alert.stats.responses.groups.length, true)
              }}.
            </p>
            <GChart type="PieChart" :data="groupData" :options="chartOptions" />
            <h2>Volunteer Stats</h2>
            <p>
              Sent to
              {{ pluralise('volunteer', alert.stats.sent.mods, true) }} via
              {{
                pluralise(
                  ['email address', 'email addresses'],
                  alert.stats.sent.modemails,
                  true
                )
              }}.
            </p>
            <GChart
              type="PieChart"
              :data="volunteerData"
              :options="chartOptions"
            />
          </div>
        </div>
      </template>
      <template #footer>
        <b-button variant="white" @click="hide"> Close </b-button>
      </template>
    </b-modal>
  </div>
</template>
<script setup>
import { computed } from 'vue'
import { GChart } from 'vue-google-charts'
import { useAlertStore } from '~/stores/alert'
import { useOurModal } from '~/composables/useOurModal'

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
})

const alertStore = useAlertStore()
const { modal, hide, show } = useOurModal()

const chartOptions = {
  chartArea: { width: '80%', height: '80%' },
  slices: {
    0: { color: 'green' },
    1: { color: 'orange' },
  },
}

const alert = computed(() => alertStore.get(props.id))

const groupData = computed(() => {
  if (alert.value) {
    let reached = 0
    let total = 0
    alert.value.stats.responses.groups.forEach((group) => {
      total++
      group.summary.forEach((result) => {
        if (result.rsp === 'Reached') {
          reached++
        }
      })
    })

    return [
      ['Result', 'Count'],
      ['Responded', reached],
      ['No Response', total - reached],
    ]
  } else {
    return null
  }
})

const volunteerData = computed(() => {
  if (alert.value) {
    return [
      ['Result', 'Count'],
      ['Responded', alert.value.stats.responses.mods.reached],
      ['No Response', alert.value.stats.responses.mods.none],
    ]
  } else {
    return null
  }
})

defineExpose({ show, hide })
</script>
<style scoped>
label {
  font-weight: bold;
}
</style>
