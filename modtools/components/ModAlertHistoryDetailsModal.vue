<template>
  <div>
    <b-modal ref="modal" :id="'alertModal-' + alert.id" size="lg" no-stacking>
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
        <b-button variant="white" @click="hide">
          Close
        </b-button>
      </template>
    </b-modal>
  </div>
</template>
<script>
import { useOurModal } from '~/composables/useOurModal'
import { useAlertStore } from './stores/alert'

export default {
  setup() {
    const alertStore = useAlertStore()
    const { modal, hide, show } = useOurModal()
    return { alertStore, modal, hide, show }
  },
  props: {
    id: {
      type: Number,
      required: true
    }
  },
  computed: {
    alert() {
      console.log("MAHDM alert", this.id)
      const a = this.alertStore.get(this.id)
      console.log("MAHDM a", a)
      return this.alertStore.get(this.id)
    }
  },
  methods: {
    async show() {
      console.log("MAHDM show", this.id)
      await this.alertStore.fetch({ id: this.id })

      //this.modal.show()
    }
  }
}
</script>
<style scoped>
label {
  font-weight: bold;
}
</style>
