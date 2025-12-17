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
          <b-tab @click="onFindCommunityTab">
            <template #title>
              <h2 class="ml-2 mr-2">Find Community</h2>
            </template>
            <ModSupportFindGroup ref="findGroupComponent" />
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
          <b-tab @click="onListCommunitiesTab">
            <template #title>
              <h2 class="ml-2 mr-2">List Communities</h2>
            </template>
            <ModSupportListGroups ref="listGroupsComponent" />
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
          <b-tab @click="onWorryWordsTab">
            <template #title>
              <h2 class="ml-2 mr-2">Worry Words</h2>
            </template>
            <ModSupportWorryWords ref="worryWordsComponent" />
          </b-tab>
          <b-tab @click="onSpamKeywordsTab">
            <template #title>
              <h2 class="ml-2 mr-2">Spam Keywords</h2>
            </template>
            <ModSupportSpamKeywords ref="spamKeywordsComponent" />
          </b-tab>
          <b-tab @click="onSystemLogsTab">
            <template #title>
              <h2 class="ml-2 mr-2">System Logs</h2>
            </template>
            <NoticeMessage variant="warning" class="mb-2">
              <b>Work in Progress:</b> We're part way through a slow migration
              from our own logging infrastructure to third-party solutions.
              Please report bugs or usability issues to
              <ExternalLink href="mailto:geeks@ilovefreegle.org">
                geeks@ilovefreegle.org </ExternalLink
              >. See
              <ExternalLink
                href="https://github.com/Freegle/FreegleDocker/blob/master/Logging.md"
              >
                Logging.md
              </ExternalLink>
              for technical details.
            </NoticeMessage>
            <ModSystemLogs
              v-if="systemLogsGroupid"
              :key="'systemlogs-' + systemLogsBump"
              :groupid="systemLogsGroupid"
            />
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
import { useRoute } from 'vue-router'
import { useChatStore } from '~/stores/chat'
import { useMessageStore } from '~/stores/message'
import { useSystemLogsStore } from '~/stores/systemlogs'
import { useMe } from '~/composables/useMe'

export default {
  setup() {
    const chatStore = useChatStore()
    const messageStore = useMessageStore()
    const systemLogsStore = useSystemLogsStore()
    const { supportOrAdmin } = useMe()
    return { chatStore, messageStore, systemLogsStore, supportOrAdmin }
  },
  data() {
    return {
      error: false,
      messageTerm: null,
      id: 0,
      systemLogsGroupid: null,
      systemLogsBump: 0,
    }
  },
  computed: {
    messages() {
      return this.messageStore.all
    },
  },
  created() {
    const route = useRoute()
    this.id = 'id' in route.params ? parseInt(route.params.id) : 0
    this.chatStore.list = [] // this.chatStore.clear()
    this.messageStore.clear()
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

    async onFindCommunityTab() {
      // Load communities when tab is selected
      if (this.$refs.findGroupComponent) {
        await this.$refs.findGroupComponent.loadCommunities()
      }
    },

    async onWorryWordsTab() {
      // Fetch worry words when tab is selected
      if (this.$refs.worryWordsComponent) {
        await this.$refs.worryWordsComponent.fetchWorryWords()
      }
    },

    async onSpamKeywordsTab() {
      // Fetch spam keywords when tab is selected
      if (this.$refs.spamKeywordsComponent) {
        await this.$refs.spamKeywordsComponent.fetchSpamKeywords()
      }
    },

    async onListCommunitiesTab() {
      // Fetch communities when tab is selected
      if (this.$refs.listGroupsComponent) {
        await this.$refs.listGroupsComponent.fetchCommunities()
      }
    },

    onSystemLogsTab() {
      // Initialize system logs with a special groupid to show all logs
      this.systemLogsBump = Date.now()
      this.systemLogsGroupid = -2
      this.systemLogsStore.clear()
    },
  },
}
</script>
<style scoped>
.max {
  max-width: 300px;
}
</style>
