<template>
  <div class="d-inline">
    <b-button :variant="variant(stdmsg)" class="mb-1 mr-2" @click="click">
      <v-icon :icon="icon(stdmsg)" /> {{ stdmsg.title }}
    </b-button>
    <ModSettingsStandardMessageModal
      v-if="showModal"
      :id="stdmsg.id"
      ref="stdMsgModal"
      @hidden="showModal = false"
    />
  </div>
</template>
<script>
import { icon, variant } from '~/composables/useStdMsgs'

const stdMsgModal = ref()

export default {
  props: {
    stdmsg: {
      type: Object,
      required: true,
    },
  },
  data: function () {
    return {
      showModal: false,
    }
  },
  methods: {
    click() {
      this.showModal = true
      this.$refs.stdMsgModal?.show()
    },
  },
}
</script>
