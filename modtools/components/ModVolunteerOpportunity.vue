<template>
  <div v-if="volunteering && volunteering.pending">
    <b-card no-body>
      <b-card-header>
        <b-row>
          <b-col cols="6" md="4">
            Opportunity
            <v-icon icon="hashtag" scale="0.75" class="text-muted" />{{
              volunteering.id
            }}
          </b-col>
          <b-col cols="6" md="4">
            <span v-if="volunteering.userid">
              {{ volUser?.displayname }}
              <span class="text-muted">
                <v-icon icon="hashtag" scale="0.75" class="text-muted" />{{
                  volunteering.userid
                }}
              </span>
            </span>
            <span v-else> System added </span>
          </b-col>
          <b-col cols="12" md="4">
            <span v-if="groups.length"> on {{ groups[0].nameshort }} </span>
          </b-col>
        </b-row>
      </b-card-header>
      <b-card-body>
        <NoticeMessage
          v-if="groups.length && groups[0].ourPostingStatus === 'PROHIBITED'"
          variant="danger"
          class="mb-2"
        >
          This member is set not to be able to post OFFERs/WANTEDs.
        </NoticeMessage>
        <VolunteerOpportunity
          :id="volunteering.id"
          :item="volunteering"
          :summary="false"
        />
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
          v-if="
            volunteering.groups &&
            volunteering.groups.length &&
            volunteering.userid
          "
          :userid="volunteering.userid"
          :groupid="volunteering.groups[0]"
          title="Chat"
          variant="white"
          class="mr-1"
        />
      </b-card-footer>
    </b-card>
    <VolunteerOpportunityModal
      v-if="modalShown"
      :id="volunteering.id"
      :volunteering="volunteering"
      :start-edit="true"
      @hidden="modalShown = false"
    />
  </div>
</template>
<script setup>
import { ref, computed, watch } from 'vue'
import { useVolunteeringStore } from '@/stores/volunteering'
import { useGroupStore } from '~/stores/group'
import { useUserStore } from '~/stores/user'

const props = defineProps({
  volunteering: {
    type: Object,
    required: true,
  },
})

const volunteeringStore = useVolunteeringStore()
const groupStore = useGroupStore()
const userStore = useUserStore()

const modalShown = ref(false)

// Fetch user details for display
watch(
  () => props.volunteering?.userid,
  (userid) => {
    if (userid) {
      userStore.fetch(userid)
    }
  },
  { immediate: true }
)

const volUser = computed(() => {
  return props.volunteering?.userid
    ? userStore.byId(props.volunteering.userid)
    : null
})

const groups = computed(() => {
  const ret = []
  props.volunteering?.groups?.forEach((id) => {
    const group = groupStore?.get(id)
    if (group) {
      ret.push(group)
    }
  })
  return ret
})

function edit() {
  modalShown.value = true
}

function deleteme() {
  volunteeringStore.delete(props.volunteering.id)
}

function approve() {
  volunteeringStore.save({
    id: props.volunteering.id,
    pending: false,
  })
  volunteeringStore.remove(props.volunteering.id)
}
</script>
