<template>
  <div>
    <b-modal
      id="modRulesModal"
      ref="modal"
      size="lg"
      no-stacking
      no-close-on-backdrop
      no-close-on-esc
      hide-header-close
    >
      <template #title> Please configure group rules </template>
      <template #default>
        <ModMissingRules expanded />
      </template>
      <template #footer>
        <b-button variant="secondary" :disabled="enableIn > 0" @click="hide">
          Not now
          <span v-if="enableIn > 0">({{ enableIn }})</span>
        </b-button>
      </template>
    </b-modal>
  </div>
</template>
<script>
import { useOurModal } from '~/composables/useOurModal'
import { useMe } from '~/composables/useMe'

export default {
  setup() {
    const { modal, show, hide } = useOurModal()
    const { myGroup } = useMe()
    return { modal, show, hide, myGroup }
  },
  data: function () {
    return {
      enableIn: 0,
      timer: null,
    }
  },
  computed: {
    group() {
      return this.myGroup(this.groupid)
    },
    delay() {
      const now = new Date()
      const start = new Date(now.getFullYear(), 3, 6)
      const diff = now - start
      const oneDay = 1000 * 60 * 60 * 24
      return Math.floor(diff / oneDay)
    },
  },
  mounted() {
    this.enableIn = this.delay
    this.timer = setTimeout(this.tick, 1000)
  },
  beforeUnmount() {
    if (this.timer) {
      clearTimeout(this.timer)
    }
  },
  methods: {
    tick() {
      this.timer = null
      if (this.enableIn > 0) {
        this.enableIn -= 1
        this.timer = setTimeout(this.tick, 1000)
      }
    },
  },
}
</script>
