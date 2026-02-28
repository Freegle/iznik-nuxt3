<template>
  <div class="d-flex flex-wrap">
    <div v-if="spam" class="d-inline d-flex flex-wrap">
      <ModMemberActions
        v-if="actions && member.groupid"
        :userid="member.userid"
        :groupid="member.groupid"
        :banned="Boolean(member.bandate)"
        class="mr-1"
        :spam="spam"
      />
      <ModMemberButton
        v-if="spamignore"
        :member="member"
        variant="primary"
        icon="check"
        spamignore
        label="Ignore"
      />
      <div v-if="member.spammer.collection === 'PendingAdd'" class="d-inline">
        <ModMemberButton
          v-if="hasPermissionSpamAdmin && !member.heldby"
          :member="member"
          variant="primary"
          icon="check"
          spamconfirm
          label="Confirm add to spammer list"
        />
        <b-button variant="white" @click="addAComment">
          <v-icon icon="tag" /> Add note
        </b-button>
        <ModMemberButton
          v-if="hasPermissionSpamAdmin && !member.heldby"
          :member="member"
          variant="danger"
          icon="trash-alt"
          spamremove
          label="Reject add to spammer list"
        />
        <ModMemberButton
          v-if="hasPermissionSpamAdmin && !member.heldby"
          :member="member"
          variant="primary"
          icon="check"
          spamsafelist
          label="Safelist"
        />
        <ModMemberButton
          v-else-if="!member.heldby"
          :member="member"
          variant="primary"
          icon="times"
          spamrequestremove
          label="Request removal from spammer list"
        />
        <ModMemberButton
          v-if="hasPermissionSpamAdmin && !member.heldby"
          :member="member"
          variant="warning"
          icon="pause"
          spamhold
          label="Hold"
        />
      </div>
      <div
        v-else-if="member.spammer.collection === 'Approved'"
        class="d-flex flex-wrap"
      >
        <ModMemberButton
          v-if="hasPermissionSpamAdmin"
          :member="member"
          variant="danger"
          icon="trash-alt"
          spamremove
          label="Remove from spammer list"
        />
        <ModMemberButton
          v-else
          :member="member"
          variant="primary"
          icon="times"
          spamrequestremove
          label="Request removal from spammer list"
        />
      </div>
    </div>
    <div v-else-if="approved" class="d-flex flex-wrap">
      <ModMemberActions
        v-if="actions"
        :userid="member.userid"
        :groupid="member.groupid"
        :banned="Boolean(member.bandate)"
        class="mr-1"
      />
      <ModMemberButton
        v-if="spamignore && member.suspectreason"
        :member="member"
        variant="primary"
        icon="check"
        spamignore
        label="Ignore"
      />
      <ModMemberButton
        class="ml-1 mr-1"
        :member="member"
        variant="white"
        icon="envelope"
        leave
        label="Mail"
      />
    </div>
    <div class="d-flex flex-wrap">
      <ModMemberButton
        v-for="stdmsg in filtered"
        :key="stdmsg.id"
        :variant="variant(stdmsg)"
        :icon="icon(stdmsg)"
        :label="stdmsg.title"
        :stdmsgid="stdmsg.id"
        :member="member"
        class="mr-1"
        :autosend="Boolean(stdmsg.autosend && allowAutoSend)"
      />
      <b-button
        v-if="rareToShow && !showRare"
        variant="white"
        class="mb-1"
        @click="showRare = true"
      >
        <v-icon icon="caret-down" /> +{{ rareToShow }}...
      </b-button>
    </div>
    <client-only>
      <div class="mt-1 mb-1 d-flex flex-wrap">
        <OurToggle
          v-model="allowAutoSend"
          :height="30"
          :width="150"
          :font-size="14"
          :sync="true"
          class="mr-1"
          :labels="{ checked: 'Allow autosend', unchecked: 'Edit first' }"
          variant="modgreen"
        />
        <div class="small text-muted mt-1">
          Standard messages can be configured to send in a single click. This
          toggle temporarily disables that so you can edit first.
        </div>
      </div>
      <ModCommentAddModal
        v-if="showAddCommentModal"
        :user="member"
        @hidden="showAddCommentModal = false"
      />
    </client-only>
  </div>
</template>
<script setup>
import { ref, computed, defineAsyncComponent } from 'vue'
import ModMemberButton from './ModMemberButton'
import ModMemberActions from './ModMemberActions'
import ModCommentAddModal from '~/components/ModCommentAddModal'
import { useModMe } from '~/composables/useModMe'

const OurToggle = defineAsyncComponent(() => import('~/components/OurToggle'))

const props = defineProps({
  member: {
    type: Object,
    required: true,
  },
  modconfig: {
    type: Object,
    required: false,
    default: null,
  },
  spamignore: {
    type: Boolean,
    required: false,
    default: false,
  },
  actions: {
    type: Boolean,
    required: false,
    default: false,
  },
})

const { hasPermissionSpamAdmin } = useModMe()

const showRare = ref(false)
const allowAutoSend = ref(true)
const showAddCommentModal = ref(false)

function hasCollection(coll) {
  // V2: collection returned directly on the membership object.
  if (props.member.collection === coll) {
    return true
  }

  // V1 fallback: check memberof array.
  if (props.member.memberof) {
    for (const group of props.member.memberof) {
      if (group.id === props.member.groupid && group.collection === coll) {
        return true
      }
    }
  }

  return false
}

const approved = computed(() => hasCollection('Approved'))

const spam = computed(() => props.member.spammer)

const validActions = computed(() => {
  // The standard messages we show depend on the valid ones for this type of member.
  if (approved.value) {
    return ['Leave Approved Member', 'Delete Approved Member']
  }

  return []
})

const filterByAction = computed(() => {
  if (props.modconfig?.stdmsgs) {
    return props.modconfig.stdmsgs.filter((stdmsg) => {
      return validActions.value.includes(stdmsg.action)
    })
  }

  return []
})

const filtered = computed(() => {
  if (props.modconfig?.stdmsgs) {
    return filterByAction.value.filter((stdmsg) => {
      return showRare.value || !parseInt(stdmsg.rarelyused)
    })
  }

  return []
})

const rareToShow = computed(() => {
  return filterByAction.value.length - filtered.value.length
})

function icon(stdmsg) {
  switch (stdmsg.action) {
    case 'Approve Member':
      return 'check'
    case 'Reject Member':
      return 'times'
    case 'Leave Member':
    case 'Leave Approved Member':
      return 'envelope'
    case 'Delete Approved Member':
      return 'trash-alt'
    case 'Edit':
      return 'pen'
    default:
      return 'check'
  }
}

function variant(stdmsg) {
  switch (stdmsg.action) {
    case 'Approve Member':
      return 'primary'
    case 'Reject Member':
      return 'warning'
    case 'Leave Member':
    case 'Leave Approved Member':
      return 'primary'
    case 'Delete Approved Member':
      return 'danger'
    case 'Edit':
      return 'primary'
    default:
      return 'white'
  }
}

function addAComment() {
  showAddCommentModal.value = true
}
</script>
