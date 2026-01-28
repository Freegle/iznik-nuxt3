<template>
  <div>
    <b-button
      v-if="group"
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
      ref="modal"
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
<script setup>
import { ref, computed, nextTick } from 'vue'
import saveAs from 'save-file'
import { createObjectCsvWriter } from 'csv-writer'
import { useMemberStore } from '~/stores/member'
import { useOurModal } from '~/composables/useOurModal'
import { useModGroupStore } from '~/stores/modgroup'

const props = defineProps({
  groupid: {
    type: Number,
    required: true,
  },
})

const modGroupStore = useModGroupStore()
const memberStore = useMemberStore()
const { modal } = useOurModal()

const showExportModal = ref(false)
const context = ref(null)
const cancelled = ref(false)
const limit = 100
const fetched = ref(0)
const exportList = ref([])
const modalButtonLabel = ref('Cancel')

const group = computed(() => modGroupStore.get(props.groupid))

const admin = computed(() => group.value?.myrole === 'Owner')

const progressValue = computed(() => {
  return group.value && group.value.membercount
    ? Math.round((100 * fetched.value) / group.value.membercount)
    : 0
})

function cancelit() {
  cancelled.value = true
  exportList.value = []
  showExportModal.value = false
}

async function exportChunk() {
  if (!cancelled.value) {
    await memberStore.clear()
    await memberStore.fetchMembers({
      groupid: props.groupid,
      collection: 'Approved',
      modtools: true,
      summary: false,
      context: context.value,
      limit,
    })
  }

  const members = memberStore.getByGroup(props.groupid)
  fetched.value += members.length

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
    // List seems to include some members already returned so ignore duplicates
    if (!exportList.value.find((m) => m.id === member.userid)) {
      exportList.value.push({
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
    }
  })

  context.value = memberStore.context
  if (!cancelled.value && members.length) {
    // More to get
    nextTick(() => {
      exportChunk()
    })
  } else {
    // Got them all.
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
    const str =
      writer.csvStringifier.getHeaderString() +
      writer.csvStringifier.stringifyRecords(exportList.value)
    const blob = new Blob([str], { type: 'text/csv;charset=utf-8' })
    modalButtonLabel.value = 'Done'
    await saveAs(blob, 'members.csv')
    showExportModal.value = false
  }
}

function download() {
  modalButtonLabel.value = 'Cancel'
  context.value = null
  cancelled.value = false
  exportList.value = []
  fetched.value = 0
  showExportModal.value = true
  nextTick(() => {
    modal.value.show()
    exportChunk()
  })
}
</script>
