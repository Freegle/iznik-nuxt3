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
        v-if="promise.tryst?.calendarLink"
        :calendar-link="promise.tryst.calendarLink"
        variant="link"
        btn-class="ps-0"
        :size="btnSize"
        class="d-flex flex-column justify-content-around"
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
<script setup>
import { defineAsyncComponent, ref, computed } from 'vue'
import { useMessageStore } from '~/stores/message'
import { useUserStore } from '~/stores/user'
import { useMiscStore } from '~/stores/misc'
import { useMe } from '~/composables/useMe'
import AddToCalendar from '~/components/AddToCalendar'

const PromiseModal = defineAsyncComponent(() =>
  import('~/components/PromiseModal')
)
const RenegeModal = defineAsyncComponent(() => import('./RenegeModal'))

const props = defineProps({
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
})

const miscStore = useMiscStore()
const messageStore = useMessageStore()
const userStore = useUserStore()
const { myid } = useMe()

const showPromiseModal = ref(false)
const showRenegeModal = ref(false)

const message = computed(() => {
  return messageStore?.byId(props.id)
})

const promisee = computed(() => {
  return props.promise?.id
})

const promiseeUser = computed(() => {
  return userStore.byId(promisee.value)
})

const btnSize = computed(() => {
  if (miscStore.breakpoint === 'xs') {
    return 'xs'
  } else {
    return 'sm'
  }
})

function changeTime(e) {
  e.preventDefault()
  e.stopPropagation()
  showPromiseModal.value = true
}

function unpromise(e) {
  e.preventDefault()
  e.stopPropagation()
  console.log('Renege', message.value, props.promise)
  showRenegeModal.value = true
  console.log('Shown')
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
    color: white;
    padding-top: 7px;
    padding-right: 7px;
  }
}
</style>
