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
<script setup>
// SEE WORK EXPLANATION IN useModMessages.js

import { ref, computed, nextTick } from 'vue'
import { useMessageStore } from '~/stores/message'
import { useStdmsgStore } from '~/stores/stdmsg'
import { useModMe } from '~/composables/useModMe'

const props = defineProps({
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
})

const messageStore = useMessageStore()
const stdmsgStore = useStdmsgStore()
const { checkWorkDeferGetMessages } = useModMe()

const stdmodal = ref(null)

const showDeleteModal = ref(false)
const showStdMsgModal = ref(false)
const showSpamModal = ref(false)
const stdmsg = ref(null)

const groupid = computed(() => {
  let ret = null

  if (props.message && props.message.groups && props.message.groups.length) {
    ret = props.message.groups[0].groupid
  }

  return ret
})

const spinclass = computed(() => {
  if (props.variant === 'primary') {
    // Primary buttons have "success" (green) class.
    return 'success'
  }

  return null
})

const confirmButton = computed(() => {
  // We confirm any actions on held messages, except where we have a separate confirm.
  return props.message.heldby && !props.spam && !props.delete
})

async function approveIt() {
  await messageStore.approve({
    id: props.message.id,
    groupid: groupid.value,
  })
  checkWorkDeferGetMessages()
}

function deleteIt() {
  showDeleteModal.value = true
}

async function deleteConfirmed() {
  await messageStore.delete({
    id: props.message.id,
    groupid: groupid.value,
  })
  checkWorkDeferGetMessages()
}

async function spamConfirmed() {
  await messageStore.spam({
    id: props.message.id,
    groupid: groupid.value,
  })
  checkWorkDeferGetMessages()
}

async function holdIt() {
  await messageStore.hold({
    id: props.message.id,
  })
  checkWorkDeferGetMessages()
}

async function releaseIt() {
  await messageStore.release({
    id: props.message.id,
  })
  checkWorkDeferGetMessages()
}

async function approveEdits() {
  await messageStore.approveedits({
    id: props.message.id,
  })
  checkWorkDeferGetMessages()
}

async function revertEdits() {
  await messageStore.revertedits({
    id: props.message.id,
  })
  checkWorkDeferGetMessages()
}

async function click(callback) {
  if (props.approve) {
    // Standard approve button - no modal.
    await approveIt()
  } else if (props.delete) {
    // Standard delete button - no modal.
    await deleteIt()
  } else if (props.hold) {
    // Standard hold button - no modal.
    await holdIt()
  } else if (props.release) {
    // Standard release button - no modal.
    await releaseIt()
  } else if (props.spam) {
    // Standard spam button.
    showSpamModal.value = true
  } else if (props.approveedits) {
    await approveEdits()
  } else if (props.revertedits) {
    await revertEdits()
  } else {
    // We want to show a modal.
    if (props.reject) {
      stdmsg.value = {
        action: 'Reject',
      }
    } else if (props.leave) {
      stdmsg.value = {
        action: 'Leave',
      }
    } else if (props.stdmsgid) {
      // We have a standard message.  Fetch it.
      stdmsg.value = await stdmsgStore.fetch(props.stdmsgid)
    }

    showStdMsgModal.value = true
    stdmodal.value?.show()
    await nextTick()
    stdmodal.value?.fillin()
  }
  if (callback) callback()
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
