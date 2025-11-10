<template>
  <div>
    <b-button
      :disabled="!admin"
      variant="white"
      :title="
        admin
          ? 'Export'
          : 'This is now disabled for GDPR reasons.  If you wish to diaffiliate from Freegle please mail newgroups@ilovefreegle.org'
      "
      @click="download"
    >
      <v-icon icon="download" /> Export
    </b-button>
    <b-modal
      v-if="showExportModal"
      id="exportmodal"
      ref="exportmodal"
      title="Member Export"
      no-stacking
    >
      <template #default>
        <p>
          This will export the members of this community. It's very slow, but
          you probably won't need to do it often.
        </p>
        <p>Export in progress...</p>
        <b-progress height="48px" class="mt-2" animate variant="success">
          <b-progress-bar :value="progressValue" />
        </b-progress>
      </template>
      <template #footer>
        <b-button variant="white" @click="cancelit">
          {{ modalButtonLabel }}
        </b-button>
      </template>
    </b-modal>
  </div>
</template>
<script>
import saveAs from 'save-file'
import { createObjectCsvWriter } from 'csv-writer'
import { useGroupStore } from '~/stores/group'
import { useMemberStore } from '~/stores/member'
import { useOurModal } from '~/composables/useOurModal'

export default {
  props: {
    groupid: {
      type: Number,
      required: true,
    },
  },
  setup() {
    const groupStore = useGroupStore()
    const memberStore = useMemberStore()
    const { modal, show, hide } = useOurModal()
    return { groupStore, memberStore, modal, show, hide }
  },
  data: function () {
    return {
      showExportModal: false,
      context: null,
      cancelled: false,
      limit: 100,
      fetched: 0,
      exportList: [],
      modalButtonLabel: 'Cancel',
    }
  },
  computed: {
    group() {
      return this.groupStore.get(this.groupid)
    },
    progressValue() {
      return this.group && this.group.membercount
        ? Math.round((100 * this.fetched) / this.group.membercount)
        : 0
    },
  },
  methods: {
    async download() {
      this.modalButtonLabel = 'Cancel'
      this.context = null
      this.cancelled = false
      this.exportList = []
      this.fetched = 0
      this.showExportModal = true
      await nextTick()
      this.$refs.exportmodal?.show()
      this.exportChunk()
    },
    cancelit() {
      this.cancelled = true
      this.exportList = []
      this.showExportModal = false
    },
    async exportChunk() {
      if (!this.cancelled) {
        await this.memberStore.clear()
        await this.memberStore.fetchMembers({
          groupid: this.groupid,
          collection: 'Approved',
          modtools: true,
          summary: false,
          context: this.context,
          limit: this.limit,
        })
      }

      const members = this.memberStore.getByGroup(this.groupid)
      this.fetched += members.length

      const writer = createObjectCsvWriter({
        path: 'members.csv',
        header: [
          { id: 'id', title: 'Id' },
          { id: 'name', title: 'Name' },
          { id: 'email', title: 'Email' },
          { id: 'joined', title: 'Joined' },
          { id: 'lastactive', title: 'Last Active' },
          { id: 'role', title: 'Role' },
          { id: 'otheremails', title: 'Other Emails' },
          { id: 'settings', title: 'Settings' },
          { id: 'postingstatus', title: 'Posting Status' },
          { id: 'bouncing', title: 'Bouncing' },
          { id: 'trustlevel', title: 'MicroVolunteering' },
          { id: 'comments', title: 'Comments' },
        ],
      })

      members.forEach((member) => {
        const otheremails = []
        member.otheremails.forEach((email) => {
          if (email.email !== member.email) {
            otheremails.push(email.email)
          }
        })

        const comments = []
        member.comments.forEach((comment) => {
          if (comment.user1) {
            comments.push(comment.user1)
          }
          if (comment.user2) {
            comments.push(comment.user2)
          }
          if (comment.user3) {
            comments.push(comment.user3)
          }
          if (comment.user4) {
            comments.push(comment.user4)
          }
          if (comment.user5) {
            comments.push(comment.user5)
          }
          if (comment.user6) {
            comments.push(comment.user6)
          }
          if (comment.user7) {
            comments.push(comment.user7)
          }
          if (comment.user8) {
            comments.push(comment.user8)
          }
          if (comment.user9) {
            comments.push(comment.user9)
          }
          if (comment.user10) {
            comments.push(comment.user10)
          }
          if (comment.user11) {
            comments.push(comment.user11)
          }
        })

        this.exportList.push({
          id: member.userid,
          name: member.displayname,
          email: member.email,
          joined: member.joined,
          lastactive: member.lastaccess,
          role: member.role,
          otheremails: otheremails.join(', '),
          settings: JSON.stringify(member.settings, null, 0),
          postingstatus: member.ourpostingstatus,
          bouncing: member.bouncing,
          trustlevel: member.trustlevel,
          comments: comments.join('; '),
        })
      })

      this.context = this.memberStore.context

      if (!this.cancelled && members.length) {
        // More to get
        this.$nextTick(() => {
          this.exportChunk()
        })
      } else {
        // Got them all.
        const str =
          writer.csvStringifier.getHeaderString() +
          writer.csvStringifier.stringifyRecords(this.exportList)
        const blob = new Blob([str], { type: 'text/csv;charset=utf-8' })
        this.modalButtonLabel = 'Done'
        await saveAs(blob, 'members.csv')
        this.showExportModal = false
      }
    },
  },
}
</script>
