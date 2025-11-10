<template>
  <div>
    <div v-if="supportOrAdmin">
      <div>
        <b-tabs content-class="mt-3" card>
          <b-tab active>
            <template #title>
              <h2 class="ml-2 mr-2">Find User</h2>
            </template>
            <ModSupportFindUser :id="id" />
          </b-tab>
          <b-tab>
            <template #title>
              <h2 class="ml-2 mr-2">Find Community</h2>
            </template>
            <ModSupportFindGroup />
          </b-tab>
          <b-tab>
            <template #title>
              <h2 class="ml-2 mr-2">Find Message</h2>
            </template>
            <p>
              You can search for message by id, or by subject. This will only
              return the first few results, so the more specific, the better.
            </p>
            <ModFindMessage
              :message-term="messageTerm"
              @searched="searchedMessage"
              @changed="changedMessageTerm"
            />
            <div v-if="messages" class="mt-2">
              <ModMessage
                v-for="message in messages"
                :key="'message-' + message.id"
                :message="message"
                noactions
              />
            </div>
            <NoticeMessage v-if="error" class="mt-2" variant="warning">
              Couldn't fetch that message. Almost always this is because the
              message doesn't exist (or has been very deleted).
            </NoticeMessage>
          </b-tab>
          <b-tab>
            <template #title>
              <h2 class="ml-2 mr-2">List Communities</h2>
            </template>
            <ModSupportListGroups />
          </b-tab>
          <b-tab>
            <template #title>
              <h2 class="ml-2 mr-2">Contact Community</h2>
            </template>
            <ModSupportContactGroup />
          </b-tab>
          <b-tab>
            <template #title>
              <h2 class="ml-2 mr-2">Add Community</h2>
            </template>
            <ModSupportAddGroup />
          </b-tab>
          <b-tab>
            <template #title>
              <h2 class="ml-2 mr-2">Check Volunteers</h2>
            </template>
            <ModSupportCheckVolunteers />
          </b-tab>
        </b-tabs>
      </div>
    </div>
    <NoticeMessage v-else variant="warning">
      You don't have access to Support Tools.
    </NoticeMessage>
  </div>
</template>
<script>
import { useChatStore } from '~/stores/chat'
import { useMessageStore } from '~/stores/message'
import { useModGroupStore } from '@/stores/modgroup'

export default {
  async setup() {
    const chatStore = useChatStore()
    const messageStore = useMessageStore()
    return { chatStore, messageStore }
  },
  data() {
    return {
      error: false,
      messageTerm: null,
      id: 0,
    }
  },
  computed: {
    messages() {
      return this.messageStore.all
    },
  },
  async created() {
    const route = useRoute()
    this.id = 'id' in route.params ? parseInt(route.params.id) : 0
    this.chatStore.list = [] // this.chatStore.clear()
    this.messageStore.clear()
  },
  mounted() {
    const modGroupStore = useModGroupStore()
    modGroupStore.getModGroups()
  },
  methods: {
    changedMessageTerm(term) {
      this.messageTerm = term.trim()
    },
    async searchedMessage() {
      const term = this.messageTerm
      await this.messageStore.clearContext()
      await this.messageStore.clear()

      if (term) {
        if (!isNaN(term)) {
          // This is a raw message id
          await this.searchById(term)
        } else if (term.substring(0, 1) === '#' && !isNaN(term.substring(1))) {
          // This is a #id
          await this.searchById(term.substring(1))
        } else {
          await this.searchBySubject(term)
        }
      }
    },

    async searchById(id) {
      this.error = false

      try {
        const message = await this.messageStore.fetchMT({
          id,
          messagehistory: true,
        })
        if (message) this.messageStore.list[id] = message
      } catch (e) {
        console.log("Couldn't fetch", e)
        this.error = true
      }
    },
    async searchBySubject(subj) {
      this.error = false

      await this.messageStore.searchMT({ term: subj, groupid: this.groupid })
    },
  },
}
</script>
<style scoped>
.max {
  max-width: 300px;
}
</style>
