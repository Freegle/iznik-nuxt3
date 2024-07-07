<template>
  <b-modal
    ref="modal"
    scrollable
    title="Remove a promise"
    size="lg"
    @shown="onShow"
  >
    <template #default>
      <notice-message class="mb-3">
        Please only do this if there's a good reason, so as not to disappoint
        people.
      </notice-message>
      <p>You're no longer promising:</p>
      <b-form-select
        v-model="message"
        :options="messageOptions"
        class="mb-2 font-weight-bold"
        disabled=""
      />
      <p>...to:</p>
      <b-form-select
        v-model="user"
        :options="userOptions"
        class="mb-2 font-weight-bold"
        disabled
      />
      <div v-if="tryst" class="d-flex flex-wrap">
        <b-form-checkbox v-model="removeTryst" size="lg">
          Cancel handover arranged for
          <strong
            ><DateFormatted :value="tryst.arrangedfor" format="weekdaytime"
          /></strong>
        </b-form-checkbox>
      </div>
      <hr />
      <p>
        Please also give this freegler a thumbs up or down, depending on the
        experience you had with them.
      </p>
      <UserRatings :id="selectedUser" class="mt-2" size="lg" />
    </template>
    <template #footer>
      <b-button variant="white" @click="hide"> Cancel </b-button>
      <b-button variant="warning" @click="renege"> Unpromise </b-button>
    </template>
  </b-modal>
</template>
<script>
import { useTrystStore } from '../stores/tryst'
import { useMessageStore } from '../stores/message'
import { useOurModal } from '~/composables/useOurModal'
import UserRatings from '~/components/UserRatings'
import DateFormatted from '~/components/DateFormatted'

const NoticeMessage = defineAsyncComponent(() =>
  import('~/components/NoticeMessage')
)

export default {
  components: {
    NoticeMessage,
    UserRatings,
    DateFormatted,
  },
  props: {
    messages: {
      validator: (prop) => typeof prop === 'object' || prop === null,
      required: true,
    },
    selectedMessage: {
      type: Number,
      required: false,
      default: 0,
    },
    users: {
      validator: (prop) => typeof prop === 'object' || prop === null,
      required: true,
    },
    selectedUser: {
      type: Number,
      required: false,
      default: 0,
    },
  },
  async setup() {
    const trystStore = useTrystStore()
    const messageStore = useMessageStore()

    const { modal, hide } = useOurModal()

    await trystStore.fetch()

    return {
      trystStore,
      messageStore,
      modal,
      hide,
    }
  },
  data() {
    return {
      removeTryst: true,
      message: null,
      user: null,
    }
  },
  computed: {
    messageOptions() {
      const options = []

      if (this.messages) {
        if (this.messages.length > 1) {
          options.push({
            value: 0,
            text: '-- Please choose a message --',
            selected: this.selectedMessage === 0,
          })
        }

        for (const id of this.messages) {
          const message = this.messageStore?.byId(id)

          if (message) {
            options.push({
              value: message.id,
              text: message.subject,
              selected: this.selectedMessage === message.id,
            })
          }
        }
      }

      return options
    },
    userOptions() {
      const options = []

      if (this.users) {
        if (this.users.length > 1) {
          options.push({
            value: 0,
            text: '-- Please choose a user --',
            selected: this.selectedUser === 0,
          })
        }

        for (const user of this.users) {
          options.push({
            value: user.id,
            text: user.displayname,
            selected: this.selectedUser === user.id,
          })
        }
      }

      return options
    },
    userobj() {
      let ret = null

      for (const user of this.users) {
        if (user.id === this.selectedUser) {
          ret = user
        }
      }

      return ret
    },
    tryst() {
      return this.selectedUser
        ? this.trystStore?.getByUser(this.selectedUser)
        : null
    },
  },
  methods: {
    onShow() {
      this.message = this.selectedMessage
      this.user = this.selectedUser
    },
    async renege() {
      await this.messageStore.renege(this.message, this.user)

      if (this.tryst && this.removeTryst) {
        await this.trystStore.delete(this.tryst.id)
      }

      this.hide()
    },
  },
}
</script>
