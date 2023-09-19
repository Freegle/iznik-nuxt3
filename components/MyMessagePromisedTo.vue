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
        v-if="showPromiseModal"
        :messages="[message]"
        :selected-message="message.id"
        :users="[replyusers]"
        :selected-user="promisee"
        @hidden="showPromiseModal = false"
      />
    </div>
    <RenegeModal
      v-if="promise.id !== myid && showRenegeModal"
      :messages="[message.id]"
      :selected-message="message.id"
      :users="[promiseeUser]"
      :selected-user="promisee"
      @hidden="showRenegeModal = false"
    />
  </div>
</template>
<script>
import { useMessageStore } from '../stores/message'
import { useUserStore } from '../stores/user'
import AddToCalendar from '~/components/AddToCalendar'
const PromiseModal = defineAsyncComponent(() =>
  import('~/components/PromiseModal')
)
const RenegeModal = defineAsyncComponent(() => import('./RenegeModal'))

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
  data() {
    return {
      showPromiseModal: false,
      showRenegeModal: false,
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
      e.preventDefault()
      e.stopPropagation()
      this.showPromiseModal = true
    },
    unpromise(e) {
      e.preventDefault()
      e.stopPropagation()
      console.log('Renege', this.message, this.promise)
      this.showRenegeModal = true
      console.log('Shown')
    },
  },
}
</script>
