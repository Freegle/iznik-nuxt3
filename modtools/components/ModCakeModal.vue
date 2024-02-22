<template>
  <div>
    <!-- DONE -->
    <b-modal ref="modal" id="modcakemodal" title="Would you like some cake?" size="lg" no-stacking>
      <template #default>
        <ModCake />
        <p class="mt-2 text-muted">
          <!-- eslint-disable-next-line -->
          You can change your mind later from <nuxt-link to="/settings">Settings->Personal</nuxt-link>.
        </p>
      </template>
      <template #footer>
        <b-button variant="primary" @click="hide">
          Close
        </b-button>
      </template>
    </b-modal>
  </div>
</template>
<script>
import { useMiscStore } from '@/stores/misc'
import { useModal } from '~/composables/useModal'
import ModCake from '~/components/ModCake'

export default {
  components: {
    ModCake
  },
  setup() {
    const { modal, hide } = useModal()
    return { modal, hide }
  },
  mounted() {
    const miscStore = useMiscStore()
    this.modal.hide()
    if (!miscStore.get('cakeasked')) {
      this.modal.show()

      miscStore.set({ key: 'cakeasked', value: true })
    }
  }
}
</script>
