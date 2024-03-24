<template>
  <div>
    <div class="d-flex flex-wrap">
      <div v-if="promise.id === myid">
        <!-- This can happen with TN.  It means it's promised, but we don't know who to.-->
        <b-badge variant="success">
          <v-icon icon="handshake" class="fa-fw" /> Promised
        </b-badge>
      </div>
      <div v-else>
        <!-- eslint-disable-next-line-->
        <b-badge
          variant="success"
          class="ml-0"
        >
          <v-icon icon="handshake" />
          <span class="ml-2">Promised</span>
        </b-badge>
        to
        <strong>{{ promise.name }}</strong>
      </div>
      <template v-if="promise.trystdate">
        &nbsp;handover <span class="d-none d-md-inline">&nbsp;arranged for</span
        ><strong>&nbsp;{{ promise.trystdate }}</strong>
      </template>
    </div>
    <div v-if="promise.trystdate" class="d-flex flex-wrap small">
      <AddToCalendar
        :ics="promise.tryst.ics"
        variant="link"
        btn-class="ps-0"
        size="sm"
      />
      <b-button variant="link" size="sm" @click="changeTime">
        <v-icon icon="pen" />
        Change time
      </b-button>
      <b-button variant="link" size="sm">
        <div class="d-flex" @click="unpromise">
          <span class="stacked">
            <v-icon icon="handshake" class="mt-1" />
            <v-icon icon="slash" class="unpromise__slash" /> </span
          >Unpromise
        </div>
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
<style scoped lang="scss">
.stacked {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;

  svg {
    grid-row: 1 / 2;
    grid-column: 1 / 2;
  }

  svg:nth-child(2) {
    z-index: 10000;
    color: white;
    padding-top: 7px;
    padding-right: 7px;
  }
}
</style>
