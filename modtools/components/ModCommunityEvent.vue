<template>
  <div v-if="event && event.pending">
    <b-card no-body>
      <b-card-header>
        <b-row>
          <b-col cols="6" md="4">
            Event <v-icon icon="hashtag" scale="0.75" class="text-muted" />{{
              event.id
            }}
          </b-col>
          <b-col cols="6" md="4">
            <span v-if="!event.userid"> Added by the system </span>
            <span v-else>
              {{ eventUser?.displayname }}
              <span class="text-muted">
                <v-icon icon="hashtag" scale="0.75" class="text-muted" />{{
                  event.userid
                }}
              </span>
            </span>
          </b-col>
          <b-col v-if="groups.length > 0" cols="12" md="4">
            on {{ groups[0].nameshort }}
          </b-col>
        </b-row>
      </b-card-header>
      <b-card-body>
        <NoticeMessage
          v-if="
            groups.length > 0 && groups[0].ourPostingStatus === 'PROHIBITED'
          "
          variant="danger"
          class="mb-2"
        >
          This member is set not to be able to post OFFERs/WANTEDs.
        </NoticeMessage>
        <CommunityEvent :id="event.id" :summary="false" />
      </b-card-body>
      <b-card-footer>
        <b-button variant="primary" class="mr-1" @click="approve">
          <v-icon icon="check" /> Approve
        </b-button>
        <b-button variant="white" class="mr-1" @click="edit">
          <v-icon icon="pen" /> Edit
        </b-button>
        <b-button variant="danger" class="mr-1" @click="deleteme">
          <v-icon icon="trash-alt" /> Delete
        </b-button>
        <ChatButton
          v-if="groups.length > 0 && event.userid"
          :userid="event.userid"
          :groupid="groups[0].id"
          title="Chat"
          variant="white"
          class="mr-1"
        />
      </b-card-footer>
    </b-card>
    <CommunityEventModal
      v-if="showModal"
      :id="event.id"
      ref="eventmodal"
      :start-edit="true"
      :ismod="true"
      @hidden="showModal = false"
    />
  </div>
</template>
<script setup>
import { ref, computed, watch } from 'vue'
import { useCommunityEventStore } from '~/stores/communityevent'
import { useGroupStore } from '~/stores/group'
import { useUserStore } from '~/stores/user'

const props = defineProps({
  event: {
    type: Object,
    required: true,
  },
})

const communityEventStore = useCommunityEventStore()
const groupStore = useGroupStore()
const userStore = useUserStore()

const showModal = ref(false)
const eventmodal = ref(null)

// Fetch user details for display
watch(
  () => props.event?.userid,
  (userid) => {
    if (userid) {
      userStore.fetch(userid)
    }
  },
  { immediate: true }
)

const eventUser = computed(() => {
  return props.event?.userid ? userStore.byId(props.event.userid) : null
})

const groups = computed(() => {
  const ret = []
  props.event?.groups?.forEach((id) => {
    const group = groupStore?.get(id)

    if (group) {
      ret.push(group)
    }
  })
  return ret
})

function edit() {
  showModal.value = true
  eventmodal.value?.show()
}

function deleteme() {
  communityEventStore.delete(props.event.id)
}

function approve() {
  communityEventStore.save({
    id: props.event.id,
    pending: false,
  })
}
</script>
