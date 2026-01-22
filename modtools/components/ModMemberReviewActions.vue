<template>
  <b-card no-body>
    <b-card-body class="p-2">
      <div>
        <strong>{{
          membership.namedisplay.length > 32
            ? membership.namedisplay.substring(0, 32) + '...'
            : membership.namedisplay
        }}</strong>
        <span
          :class="
            'small ' +
            (daysago(membership.added) < 31
              ? 'text-danger font-weight-bold'
              : 'text-muted')
          "
        >
          joined {{ timeago(membership.added) }}</span
        >
        <span v-if="membership.reviewreason" class="text-danger ml-1 mr-1">
          <span v-if="membership.reviewrequestedat" class="text-dark small"
            >flagged {{ timeago(membership.reviewrequestedat) }}</span
          >
          {{ membership.reviewreason }}
        </span>
      </div>
      <div v-if="amAModOn(membership.id) && needsReview && membership.heldby">
        <NoticeMessage variant="warning" class="mt-2 mb-2">
          <p v-if="me.id === membership.heldby">
            You held this member. Other people will see a warning to check with
            you before releasing them.
          </p>
          <p v-else>
            Held by
            <v-icon icon="hashtag" class="text-muted" scale="0.5" /><strong>{{
              membership.heldby
            }}</strong
            >. Please check before releasing them.
          </p>
        </NoticeMessage>
      </div>
      <div
        v-if="amAModOn(membership.id) && needsReview"
        class="d-flex mt-2 flex-wrap"
      >
        <SpinButton
          v-if="!membership.heldby || membership.heldby.id === myid"
          icon-name="check"
          spinclass="success"
          variant="primary"
          label="Ignore"
          class="mr-2 mb-1"
          @handle="ignore"
        />
        <SpinButton
          v-if="!membership.heldby || membership.heldby.id === myid"
          icon-name="trash-alt"
          spinclass="success"
          variant="warning"
          label="Remove"
          class="mr-2 mb-1"
          @handle="remove"
        />
        <ModMemberButton
          v-if="!membership.heldby"
          :member="membership"
          variant="warning"
          icon="pause"
          reviewhold
          :reviewgroupid="groupid"
          label="Hold"
          class="mr-2"
        />
        <ModMemberButton
          v-else
          :member="membership"
          variant="warning"
          icon="play"
          reviewrelease
          :reviewgroupid="groupid"
          label="Release"
          class="mr-2"
        />
        <b-button
          :to="'/members/approved/' + membership.id + '/' + member.userid"
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
        'Remove ' + member.displayname + ' from ' + membership.namedisplay + '?'
      "
      @confirm="removeConfirmed"
      @hidden="showConfirmModal = false"
    />
  </b-card>
</template>
<script setup>
import { ref, computed } from 'vue'
import dayjs from 'dayjs'
import { useMemberStore } from '~/stores/member'
import { useMe } from '~/composables/useMe'
import { useModMe } from '~/composables/useModMe'

const props = defineProps({
  memberid: {
    type: Number,
    required: true,
  },
  member: {
    type: Object,
    required: true,
  },
  membership: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['forcerefresh'])

const memberStore = useMemberStore()
const { me, myid } = useMe()
const { amAModOn } = useModMe()

const removeConfirm = ref(null)

const reviewed = ref(false)
const showConfirmModal = ref(false)

const groupid = computed(() => {
  let ret = null

  props.member.memberof.forEach((h) => {
    if (h.id === props.membership.id) {
      ret = h.id
    }
  })

  return ret
})

const needsReview = computed(() => {
  if (reviewed.value) {
    return false
  }

  return (
    !props.membership.reviewedat ||
    new Date(props.membership.reviewrequestedat).getTime() >=
      new Date(props.membership.reviewedat).getTime()
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
  await memberStore.remove(props.member.userid, props.membership.id)

  setTimeout(() => {
    reviewed.value = true
    forcerefresh(true)
  }, 2000)
}

async function ignore(callback) {
  await memberStore.spamignore({
    userid: props.member.userid,
    groupid: props.membership.id,
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
