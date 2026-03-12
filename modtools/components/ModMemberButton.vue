<template>
  <div class="d-inline">
    <div class="position-relative d-inline-block">
      <SpinButton
        :variant="variant"
        :icon-name="icon"
        :label="label"
        class="mb-1"
        :spinclass="spinclass"
        :disabled="disabled"
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
      :title="'Delete: ' + (user ? user.displayname : '#' + userid)"
      @confirm="deleteConfirmed"
    />
    <ModSpammerReport v-if="showSpamModal" ref="spamConfirm" :userid="userid" />
    <ModStdMessageModal
      v-if="showStdMsgModal"
      ref="stdmodal"
      :stdmsgid="stdmsgId"
      :stdmsgaction="stdmsgAction"
      :membershipid="membershipid"
      :autosend="autosend"
    />
  </div>
</template>
<script setup>
import { ref, computed, nextTick, watch } from 'vue'
import { useMemberStore } from '~/stores/member'
import { useUserStore } from '~/stores/user'
import { useSpammerStore } from '~/stores/spammer'
import { useStdmsgStore } from '~/stores/stdmsg'
import { useMe } from '~/composables/useMe'

const props = defineProps({
  userid: {
    type: Number,
    required: true,
  },
  groupid: {
    type: Number,
    required: false,
    default: null,
  },
  membershipid: {
    type: Number,
    required: false,
    default: null,
  },
  spammerid: {
    type: Number,
    required: false,
    default: null,
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
  delete: {
    type: Boolean,
    required: false,
    default: false,
  },
  release: {
    type: Boolean,
    required: false,
    default: false,
  },
  spamreport: {
    type: Boolean,
    required: false,
    default: false,
  },
  spamrequestremove: {
    type: Boolean,
    required: false,
    default: false,
  },
  spamremove: {
    type: Boolean,
    required: false,
    default: false,
  },
  spamconfirm: {
    type: Boolean,
    required: false,
    default: false,
  },
  spamsafelist: {
    type: Boolean,
    required: false,
    default: false,
  },
  reviewhold: {
    type: Boolean,
    required: false,
    default: false,
  },
  reviewrelease: {
    type: Boolean,
    required: false,
    default: false,
  },
  spamhold: {
    type: Boolean,
    required: false,
    default: false,
  },
  spamignore: {
    type: Boolean,
    required: false,
    default: false,
  },
  leave: {
    type: Boolean,
    required: false,
    default: false,
  },
  autosend: {
    type: Boolean,
    required: false,
    default: false,
  },
  reviewgroupid: {
    type: Number,
    required: false,
    default: null,
  },
})

const emit = defineEmits(['pressed'])

const memberStore = useMemberStore()
const userStore = useUserStore()
const spammerStore = useSpammerStore()
const stdmsgStore = useStdmsgStore()
const { myid } = useMe()

const deleteConfirm = ref(null)
const spamConfirmRef = ref(null)
const stdmodal = ref(null)

const showDeleteModal = ref(false)
const showStdMsgModal = ref(false)
const showSpamModal = ref(false)
const stdmsgId = ref(null)
const stdmsgAction = ref(null)

const user = computed(() => userStore.byId(props.userid))

watch(
  () => props.userid,
  (uid) => {
    if (uid && !userStore.byId(uid)) userStore.fetch(uid)
  },
  { immediate: true }
)

const spinclass = computed(() => {
  if (props.variant === 'primary') {
    return 'success'
  }

  return null
})

function approveIt() {
  alert('MMB memberStore.approve NOT DEFINED')
}

function deleteIt() {
  showDeleteModal.value = true
  deleteConfirm.value?.show()
}

function spamReport() {
  showSpamModal.value = true
  spamConfirmRef.value?.show()
}

async function spamConfirmAction() {
  await spammerStore.confirm({
    id: props.spammerid,
    userid: props.userid,
  })
}

async function spamRequestRemove() {
  await spammerStore.requestremove({
    id: props.spammerid,
    userid: props.userid,
  })
}

async function spamRemove() {
  await spammerStore.remove({
    id: props.spammerid,
    userid: props.userid,
  })
}

async function spamSafelist() {
  await spammerStore.safelist({
    id: props.spammerid,
    userid: props.userid,
    myid: myid.value,
  })
}

async function spamHold() {
  await spammerStore.hold({
    id: props.spammerid,
    userid: props.userid,
    myid: myid.value,
  })
}

async function deleteConfirmed() {
  await memberStore.delete({
    id: props.userid,
    groupid: props.groupid,
  })
}

async function reviewHoldIt() {
  await memberStore.reviewHold({
    membershipid: props.membershipid,
    groupid: props.reviewgroupid ?? props.groupid,
  })
}

async function reviewReleaseIt() {
  await memberStore.reviewRelease({
    membershipid: props.membershipid,
    groupid: props.reviewgroupid ?? props.groupid,
  })
}

async function releaseIt() {
  await spammerStore.release({
    id: props.spammerid,
    userid: props.userid,
  })
}

async function click(callback) {
  if (props.approve) {
    await approveIt()
  } else if (props.delete) {
    await deleteIt()
  } else if (props.spamreport) {
    await spamReport()
  } else if (props.spamconfirm) {
    await spamConfirmAction()
  } else if (props.spamrequestremove) {
    await spamRequestRemove()
  } else if (props.spamremove) {
    await spamRemove()
  } else if (props.spamsafelist) {
    await spamSafelist()
  } else if (props.spamhold) {
    await spamHold()
  } else if (props.spamignore) {
    // spamIgnore - not implemented in original
  } else if (props.release) {
    console.log('Release')
    await releaseIt()
  } else if (props.reviewhold) {
    await reviewHoldIt()
  } else if (props.reviewrelease) {
    await reviewReleaseIt()
  } else {
    // We want to show a modal.
    stdmsgId.value = null
    stdmsgAction.value = null

    if (props.leave) {
      stdmsgAction.value = 'Leave Member'
    } else if (props.stdmsgid) {
      // We have a standard message.  Fetch it into the store.
      await stdmsgStore.fetch(props.stdmsgid)
      stdmsgId.value = props.stdmsgid
    }

    showStdMsgModal.value = true
    stdmodal.value?.show()
    await nextTick()
    stdmodal.value?.fillin()
  }
  if (callback) callback()
  emit('pressed')
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
