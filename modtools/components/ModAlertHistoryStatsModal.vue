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
<script>
import { GChart } from 'vue-google-charts'
import { pluralise } from '~/composables/usePluralise'
import { useAlertStore } from '~/stores/alert'
import { useOurModal } from '~/composables/useOurModal'

export default {
  components: {
    GChart,
  },
  props: {
    id: {
      type: Number,
      required: true,
    },
  },
  setup() {
    const alertStore = useAlertStore()
    const { modal, hide, show } = useOurModal()
    return { alertStore, modal, hide, show }
  },
  data: function () {
    return {
      chartOptions: {
        chartArea: { width: '80%', height: '80%' },
        slices: {
          0: { color: 'green' },
          1: { color: 'orange' },
        },
      },
    }
  },
  computed: {
    alert() {
      return this.alertStore.get(this.id)
    },
    groupData() {
      if (this.alert) {
        let reached = 0
        let total = 0
        this.alert.stats.responses.groups.forEach((group) => {
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
    },
    volunteerData() {
      if (this.alert) {
        return [
          ['Result', 'Count'],
          ['Responded', this.alert.stats.responses.mods.reached],
          ['No Response', this.alert.stats.responses.mods.none],
        ]
      } else {
        return null
      }
    },
  },
  async mounted() {
    // await this.alertStore.fetch({ id: this.id })
  },
  methods: {},
}
</script>
<style scoped>
label {
  font-weight: bold;
}
</style>
