<template>
  <div>
    <div class="d-flex flex-wrap">
      <div v-if="promise.id === myid">
        <!-- This can happen with TN.  It means it's promised, but we don't know who to.-->
        <v-icon icon="handshake" class="fa-fw mt-1" />&nbsp;Promised
      </div>
      <div v-else>
        <!-- eslint-disable-next-line-->
        <v-icon icon="handshake" class="fa-fw mt-1" />&nbsp;Promised to <strong>{{ promise.name }}</strong><span v-if="promise.trystdate">,</span>
        <b-button
          variant="link"
          class="ml-2 text--smallest text-black"
          @click="unpromise"
          >(Unpromise)</b-button
        >
      </div>
      <div v-if="promise.trystdate" class="d-flex">
        handover <span class="d-none d-md-inline">arranged for</span
        ><strong>&nbsp;{{ promise.trystdate }}</strong>
      </div>
    </div>
    <div v-if="promise.tryst" class="d-flex flex-wrap small">
      <AddToCalendar :ics="promise.tryst.ics" variant="link" />
      <b-button variant="link" @click="changeTime">
        <v-icon icon="pen" />
        Change time
      </b-button>
      <PromiseModal
        ref="promiseModalChange"
        :messages="[message]"
        :selected-message="message.id"
        :users="[replyusers]"
        :selected-user="promisee"
      />
    </div>
    <RenegeModal
      v-if="promise.id !== myid"
      ref="renegeModal"
      :messages="[message.id]"
      :selected-message="message.id"
      :users="[promiseeUser]"
      :selected-user="promisee"
    />
  </div>
</template>
<script>
import { useMessageStore } from '../stores/message'
import { useUserStore } from '../stores/user'
import RenegeModal from './RenegeModal'
import PromiseModal from '~/components/PromiseModal'
import AddToCalendar from '~/components/AddToCalendar'

export default {
  components: { PromiseModal, RenegeModal, AddToCalendar },
  props: {
    promise: {
      type: Object,
      required: true,
    },
    id: {
      type: Number,
      required: true,
    },
    replyusers: {
      type: Array,
      required: true,
    },
  },
  setup() {
    const messageStore = useMessageStore()
    const userStore = useUserStore()

    return {
      messageStore,
      userStore,
    }
  },
  computed: {
    message() {
      return this.messageStore?.byId(this.id)
    },
    promisee() {
      return this.promise?.id
    },
    promiseeUser() {
      return this.userStore.byId(this.promisee)
    },
  },
  methods: {
    changeTime(e) {
      console.log('Change', this.$refs)
      e.preventDefault()
      e.stopPropagation()
      this.$refs.promiseModalChange.show()
    },
    async unpromise(e) {
      e.preventDefault()
      e.stopPropagation()
      console.log('Renege', this.message, this.promise)
      await this.waitForRef('renegeModal')
      console.log('Got modal')
      this.$refs.renegeModal.show()
      console.log('Shown')
    },
  },
}
</script>
