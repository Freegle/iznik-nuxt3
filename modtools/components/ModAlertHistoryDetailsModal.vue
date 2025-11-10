<template>
  <div>
    <b-modal :id="'alertModal-' + alert.id" ref="modal" size="lg" no-stacking>
      <template #title>
        {{ alert.subject }}
      </template>
      <template #default>
        <label>Text version</label>
        <b-form-textarea v-model="alert.text" rows="10" readonly />
        <div v-if="alert.html" class="bg-light mt-2">
          <label>HTML version (optional)</label>
          <!-- eslint-disable-next-line -->
          <div v-html="alert.html" class="bg-info" />
        </div>
      </template>
      <template #footer>
        <b-button variant="white" @click="hide"> Close </b-button>
      </template>
    </b-modal>
  </div>
</template>
<script>
import { useAlertStore } from '~/stores/alert'
import { useOurModal } from '~/composables/useOurModal'

export default {
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
  computed: {
    alert() {
      const a = this.alertStore.get(this.id)
      return this.alertStore.get(this.id)
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
