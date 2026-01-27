<template>
  <div>
    <b-modal
      id="addMemberModal"
      ref="modal"
      title="Add Member"
      size="lg"
      no-stacking
    >
      <template #default>
        <div v-if="addedId">
          We've added them. In case you need it, their id is
          <v-icon icon="hashtag" class="text-muted" scale="0.75" />{{
            addedId
          }}.
        </div>
        <div v-else>
          <NoticeMessage variant="info">
            This will add someone as a member of your community. Please be
            responsible in how you use this feature.
          </NoticeMessage>
          <b-form-input
            v-model="email"
            type="email"
            placeholder="Enter their email address"
            class="mt-2 mb-2"
          />
          <p>
            If they've not used Freegle before, they will get the standard
            Freegle welcome mail with an invented password so that they can log
            in.
          </p>
        </div>
      </template>
      <template #footer>
        <b-button variant="white" @click="hide"> Close </b-button>
        <b-button
          v-if="!addedId"
          variant="primary"
          :disabled="!email"
          @click="add"
        >
          Add
        </b-button>
      </template>
    </b-modal>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { useMemberStore } from '~/stores/member'
import { useUserStore } from '~/stores/user'
import { useOurModal } from '~/composables/useOurModal'

const props = defineProps({
  groupid: {
    type: Number,
    required: true,
  },
})

const memberStore = useMemberStore()
const userStore = useUserStore()
const { modal, show, hide } = useOurModal()

const email = ref(null)
const addedId = ref(null)

async function add() {
  addedId.value = await userStore.add({
    email: email.value,
  })

  if (addedId.value) {
    await memberStore.add({
      userid: addedId.value,
      groupid: props.groupid,
    })
  }
}

defineExpose({ show, hide })
</script>
