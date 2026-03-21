<template>
  <div v-if="member" class="d-flex flex-wrap">
    <div v-if="spam" class="d-inline d-flex flex-wrap">
      <ModMemberActions
        v-if="actions && member.groupid"
        :userid="member.userid"
        :groupid="member.groupid"
        :banned="Boolean(member.bandate)"
        class="me-1"
        :spammerid="spam?.id"
      />
      <ModMemberButton
        v-if="spamignore"
        :userid="member.userid"
        :groupid="member.groupid"
        :spammerid="member.spammer?.id"
        variant="primary"
        icon="check"
        spamignore
        label="Ignore"
      />
      <div v-if="member.spammer.collection === 'PendingAdd'" class="d-inline">
        <ModMemberButton
          v-if="hasPermissionSpamAdmin && !member.heldby"
          :userid="member.userid"
          :groupid="member.groupid"
          :spammerid="member.spammer?.id"
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
          :userid="member.userid"
          :groupid="member.groupid"
          :spammerid="member.spammer?.id"
          variant="danger"
          icon="trash-alt"
          spamremove
          label="Reject add to spammer list"
        />
        <ModMemberButton
          v-if="hasPermissionSpamAdmin && !member.heldby"
          :userid="member.userid"
          :groupid="member.groupid"
          :spammerid="member.spammer?.id"
          variant="primary"
          icon="check"
          spamsafelist
          label="Safelist"
        />
        <ModMemberButton
          v-else-if="!member.heldby"
          :userid="member.userid"
          :groupid="member.groupid"
          :spammerid="member.spammer?.id"
          variant="primary"
          icon="times"
          spamrequestremove
          label="Request removal from spammer list"
        />
        <ModMemberButton
          v-if="hasPermissionSpamAdmin && !member.heldby"
          :userid="member.userid"
          :groupid="member.groupid"
          :spammerid="member.spammer?.id"
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
          :userid="member.userid"
          :groupid="member.groupid"
          :spammerid="member.spammer?.id"
          variant="danger"
          icon="trash-alt"
          spamremove
          label="Remove from spammer list"
        />
        <ModMemberButton
          v-else
          :userid="member.userid"
          :groupid="member.groupid"
          :spammerid="member.spammer?.id"
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
        class="me-1"
      />
      <ModMemberButton
        v-if="spamignore && member.suspectreason"
        :userid="member.userid"
        :groupid="member.groupid"
        variant="primary"
        icon="check"
        spamignore
        label="Ignore"
      />
      <ModMemberButton
        class="ms-1 me-1"
        :userid="member.userid"
        :groupid="member.groupid"
        :membershipid="member.id"
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
        :userid="member.userid"
        :groupid="member.groupid"
        :membershipid="member.id"
        class="me-1"
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
          class="me-1"
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
        :userid="member.userid"
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
import { useMemberStore } from '~/stores/member'
import { useModConfigStore } from '~/stores/modconfig'

const OurToggle = defineAsyncComponent(() => import('~/components/OurToggle'))

const props = defineProps({
  membershipid: {
    type: Number,
    required: true,
  },
  modconfigid: {
    type: Number,
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

const memberStore = useMemberStore()
const modConfigStore = useModConfigStore()
const modconfig = computed(
  () => modConfigStore.configsById?.[props.modconfigid]
)
const member = computed(() => memberStore.get(props.membershipid))

const showRare = ref(false)
const allowAutoSend = ref(true)
const showAddCommentModal = ref(false)

function hasCollection(coll) {
  // V2: collection returned directly on the membership object.
  if (member.value.collection === coll) {
    return true
  }

  // V1 fallback: check memberships array.
  if (member.value.memberships) {
    for (const group of member.value.memberships) {
      if (group.id === member.value.groupid && group.collection === coll) {
        return true
      }
    }
  }

  return false
}

const approved = computed(() => hasCollection('Approved'))

const spam = computed(() => member.value.spammer)

const validActions = computed(() => {
  // The standard messages we show depend on the valid ones for this type of member.
  if (approved.value) {
    return ['Leave Approved Member', 'Delete Approved Member']
  }

  return []
})

const filterByAction = computed(() => {
  if (modconfig.value?.stdmsgs) {
    return modconfig.value.stdmsgs.filter((stdmsg) => {
      return validActions.value.includes(stdmsg.action)
    })
  }

  return []
})

const filtered = computed(() => {
  if (modconfig.value?.stdmsgs) {
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
