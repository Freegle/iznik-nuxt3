<template>
  <div>
    <div v-if="editreview" class="d-inline">
      <ModMessageButton
        :message="message"
        variant="primary"
        icon="check"
        approveedits
        label="Accept Edit"
      />
      <ModMessageButton
        :message="message"
        variant="danger"
        icon="times"
        revertedits
        label="Reject Edit"
      />
      <ModMessageButton
        :message="message"
        variant="primary"
        icon="envelope"
        leave
        label="Blank Reply"
      />
    </div>
    <div v-else-if="pending" class="d-inline">
      <ModMessageButton
        v-if="!cantpost"
        :message="message"
        variant="primary"
        icon="check"
        approve
        label="Approve"
      />
      <ModMessageButton
        :message="message"
        variant="warning"
        icon="times"
        reject
        label="Reject"
      />
      <ModMessageButton
        :message="message"
        variant="danger"
        icon="trash-alt"
        delete
        label="Delete"
      />
      <ModMessageButton
        v-if="!message.heldby"
        :message="message"
        variant="warning"
        icon="pause"
        hold
        label="Hold"
      />
      <ModMessageButton
        :message="message"
        variant="danger"
        icon="ban"
        spam
        label="Delete as Spam"
      />
    </div>
    <div v-else-if="approved" class="d-inline">
      <ModMessageButton
        :message="message"
        variant="primary"
        icon="envelope"
        leave
        label="Blank Reply"
      />
      <ModMessageButton
        :message="message"
        variant="danger"
        icon="trash-alt"
        delete
        label="Delete"
      />
      <ModMessageButton
        :message="message"
        variant="danger"
        icon="ban"
        spam
        label="Delete as Spam"
      />
      <SpinButton
        v-if="message.type === 'Offer' && !message.outcomes.length"
        variant="white"
        class="m-1"
        icon-name="check"
        label="Mark as TAKEN"
        confirm
        :flex="false"
        @handle="outcome($event, 'Taken')"
      />
      <SpinButton
        v-if="message.type === 'Wanted' && !message.outcomes.length"
        variant="white"
        class="m-1"
        icon-name="check"
        label="Mark as RECEIVED"
        confirm
        :flex="false"
        @handle="outcome($event, 'Received')"
      />
      <SpinButton
        v-if="!message.outcomes.length"
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
        :message="message"
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
<script>
import { useMessageStore } from '~/stores/message'
import { copyStdMsgs } from '~/composables/useStdMsgs'
import { useStdmsgStore } from '~/stores/stdmsg'

export default {
  props: {
    message: {
      type: Object,
      required: true,
    },
    modconfig: {
      type: Object,
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
  },
  setup() {
    const messageStore = useMessageStore()
    const stdmsgStore = useStdmsgStore()
    return { messageStore, stdmsgStore }
  },
  data: function () {
    return {
      showRare: false,
      allowAutoSend: true,
    }
  },
  computed: {
    pending() {
      return this.hasCollection('Pending')
    },
    approved() {
      return this.hasCollection('Approved')
    },
    validActions() {
      // The standard messages we show depend on the valid ones for this type of message.
      if (this.pending) {
        const ret = ['Reject', 'Leave', 'Delete', 'Edit', 'Hold Message']
        if (!this.cantpost) {
          ret.push('Approve')
        }
        return ret
      } else if (this.approved) {
        return ['Leave Approved Message', 'Delete Approved Message', 'Edit']
      }

      return []
    },
    rareToShow() {
      return this.filterByAction.length - this.filtered.length
    },
    stdmsgs() {
      if (this.modconfig) {
        return copyStdMsgs(this.modconfig)
      } else {
        return []
      }
    },
    filterByAction() {
      if (this.modconfig) {
        return this.stdmsgs.filter((stdmsg) => {
          return this.validActions.includes(stdmsg.action)
        })
      }

      return []
    },
    filtered() {
      if (this.modconfig) {
        return this.filterByAction.filter((stdmsg) => {
          return this.showRare || !parseInt(stdmsg.rarelyused)
        })
      }

      return []
    },
  },
  methods: {
    hasCollection(coll) {
      let ret = false

      if (this.message.groups) {
        this.message.groups.forEach((group) => {
          if (group.collection === coll) {
            ret = true
          }
        })
      }

      return ret
    },
    outcome(callback, type) {
      const self = this
      this.messageStore.updateMT({
        action: 'Outcome',
        id: self.message.id,
        outcome: type,
      })
      if (callback) callback()
    },
  },
}
</script>
