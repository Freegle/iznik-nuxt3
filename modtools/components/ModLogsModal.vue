<template>
  <div>
    <b-modal
      :id="'modLogsModal-' + userid + '-' + modmailsonly"
      ref="modal"
      :title="title"
      size="xl"
      no-stacking
    >
      <template #default>
        <NoticeMessage v-if="!busy && !logs.length" variant="info">
          There are no logs to show.
        </NoticeMessage>
        <div v-else>
          <p class="text-muted">
            Some old logs are removed to save space: login/logout after 1 year,
            bounces over 90 days, logs about deleted messages, deleted users.
          </p>
          <ModLog v-for="log in logs" :key="'log-' + log.id" :log="log" />
        </div>
        <infinite-loading
          :distance="200"
          :identifier="bump"
          @infinite="fetchChunk"
        >
          <template #spinner>
            <b-img src="/loader.gif" alt="Loading" width="100px" />
          </template>
        </infinite-loading>
      </template>

      <template #footer>
        <b-button variant="primary" @click="hide"> Close </b-button>
      </template>
    </b-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '~/stores/user'
import { useLogsStore } from '~/stores/logs'
import { useMemberStore } from '~/stores/member'
import { useOurModal } from '~/composables/useOurModal'

const props = defineProps({
  userid: {
    type: Number,
    required: true,
  },
  modmailsonly: {
    type: Boolean,
    required: false,
    default: false,
  },
})

const userStore = useUserStore()
const logsStore = useLogsStore()
const memberStore = useMemberStore()
const { modal, hide } = useOurModal()

const busy = ref(false)
const context = ref(null)
const bump = ref(0)

const logs = computed(() => logsStore.list)

const user = computed(() => {
  let ret = null
  let u = userStore?.byId(props.userid)

  if (u) {
    if (u && u.info) {
      ret = u
    } else {
      u = memberStore.getByUserId(props.userid)

      if (u && u.info) {
        ret = u
      }
    }
  }

  return ret
})

const title = computed(() => {
  let ret

  if (props.modmailsonly) {
    ret = 'Modmails '
  } else {
    ret = 'Logs '
  }

  ret += user.value ? 'for ' + user.value.displayname : ''

  return ret
})

function show() {
  // Clear the log context - otherwise if we open another modal for this user then it will get confused and
  // fetch from a previous context and show no logs.
  logsStore.clear()
  bump.value++
  modal.value.show()
}

async function fetchChunk($state) {
  busy.value = true
  const currentCount = logs.value.length

  context.value = await logsStore.fetch({
    logtype: 'user',
    userid: props.userid,
    context: context.value,
    modmailsonly: props.modmailsonly,
  })

  if (logs.value.length === currentCount) {
    // We've returned less than a chunk, so we must be done.
    $state.complete()
  } else {
    $state.loaded()
  }

  busy.value = false
}

onMounted(() => {
  logsStore.clear()
})

defineExpose({ show, hide })
</script>
