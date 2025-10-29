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
            <span v-if="!event.user.id"> Added by the system </span>
            <span v-else>
              {{ event.user.displayname }}
              <span class="text-muted">
                <v-icon icon="hashtag" scale="0.75" class="text-muted" />{{
                  event.user.id
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
          v-if="groups.length > 0 && event.user.id"
          :userid="event.user.id"
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
<script>
import { useCommunityEventStore } from '~/stores/communityevent'
import { useGroupStore } from '~/stores/group'

export default {
  props: {
    event: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const communityEventStore = useCommunityEventStore()
    const groupStore = useGroupStore()
    return {
      communityEventStore,
      groupStore,
    }
  },
  data: function () {
    return {
      showModal: false,
    }
  },
  computed: {
    groups() {
      const ret = []
      this.event?.groups?.forEach((id) => {
        const group = this.groupStore?.get(id)

        if (group) {
          ret.push(group)
        }
      })
      return ret
    },
  },
  methods: {
    edit() {
      this.showModal = true
      this.$refs.eventmodal?.show()
    },
    deleteme() {
      this.communityEventStore.delete(this.event.id)
    },
    approve() {
      this.communityEventStore.save({
        id: this.event.id,
        pending: false,
      })
    },
  },
}
</script>
