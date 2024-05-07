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
    <div class="d-flex flex-wrap small">
      <AddToCalendar
        v-if="promise.trystdate"
        :ics="promise.tryst.ics"
        variant="link"
        btn-class="ps-0"
        :size="btnSize"
      />
      <b-button variant="link" :size="btnSize" @click="changeTime">
        <v-icon icon="pen" />&nbsp; <span v-if="promise.trystdate">Change</span
        ><span v-else>Set time</span>
      </b-button>
      <b-button variant="link" :size="btnSize">
        <div class="d-flex align-items-center" @click="unpromise">
          <span class="stacked">
            <v-icon icon="handshake" class="mt-1" />
            <v-icon icon="slash" class="unpromise__slash" /> </span
          >Unpromise
        </div>
      </b-button>
    </div>
    <PromiseModal
      v-if="showPromiseModal"
      :messages="[message]"
      :selected-message="message.id"
      :users="[replyusers]"
      :selected-user="promisee"
      @hidden="showPromiseModal = false"
    />
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
import { useMiscStore } from '~/stores/misc'
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
    const miscStore = useMiscStore()
    const messageStore = useMessageStore()
    const userStore = useUserStore()

    return {
      miscStore,
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
    btnSize() {
      if (this.miscStore.breakpoint === 'xs') {
        return 'xs'
      } else {
        return 'sm'
      }
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
