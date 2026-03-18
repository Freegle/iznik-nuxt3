<template>
  <div v-if="message">
    <div v-if="editreview" class="d-inline">
      <ModMessageButton
        :messageid="message.id"
        variant="primary"
        icon="check"
        approveedits
        label="Accept Edit"
      />
      <ModMessageButton
        :messageid="message.id"
        variant="danger"
        icon="times"
        revertedits
        label="Reject Edit"
      />
      <ModMessageButton
        :messageid="message.id"
        variant="primary"
        icon="envelope"
        leave
        label="Blank Reply"
      />
    </div>
    <div v-else-if="pending" class="d-inline">
      <ModMessageButton
        v-if="!cantpost"
        :messageid="message.id"
        variant="primary"
        icon="check"
        approve
        label="Approve"
      />
      <ModMessageButton
        :messageid="message.id"
        variant="warning"
        icon="times"
        reject
        label="Reject"
      />
      <ModMessageButton
        :messageid="message.id"
        variant="danger"
        icon="trash-alt"
        delete
        label="Delete"
      />
      <ModMessageButton
        v-if="!message.heldby"
        :messageid="message.id"
        variant="warning"
        icon="pause"
        hold
        label="Hold"
      />
      <ModMessageButton
        :messageid="message.id"
        variant="danger"
        icon="ban"
        spam
        label="Delete as Spam"
      />
    </div>
    <div v-else-if="approved" class="d-inline">
      <ModMessageButton
        :messageid="message.id"
        variant="primary"
        icon="envelope"
        leave
        label="Blank Reply"
      />
      <ModMessageButton
        :messageid="message.id"
        variant="danger"
        icon="trash-alt"
        delete
        label="Delete"
      />
      <ModMessageButton
        :messageid="message.id"
        variant="danger"
        icon="ban"
        spam
        label="Delete as Spam"
      />
      <SpinButton
        v-if="message.type === 'Offer' && !message.outcomes?.length"
        variant="white"
        class="m-1"
        icon-name="check"
        label="Mark as TAKEN"
        confirm
        :flex="false"
        @handle="outcome($event, 'Taken')"
      />
      <SpinButton
        v-if="message.type === 'Wanted' && !message.outcomes?.length"
        variant="white"
        class="m-1"
        icon-name="check"
        label="Mark as RECEIVED"
        confirm
        :flex="false"
        @handle="outcome($event, 'Received')"
      />
      <SpinButton
        v-if="!message.outcomes?.length"
        variant="white"
        class="m-1"
        icon-name="trash-alt"
        label="Mark as Withdrawn"
        confirm
        :flex="false"
        @handle="outcome($event, 'Withdrawn')"
      />
    </div>
    <div v-if="!editreview" class="d-lg-inline">
      <ModMessageButton
        v-for="stdmsg in filtered"
        :key="stdmsg.id"
        :variant="variant(stdmsg)"
        :icon="icon(stdmsg)"
        :label="stdmsg.title"
        :stdmsgid="stdmsg.id"
        :messageid="message.id"
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
    </client-only>
  </div>
</template>
<script setup>
import { ref, computed, watch } from 'vue'
import { useMessageStore } from '~/stores/message'
import { useModConfigStore } from '~/stores/modconfig'
import { copyStdMsgs, icon, variant } from '~/composables/useStdMsgs'

const props = defineProps({
  messageid: {
    type: Number,
    required: true,
  },
  modconfigid: {
    type: Number,
    required: false,
    default: null,
  },
  editreview: {
    type: Boolean,
    required: false,
    default: false,
  },
  cantpost: {
    type: Boolean,
    required: false,
    default: false,
  },
})

const messageStore = useMessageStore()
const modConfigStore = useModConfigStore()
const modconfig = computed(
  () => modConfigStore.configsById?.[props.modconfigid]
)

const message = computed(() => messageStore.byId(props.messageid))

watch(
  () => props.messageid,
  async (newVal) => {
    if (newVal && !messageStore.byId(newVal)) {
      await messageStore.fetch(newVal)
    }
  },
  { immediate: true }
)

const showRare = ref(false)
const allowAutoSend = ref(true)

function hasCollection(coll) {
  let ret = false

  if (message.value?.groups) {
    message.value.groups.forEach((group) => {
      if (group.collection === coll) {
        ret = true
      }
    })
  }

  return ret
}

const pending = computed(() => {
  return hasCollection('Pending')
})

const approved = computed(() => {
  return hasCollection('Approved')
})

const validActions = computed(() => {
  // The standard messages we show depend on the valid ones for this type of message.
  if (pending.value) {
    const ret = ['Reject', 'Leave', 'Delete', 'Edit', 'Hold Message']
    if (!props.cantpost) {
      ret.push('Approve')
    }
    return ret
  } else if (approved.value) {
    return ['Leave Approved Message', 'Delete Approved Message', 'Edit']
  }

  return []
})

const stdmsgs = computed(() => {
  if (modconfig.value) {
    return copyStdMsgs(modconfig.value)
  } else {
    return []
  }
})

const filterByAction = computed(() => {
  if (modconfig.value) {
    return stdmsgs.value.filter((stdmsg) => {
      return validActions.value.includes(stdmsg.action)
    })
  }

  return []
})

const filtered = computed(() => {
  if (modconfig.value) {
    return filterByAction.value.filter((stdmsg) => {
      return showRare.value || !parseInt(stdmsg.rarelyused)
    })
  }

  return []
})

const rareToShow = computed(() => {
  return filterByAction.value.length - filtered.value.length
})

function outcome(callback, type) {
  messageStore.updateMT({
    action: 'Outcome',
    id: props.messageid,
    outcome: type,
  })
  if (callback) callback()
}
</script>
