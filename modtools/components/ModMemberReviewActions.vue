<template>
  <b-card v-if="membership" no-body>
    <b-card-body class="p-2">
      <div>
        <strong>{{
          groupName.length > 32 ? groupName.substring(0, 32) + '...' : groupName
        }}</strong>
        <span
          :class="
            'small ' +
            (daysago(membership.added) < 31
              ? 'text-danger fw-bold'
              : 'text-muted')
          "
        >
          joined {{ timeago(membership.added) }}</span
        >
        <span v-if="membership.reviewreason" class="text-danger ms-1 me-1">
          <span v-if="membership.reviewrequestedat" class="text-dark small"
            >flagged {{ timeago(membership.reviewrequestedat) }}</span
          >
          {{ membership.reviewreason }}
        </span>
      </div>
      <div v-if="amAModOn(membership.groupid) && needsReview && heldById">
        <NoticeMessage variant="warning" class="mt-2 mb-2">
          <p v-if="myid === heldById">
            You held this member. Other people will see a warning to check with
            you before releasing them.
          </p>
          <p v-else>
            Held by
            <strong>{{ heldByUser?.displayname }}</strong
            >. Please check before releasing them.
          </p>
        </NoticeMessage>
      </div>
      <div
        v-if="amAModOn(membership.groupid) && needsReview"
        class="d-flex mt-2 flex-wrap"
      >
        <SpinButton
          v-if="!heldById || heldById === myid"
          icon-name="check"
          spinclass="success"
          variant="primary"
          label="Ignore"
          class="me-2 mb-1"
          @handle="ignore"
        />
        <SpinButton
          v-if="!heldById || heldById === myid"
          icon-name="trash-alt"
          spinclass="success"
          variant="warning"
          label="Remove"
          class="me-2 mb-1"
          @handle="remove"
        />
        <ModMemberButton
          v-if="!membership.heldby"
          :userid="userid"
          :membershipid="membership.membershipid || membership.id"
          :groupid="membership.groupid"
          variant="warning"
          icon="pause"
          reviewhold
          :reviewgroupid="membership.groupid"
          label="Hold"
          class="me-2"
        />
        <ModMemberButton
          v-else
          :userid="userid"
          :membershipid="membership.membershipid || membership.id"
          :groupid="membership.groupid"
          variant="warning"
          icon="play"
          reviewrelease
          :reviewgroupid="membership.groupid"
          label="Release"
          class="me-2"
        />
        <b-button
          :to="'/members/approved/' + membership.groupid + '/' + userid"
          variant="secondary"
          class="mb-1"
        >
          Go to membership
        </b-button>
      </div>
    </b-card-body>
    <ConfirmModal
      v-if="showConfirmModal"
      ref="removeConfirm"
      :title="
        'Remove ' +
        (user ? user.displayname : '#' + userid) +
        ' from ' +
        groupName +
        '?'
      "
      @confirm="removeConfirmed"
      @hidden="showConfirmModal = false"
    />
  </b-card>
</template>
<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import dayjs from 'dayjs'
import { useMemberStore } from '~/stores/member'
import { useUserStore } from '~/stores/user'
import { useGroupStore } from '~/stores/group'
import { useMe } from '~/composables/useMe'
import { useModMe } from '~/composables/useModMe'

const props = defineProps({
  userid: {
    type: Number,
    required: true,
  },
  membershipid: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(['forcerefresh'])

const memberStore = useMemberStore()
const userStore = useUserStore()
const groupStore = useGroupStore()
const { myid } = useMe()
const { amAModOn } = useModMe()

const removeConfirm = ref(null)

const membership = computed(() => {
  // First check the member store (has review data for flagged memberships).
  const members = Object.values(memberStore.list)
  const member = members.find(
    (m) => parseInt(m.userid) === parseInt(props.userid)
  )
  if (member && member.memberships) {
    const found = member.memberships.find(
      (ms) => parseInt(ms.membershipid) === parseInt(props.membershipid)
    )
    if (found) return found
  }

  // Fall back to the user store for non-flagged memberships (cross-group display).
  const user = userStore.byId(props.userid)
  if (user && user.memberships) {
    const um = user.memberships.find(
      (ms) => parseInt(ms.id) === parseInt(props.membershipid)
    )
    if (um) {
      return {
        id: um.groupid,
        membershipid: um.id,
        added: um.added,
        role: um.role,
      }
    }
  }

  return null
})

const user = computed(() => userStore.byId(props.userid))

const groupName = computed(() => {
  if (!membership.value) return ''
  const group = groupStore.get(membership.value.groupid)
  return group ? group.namedisplay : '#' + membership.value.groupid
})

watch(
  () => props.userid,
  (uid) => {
    if (uid && !userStore.byId(uid)) userStore.fetch(uid)
  },
  { immediate: true }
)

// V2 API returns heldby as a numeric user ID, not an object.
const heldById = computed(() => {
  if (!membership.value) return null
  const hb = membership.value.heldby
  if (!hb) return null
  if (typeof hb === 'object') return hb.id
  return hb
})

const heldByUser = computed(() => {
  if (!membership.value) return null
  const hb = membership.value.heldby
  if (!hb) return null
  if (typeof hb === 'object') return hb
  return userStore.byId(hb) || { id: hb, displayname: '#' + hb }
})

onMounted(() => {
  if (!membership.value) return
  const hb = membership.value.heldby
  if (hb && typeof hb !== 'object' && !userStore.byId(hb)) {
    userStore.fetch(hb)
  }
})

const reviewed = ref(false)
const showConfirmModal = ref(false)

const needsReview = computed(() => {
  if (reviewed.value) {
    return false
  }

  if (!membership.value) return false

  return (
    !membership.value.reviewedat ||
    new Date(membership.value.reviewrequestedat).getTime() >=
      new Date(membership.value.reviewedat).getTime()
  )
})

function remove(callback) {
  showConfirmModal.value = true
  removeConfirm.value?.show()

  setTimeout(() => {
    reviewed.value = true
    callback()
  }, 2000)
}

async function removeConfirmed() {
  await memberStore.remove(props.userid, membership.value.groupid)

  setTimeout(() => {
    reviewed.value = true
    forcerefresh(true)
  }, 2000)
}

async function ignore(callback) {
  await memberStore.spamignore({
    userid: props.userid,
    groupid: membership.value.groupid,
  })

  setTimeout(() => {
    reviewed.value = true
    callback()
    forcerefresh(true)
  }, 2000)
}

function daysago(d) {
  return dayjs().diff(dayjs(d), 'day')
}

function forcerefresh() {
  emit('forcerefresh')
}
</script>
