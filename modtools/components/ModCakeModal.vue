<template>
  <div>
    <b-modal
      id="modcakemodal"
      ref="modal"
      title="Would you like some cake?"
      size="lg"
      no-stacking
    >
      <template #default>
        <ModCake />
        <p class="mt-2 text-muted">
          <!-- eslint-disable-next-line -->
          You can change your mind later from <nuxt-link to="/settings">Settings->Personal</nuxt-link>.
        </p>
      </template>
      <template #footer>
        <b-button variant="primary" @click="hide"> Close </b-button>
      </template>
    </b-modal>
  </div>
</template>
<script>
import { useOurModal } from '~/composables/useOurModal'

export default {
  setup() {
    const { modal, hide } = useOurModal()
    return { modal, hide }
  },
}
</script>
