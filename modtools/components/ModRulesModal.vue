<template>
  <div>
    <b-modal ref="modal" id="modRulesModal" size="lg" no-stacking>
      <template #title>
        Please configure group rules
      </template>
      <template #default>
        <ModMissingRules expanded />
      </template>
      <template #footer>
        <b-button variant="secondary" @click="hide">
          Not now
        </b-button>
      </template>
    </b-modal>
  </div>
</template>
<script>
import { useOurModal } from '~/composables/useOurModal'

export default {
  setup() {
    const { modal, show, hide } = useOurModal()
    return { modal, show, hide }
  },
  data: function () {
    return {}
  },
  computed: {
    group() {
      return this.myGroup(this.groupid)
    }
  }
}
</script>
