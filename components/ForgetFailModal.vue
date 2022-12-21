<template>
  <b-modal
    id="forgetfailmodal"
    v-model="showModal"
    title="Sorry, that didn't work"
    no-stacking
  >
    <template #default>
      <b-row>
        <b-col>
          <p>Please contact <SupportLink /> if you need further help.</p>
        </b-col>
      </b-row>
    </template>
    <template #footer>
      <b-button variant="white" @click="hide"> Close </b-button>
    </template>
  </b-modal>
</template>
<script>
import modal from '@/mixins/modal'
import SupportLink from '~/components/SupportLink'

export default {
  components: { SupportLink },
  mixins: [modal],
  methods: {
    confirm() {
      this.$emit('confirm')
      this.hide()
    },
  },
}
</script>
