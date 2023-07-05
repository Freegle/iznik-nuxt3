<template>
  <NoticeMessage>
    <p>
      You are logged in with
      <!-- eslint-disable-next-line -->
      <strong v-if="ours">{{ ours }}</strong><strong v-else>as <v-icon icon="hashtag" class="text-muted fa-0-8x" />{{ myid }}</strong>, but <strong>{{ theirs }}</strong> belongs to another account.
    </p>
    <p>
      If they are both yours, you can ask the
      {{ group?.namedisplay }} volunteers to merge your accounts.
    </p>
    <b-button
      v-if="groupid"
      size="lg"
      class="mb-2"
      variant="white"
      @click="requestMerge"
      >Request merge</b-button
    >
    <SupportLink
      v-else
      size="lg"
      :info="'Requesting merge of ' + ours + ' and ' + theirs"
      text="Request merge"
    />
  </NoticeMessage>
</template>
<script>
import { computed } from 'vue'
import { useComposeStore } from '../stores/compose'
import { useGroupStore } from '../stores/group'
import { useChatStore } from '../stores/chat'
import NoticeMessage from './NoticeMessage'
import SupportLink from '~/components/SupportLink'

export default {
  components: { NoticeMessage, SupportLink },
  props: {
    ours: {
      type: String,
      required: true,
    },
    theirs: {
      type: String,
      required: true,
    },
  },
  setup() {
    const composeStore = useComposeStore()
    const groupStore = useGroupStore()
    const chatStore = useChatStore()

    const groupid = computed(() => {
      return composeStore.group
    })

    if (groupid.value) {
      groupStore.fetch(groupid.value)
    }

    return { composeStore, groupStore, chatStore, groupid }
  },
  computed: {
    group() {
      return this.groupStore.get(this.groupid)
    },
  },
  methods: {
    async requestMerge() {
      const chatid = await this.chatStore.openChatToMods(this.groupid)

      if (chatid) {
        await this.chatStore.send(
          chatid,
            "I'd like you to merge my account " + this.ours + " into " + this.theirs + " please, with " + this.theirs + " as the primary email. You can email me at both addresses to confirm that they're both mine.",
          null,
          null,
          null
        )

        const router = useRouter()
        router.push('/chats/' + chatid)
      }
    },
  },
}
</script>
