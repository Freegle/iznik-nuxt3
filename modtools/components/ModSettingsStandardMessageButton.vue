<template>
  <div class="d-inline">
    <b-button :variant="stdmsgVariant(stdmsg)" class="mb-1 mr-2" @click="click">
      <v-icon :icon="stdmsgIcon(stdmsg)" /> {{ stdmsg.title }}
    </b-button>
    <ModSettingsStandardMessageModal v-if="showModal" ref="stdMsgModal" :id="stdmsg.id" @hidden="showModal = false" />
  </div>
</template>
<script>
import stdmsgs from '../mixins/stdmsgs'

const stdMsgModal = ref()

export default {
  mixins: [stdmsgs],
  props: {
    stdmsg: {
      type: Object,
      required: true
    }
  },
  data: function() {
    return {
      showModal: false
    }
  },
  methods: {
    click() {
      this.showModal = true
      this.$refs.stdMsgModal?.show()
    }
  }
}
</script>
