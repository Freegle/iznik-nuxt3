<template>
  <div>
    <b-modal
      ref="modal"
      :title="'Replies by ' + (user ? user.displayname : '#' + userid)"
      size="lg"
      no-stacking
    >
      <template #default>
        <NoticeMessage
          v-if="loaded && !replies.length"
          variant="info"
          class="mb-2"
        >
          No replies to show.
        </NoticeMessage>
        <div v-if="!loaded" class="text-center py-3">Loading...</div>
        <b-row v-for="reply in replies" :key="reply.id" class="small">
          <b-col cols="8" sm="3" class="text-nowrap">
            <div>{{ datetimeshort(reply.arrival) }}</div>
          </b-col>
          <b-col cols="4" sm="2" class="text-nowrap">
            <div>
              <v-icon icon="hashtag" scale="0.75" class="text-muted" />{{
                reply.id
              }}
            </div>
          </b-col>
          <b-col cols="12" sm="7">
            <div>{{ reply.subject }}</div>
            <div class="text-muted">
              <span v-if="reply.outcome">now {{ reply.outcome }}</span>
              <span v-else>still open</span>
            </div>
          </b-col>
        </b-row>
      </template>
      <template #footer>
        <b-button variant="primary" @click="hide"> Close </b-button>
      </template>
    </b-modal>
  </div>
</template>
<script setup>
import { ref, watch } from 'vue'
import { useUserStore } from '~/stores/user'
import { useOurModal } from '~/composables/useOurModal'
import api from '~/api'

const props = defineProps({
  userid: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    required: false,
    default: null,
  },
})

const userStore = useUserStore()
const user = ref(null)
const replies = ref([])
const loaded = ref(false)
const { modal, hide } = useOurModal()

watch(
  () => props.userid,
  (uid) => {
    user.value = userStore.byId(uid)
    if (uid && !user.value) {
      userStore.fetch(uid)
    }
  },
  { immediate: true }
)

watch(
  () => userStore.byId(props.userid),
  (u) => {
    user.value = u
  }
)

async function show() {
  loaded.value = false
  replies.value = []
  modal.value.show()

  const config = useRuntimeConfig()
  const data = await api(config).user.fetchReplies(props.userid, props.type)
  replies.value = Array.isArray(data) ? data : []
  loaded.value = true
}

defineExpose({ show })
</script>
