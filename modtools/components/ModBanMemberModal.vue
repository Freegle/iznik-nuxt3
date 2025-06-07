<template>
  <div>
    <b-modal
      id="banMemberModal"
      ref="modal"
      title="Ban Member"
      size="lg"
      no-stacking
    >
      <template #default>
        <NoticeMessage variant="info" class="mb-2">
          This will ban someone from your community. Please be responsible in
          how you use this feature.
        </NoticeMessage>
        <p>
          This could be someone who is already a member, someone who has left,
          or someone who has not joined yet. You can find their userid from Logs
          or by mailing Support.
        </p>
        <b-form-input
          v-model="userid"
          type="number"
          placeholder="Enter their userid"
          class="mt-2 mb-2"
        />
      </template>
      <template #footer>
        <b-button variant="white" @click="hide"> Close </b-button>
        <b-button variant="primary" :disabled="!userid" @click="ban">
          Ban
        </b-button>
      </template>
    </b-modal>
  </div>
</template>
<script>
import { useMemberStore } from '@/stores/member'
import { useOurModal } from '~/composables/useOurModal'

export default {
  props: {
    groupid: {
      type: Number,
      required: true,
    },
  },
  setup() {
    const { modal, show, hide } = useOurModal()
    return { modal, show, hide }
  },
  data: function () {
    return {
      userid: null,
    }
  },
  methods: {
    async ban() {
      const memberStore = useMemberStore()
      await memberStore.ban(this.userid, this.groupid)

      this.hide()
    },
  },
}
</script>
