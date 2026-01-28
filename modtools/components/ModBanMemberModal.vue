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
<script setup>
import { ref } from 'vue'
import { useMemberStore } from '@/stores/member'
import { useOurModal } from '~/composables/useOurModal'

const props = defineProps({
  groupid: {
    type: Number,
    required: true,
  },
})

const memberStore = useMemberStore()
const { modal, show, hide } = useOurModal()

const userid = ref(null)

async function ban() {
  await memberStore.ban(userid.value, props.groupid)
  hide()
}

defineExpose({ modal, show, hide })
</script>
