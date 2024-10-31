<template>
  <div v-if="volunteering && volunteering.pending">
    <b-card no-body>
      <b-card-header>
        <b-row>
          <b-col cols="6" md="4">
            Opportunity <v-icon icon="hashtag" scale="0.75" class="text-muted" />{{ volunteering.id }}
          </b-col>
          <b-col cols="6" md="4">
            <span v-if="volunteering.user">
              {{ volunteering.user.displayname }}
              <span class="text-muted">
                <v-icon icon="hashtag" scale="0.75" class="text-muted" />{{ volunteering.user.id }}
              </span>
            </span>
            <span v-else>
              System added
            </span>
          </b-col>
          <b-col cols="12" md="4">
            <span v-if="volunteering.groups && volunteering.groups.length">
              on {{ volunteering.groups[0].nameshort }}
            </span>
          </b-col>
        </b-row>
      </b-card-header>
      <b-card-body>
        <NoticeMessage v-if="volunteering.groups.length && volunteering.groups[0].ourPostingStatus === 'PROHIBITED'" variant="danger" class="mb-2">
          This member is set not to be able to post OFFERs/WANTEDs.
        </NoticeMessage>
        <VolunteerOpportunity :item="volunteering" :summary="false" />
      </b-card-body>
      <b-card-footer>
        <b-btn variant="primary" class="mr-1" @click="approve">
          <v-icon icon="check" /> Approve
        </b-btn>
        <b-btn variant="white" class="mr-1" @click="edit">
          <v-icon icon="pen" /> Edit
        </b-btn>
        <b-btn variant="danger" class="mr-1" @click="deleteme">
          <v-icon icon="trash-alt" /> Delete
        </b-btn>
        <ChatButton
          v-if="volunteering.groups && volunteering.groups.length && volunteering.user"
          :userid="volunteering.user.id"
          :groupid="volunteering.groups[0].id"
          title="Chat"
          variant="white"
          class="mr-1"
        />
      </b-card-footer>
    </b-card>
    <VolunteerOpportunityModal
        v-if="modalShown"
        :volunteering="volunteering"
        :start-edit="true"
        @hidden="modalShown = false"
      />
  </div>
</template>
<script>

export default {
  props: {
    volunteering: {
      type: Object,
      required: true
    }
  },
  data: function () {
    return {
      modalShown: false,
    }
  },
  methods: {
    edit() {
      this.modalShown = true
      this.$refs.volunteeringmodal?.show()
    },
    deleteme() {
      this.$store.dispatch('volunteerops/delete', {
        id: this.volunteering.id
      })
    },
    approve() {
      this.$store.dispatch('volunteerops/save', {
        id: this.volunteering.id,
        pending: false
      })
    }
  }
}
</script>
