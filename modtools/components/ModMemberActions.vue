<template>
  <div>
    <b-button v-if="groupid && !banned" variant="white" @click="remove">
      <v-icon icon="times" /> Remove
    </b-button>
    <b-button v-if="groupid && !banned" variant="white" @click="ban">
      <v-icon icon="trash-alt" /> Ban
    </b-button>
    <b-button v-if="!spam" variant="white" @click="spamReport">
      <v-icon icon="ban" /> Report Spammer
    </b-button>
    <b-button v-if="supportOrAdmin" variant="white" @click="spamSafelist">
      <v-icon icon="check" /> Safelist
    </b-button>
    <b-button v-if="groupid" variant="white" @click="addAComment">
      <v-icon icon="tag" /> Add note
    </b-button>
    <ConfirmModal
      v-if="removeConfirm && groupname"
      ref="removeConfirmRef"
      :title="'Remove ' + displayname + ' from ' + groupname + '?'"
      @confirm="removeConfirmed"
    />
    <ConfirmModal
      v-if="removeConfirm && !groupname"
      ref="removeConfirmRef"
      title="Please select a group first."
    />
    <ModBanMemberConfirmModal
      v-if="banConfirm"
      ref="banConfirmRef"
      :userid="userid"
      :groupid="groupid"
      @confirm="banConfirmed"
    />
    <ModCommentAddModal
      v-if="showAddCommentModal"
      :user="user"
      :groupid="groupid"
      :groupname="groupname"
      @added="commentadded"
      @hidden="showAddCommentModal = false"
    />
    <ModSpammerReport
      v-if="showSpamModal"
      ref="spamConfirmRef"
      :user="reportUser"
      :safelist="safelist"
    />
  </div>
</template>
<script setup>
import { ref, computed } from 'vue'
import { useGroupStore } from '~/stores/group'
import { useUserStore } from '~/stores/user'
import { useMemberStore } from '~/stores/member'
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
  banned: {
    type: Boolean,
    required: false,
    default: false,
  },
  spam: {
    type: Object,
    required: false,
    default: null,
  },
})

const emit = defineEmits(['commentadded'])

const { $api } = useNuxtApp()
const groupStore = useGroupStore()
const memberStore = useMemberStore()
const userStore = useUserStore()
const { me, supportOrAdmin } = useMe()

const removeConfirmRef = ref(null)
const banConfirmRef = ref(null)
const spamConfirmRef = ref(null)

const removeConfirm = ref(false)
const banConfirm = ref(false)
const showAddCommentModal = ref(false)
const user = ref(null)
const showSpamModal = ref(false)
const safelist = ref(false)

const displayname = computed(() => {
  return user.value ? user.value.displayname : null
})

const group = computed(() => groupStore.get(props.groupid))

const groupname = computed(() => {
  return group.value ? group.value.nameshort : null
})

const reportUser = computed(() => {
  return {
    // Due to inconsistencies about userid vs id in objects.
    userid: user.value?.id,
    id: user.value?.id,
    displayname: user.value?.displayname,
  }
})

async function fetchUser() {
  await userStore.fetch(props.userid, true)
  user.value = userStore.byId(props.userid)
}

async function remove() {
  if (!user.value) {
    await fetchUser()
  }

  removeConfirm.value = true
  removeConfirmRef.value?.show()
}

function removeConfirmed() {
  memberStore.remove(props.userid, props.groupid)
}

async function ban() {
  if (!user.value) {
    await fetchUser()
  }

  if (!group.value) {
    await groupStore.fetch(props.groupid)
  }

  banConfirm.value = true
  banConfirmRef.value?.show()
}

async function banConfirmed(reason) {
  memberStore.ban(props.userid, props.groupid)
  await $api.comment.add({
    userid: props.userid,
    groupid: props.groupid,
    user1:
      'Banned on ' +
      group.value.nameshort +
      ' by ' +
      me.value.displayname +
      ' reason: ' +
      reason,
    flag: true,
  })
}

async function addAComment() {
  if (!user.value) {
    await fetchUser()
  }

  showAddCommentModal.value = true
}

async function commentadded() {
  await userStore.fetchMT({
    id: props.userid,
    emailhistory: true,
  })

  emit('commentadded')
}

async function spamReport() {
  if (!user.value) {
    await fetchUser()
  }

  safelist.value = false
  showSpamModal.value = true
  spamConfirmRef.value?.show()
}

async function spamSafelist() {
  if (!user.value) {
    await fetchUser()
  }

  safelist.value = true
  showSpamModal.value = true
  spamConfirmRef.value?.show()
}
</script>
