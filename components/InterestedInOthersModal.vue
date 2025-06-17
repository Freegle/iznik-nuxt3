<template>
  <b-modal ref="modal" scrollable size="lg">
    <template #title>
      <div class="d-flex">
        <ProfileImage
          v-if="otherUser.profile.path"
          :image="otherUser.profile.path"
          class="mr-2"
          is-thumbnail
          size="lg"
        />

        {{ otherTitle }}
      </div>
    </template>
    <template #default>
      <p>
        Check out their other posts - let them know if you're interested in any
        of these too.
      </p>
      <MessageList
        :messages-for-list="otherMessages"
        :jobs="false"
        class="msglist"
        small
      />
    </template>
    <template #footer>
      <b-button variant="primary" @click="hide"> Close </b-button>
    </template>
  </b-modal>
</template>

<script setup>
import { computed } from 'vue'
import ProfileImage from './ProfileImage.vue'
import MessageList from './MessageList.vue'
import { useOurModal } from '~/composables/useOurModal'
import { useMessageStore } from '~/stores/message'
import { useUserStore } from '~/stores/user'

const messageStore = useMessageStore()
const userStore = useUserStore()

const props = defineProps({
  msgid: {
    type: Number,
    required: true,
  },
  userid: {
    type: Number,
    required: true,
  },
})

const { modal, hide } = useOurModal()

// Fetch the messages for this user.
await Promise.all([
  messageStore.fetchByUser(props.userid, true, true),
  userStore.fetch(props.userid),
])

const otherMessages = messageStore.byUser(props.userid)

const otherUser = computed(() => {
  return userStore.byId(props.userid)
})
const otherTitle = computed(() => {
  return 'Others from ' + otherUser.value.displayname
})
</script>
<style scoped lang="scss">
.msglist {
  max-height: max(500px, 40vh);
}
</style>
