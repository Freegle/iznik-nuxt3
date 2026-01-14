<template>
  <div>
    <b-modal
      ref="modal"
      :title="'Post Summary for ' + user.displayname"
      size="lg"
      no-stacking
    >
      <template #default>
        <NoticeMessage v-if="!messages.length" variant="info" class="mb-2">
          There are no posts to show.
        </NoticeMessage>
        <ModGroupSelect v-model="groupid" modonly class="mb-2" />
        <b-row v-for="message in messages" :key="message.id">
          <b-col cols="8" sm="3">
            <div>{{ datetimeshort(message.arrival) }}</div>
          </b-col>
          <b-col cols="4" sm="2">
            <div>
              <v-icon icon="hashtag" scale="0.75" class="text-muted" />{{
                message.id
              }}
              <span v-if="message.repost">
                <v-icon
                  v-if="message.autorepost"
                  icon="sync"
                  class="text-danger"
                  title="Auto-repost"
                />
                <v-icon
                  v-else
                  icon="hand-paper"
                  class="text-danger"
                  title="Manual repost"
                />
              </span>
            </div>
          </b-col>
          <b-col cols="12" sm="7">
            <div>
              {{ message.subject }}
            </div>
            <div class="text-muted">
              on {{ message.groupname
              }}<span v-if="message.outcome">, now {{ message.outcome }}</span
              ><span v-else>, still open</span>
              <span v-if="message.collection === 'Pending'" class="text-danger">
                Pending</span
              >
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

<script>
import { useGroupStore } from '~/stores/group'
import { useOurModal } from '~/composables/useOurModal'

export default {
  props: {
    user: {
      type: Object,
      required: true,
    },
    type: {
      type: String,
      required: false,
      default: null,
    },
  },
  setup() {
    const groupStore = useGroupStore()
    const { modal, hide } = useOurModal()
    return { groupStore, modal, hide }
  },
  data: function () {
    return {
      groupid: null,
    }
  },
  computed: {
    messages() {
      let ret = []

      if (this.user && this.user.messagehistory) {
        ret = this.user.messagehistory.filter((message) => {
          return !this.type || this.type === message.type
        })

        const allGroups = this.groupStore.list

        ret.forEach((message) => {
          if (allGroups && allGroups[message.groupid]) {
            message.groupname = allGroups[message.groupid].namedisplay
          } else {
            message.groupname = '#' + message.groupid
          }
        })

        ret.sort((a, b) => {
          return new Date(b.arrival).getTime() - new Date(a.arrival).getTime()
        })
      }

      if (this.groupid !== null && this.groupid !== 0) {
        ret = ret.filter((message) => {
          return message.groupid === this.groupid
        })
      }

      return ret
    },
  },
  mounted() {
    // Not all the groups we show will be ours, so get them all for the group name.
    // TODO: This gets all groups but cannot decide if needed:
    // this.groupStore.listMT({
    //  grouptype: 'Freegle'
    // })
  },
  methods: {
    show() {
      this.groupid = null
      this.modal.show()
    },
  },
}
</script>
