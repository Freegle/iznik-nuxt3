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
            <span v-if="volunteering.user">
              {{ volunteering.user.displayname }}
              <span class="text-muted">
                <v-icon icon="hashtag" scale="0.75" class="text-muted" />{{
                  volunteering.user.id
                }}
              </span>
            </span>
            <span v-else> System added </span>
          </b-col>
          <b-col cols="12" md="4">
            <span v-if="volunteering.groupsmt && volunteering.groupsmt.length">
              on {{ volunteering.groupsmt[0].nameshort }}
            </span>
          </b-col>
        </b-row>
      </b-card-header>
      <b-card-body>
        <NoticeMessage
          v-if="
            volunteering.groups.length &&
            volunteering.groups[0].ourPostingStatus === 'PROHIBITED'
          "
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
        <b-button variant="danger" class="mr-1" @click="confirmDelete">
          <v-icon icon="trash-alt" /> Delete
        </b-button>
        <ChatButton
          v-if="
            volunteering.groups &&
            volunteering.groups.length &&
            volunteering.user
          "
          :userid="volunteering.user.id"
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
    <ConfirmModal
      v-if="showDeleteConfirm"
      ref="confirmDeleteModal"
      title="Delete Volunteer Opportunity"
      message="Are you sure you want to delete this volunteer opportunity?"
      @confirm="deleteme"
      @hidden="showDeleteConfirm = false"
    />
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { useVolunteeringStore } from '@/stores/volunteering'

const props = defineProps({
  volunteering: {
    type: Object,
    required: true,
  },
})

const volunteeringStore = useVolunteeringStore()

const modalShown = ref(false)
const showDeleteConfirm = ref(false)

function edit() {
  modalShown.value = true
}

function confirmDelete() {
  showDeleteConfirm.value = true
}

function deleteme() {
  volunteeringStore.delete(props.volunteering.id)
  showDeleteConfirm.value = false
}

function approve() {
  volunteeringStore.save({
    id: props.volunteering.id,
    pending: false,
  })
  volunteeringStore.remove(props.volunteering.id)
}
</script>
