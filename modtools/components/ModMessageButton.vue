<template>
  <div class="d-inline">
    <div class="position-relative d-inline-block">
      <SpinButton
        :variant="variant"
        :spinclass="spinclass"
        :icon-name="icon"
        :label="label"
        :flex="false"
        class="mb-1 me-1 d-inline-block"
        icon-class="pe-1"
        :disabled="disabled"
        :confirm="confirmButton"
        @handle="click"
      />
      <v-icon
        v-if="autosend"
        icon="chevron-circle-right"
        title="Autosend - configured to send immediately without edit"
        class="autosend"
      />
    </div>
    <ConfirmModal
      v-if="showDeleteModal"
      ref="deleteConfirm"
      :title="'Delete: ' + message.subject"
      @confirm="deleteConfirmed"
      @hidden="showDeleteModal = false"
    />
    <ConfirmModal
      v-if="showSpamModal"
      ref="spamConfirm"
      :title="'Mark as Spam: ' + message.subject"
      @confirm="spamConfirmed"
      @hidden="showSpamModal = false"
    />
    <ModStdMessageModal
      v-if="showStdMsgModal"
      ref="stdmodal"
      :stdmsg="stdmsg"
      :message="message"
      :autosend="autosend"
      @hidden="showStdMsgModal = false"
    />
  </div>
</template>
<script>
// SEE WORK EXPLANATION IN useModMessages.js

import { useMessageStore } from '~/stores/message'
import { useStdmsgStore } from '~/stores/stdmsg'
import { useModMe } from '~/composables/useModMe'

export default {
  props: {
    message: {
      type: Object,
      required: true,
    },
    stdmsgid: {
      type: Number,
      required: false,
      default: null,
    },
    variant: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: true,
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
    approve: {
      type: Boolean,
      required: false,
      default: false,
    },
    delete: {
      type: Boolean,
      required: false,
      default: false,
    },
    hold: {
      type: Boolean,
      required: false,
      default: false,
    },
    holdMessage: {
      type: Boolean,
      required: false,
      default: false,
    },
    release: {
      type: Boolean,
      required: false,
      default: false,
    },
    reject: {
      type: Boolean,
      required: false,
      default: false,
    },
    leave: {
      type: Boolean,
      required: false,
      default: false,
    },
    spam: {
      type: Boolean,
      required: false,
      default: false,
    },
    approveedits: {
      type: Boolean,
      required: false,
      default: false,
    },
    revertedits: {
      type: Boolean,
      required: false,
      default: false,
    },
    autosend: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  setup() {
    const messageStore = useMessageStore()
    const stdmsgStore = useStdmsgStore()
    const { checkWorkDeferGetMessages } = useModMe()
    return { messageStore, stdmsgStore, checkWorkDeferGetMessages }
  },
  data: function () {
    return {
      showDeleteModal: false,
      showStdMsgModal: false,
      showSpamModal: false,
      stdmsg: null,
    }
  },
  computed: {
    groupid() {
      let ret = null

      if (this.message && this.message.groups && this.message.groups.length) {
        ret = this.message.groups[0].groupid
      }

      return ret
    },
    spinclass() {
      if (this.variant === 'primary') {
        // Primary buttons have "success" (green) class.
        return 'success'
      }

      return null
    },
    confirmButton() {
      // We confirm any actions on held messages, except where we have a separate confirm.
      return this.message.heldby && !this.spam && !this.delete
    },
  },
  methods: {
    async click(callback) {
      if (this.approve) {
        // Standard approve button - no modal.
        await this.approveIt()
      } else if (this.delete) {
        // Standard delete button - no modal.
        await this.deleteIt()
      } else if (this.hold) {
        // Standard hold button - no modal.
        await this.holdIt()
      } else if (this.release) {
        // Standard release button - no modal.
        await this.releaseIt()
      } else if (this.spam) {
        // Standard spam button.
        this.showSpamModal = true
      } else if (this.approveedits) {
        await this.approveEdits()
      } else if (this.revertedits) {
        await this.revertEdits()
      } else {
        // We want to show a modal.
        if (this.reject) {
          this.stdmsg = {
            action: 'Reject',
          }
        } else if (this.leave) {
          this.stdmsg = {
            action: 'Leave',
          }
        } else if (this.stdmsgid) {
          // We have a standard message.  Fetch it.
          this.stdmsg = await this.stdmsgStore.fetch(this.stdmsgid)
        }

        this.showStdMsgModal = true
        this.$refs.stdmodal?.show()
        await this.$nextTick()
        this.$refs.stdmodal?.fillin()
      }
      if (callback) callback()
    },
    async approveIt() {
      await this.messageStore.approve({
        id: this.message.id,
        groupid: this.groupid,
      })
      this.checkWorkDeferGetMessages()
    },
    deleteIt() {
      this.showDeleteModal = true
    },
    async deleteConfirmed() {
      await this.messageStore.delete({
        id: this.message.id,
        groupid: this.groupid,
      })
      this.checkWorkDeferGetMessages()
    },
    async spamConfirmed() {
      await this.messageStore.spam({
        id: this.message.id,
        groupid: this.groupid,
      })
      this.checkWorkDeferGetMessages()
    },
    async holdIt() {
      await this.messageStore.hold({
        id: this.message.id,
      })
      this.checkWorkDeferGetMessages()
    },
    async releaseIt() {
      await this.messageStore.release({
        id: this.message.id,
      })
      this.checkWorkDeferGetMessages()
    },
    async approveEdits() {
      await this.messageStore.approveedits({
        id: this.message.id,
      })
      this.checkWorkDeferGetMessages()
    },
    async revertEdits() {
      await this.messageStore.revertedits({
        id: this.message.id,
      })
      this.checkWorkDeferGetMessages()
    },
  },
}
</script>
<style scoped lang="scss">
.autosend {
  right: 4px;
  bottom: 0px;
  position: absolute;
  color: $color-purple;
}
</style>
