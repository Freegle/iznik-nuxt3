<template>
  <div>
    <div v-if="supportOrAdmin">
      <b-tabs v-model="activeSection" content-class="mt-3" card>
        <!-- USERS SECTION -->
        <b-tab>
          <template #title>
            <h2 class="ml-2 mr-2">Users</h2>
          </template>
          <b-tabs v-model="userTab" content-class="mt-2" pills>
            <b-tab title="Find User">
              <ModSupportFindUser :id="id" />
            </b-tab>
            <b-tab title="Find Message">
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
          </b-tabs>
        </b-tab>

        <!-- COMMUNITIES SECTION -->
        <b-tab @click="onCommunitySection">
          <template #title>
            <h2 class="ml-2 mr-2">Communities</h2>
          </template>
          <b-tabs v-model="communityTab" content-class="mt-2" pills>
            <b-tab title="Find" @click="onFindCommunityTab">
              <ModSupportFindGroup ref="findGroupComponent" />
            </b-tab>
            <b-tab title="List" @click="onListCommunitiesTab">
              <ModSupportListGroups ref="listGroupsComponent" />
            </b-tab>
            <b-tab title="Contact">
              <ModSupportContactGroup />
            </b-tab>
            <b-tab title="Add">
              <ModSupportAddGroup />
            </b-tab>
            <b-tab title="Check Volunteers">
              <ModSupportCheckVolunteers />
            </b-tab>
          </b-tabs>
        </b-tab>

        <!-- SYSTEM SECTION -->
        <b-tab @click="onSystemSection">
          <template #title>
            <h2 class="ml-2 mr-2">System</h2>
          </template>
          <b-tabs v-model="systemTab" content-class="mt-2" pills>
            <b-tab @click="onSystemLogsTab">
              <template #title>
                System Logs
                <b-badge
                  variant="danger"
                  class="ml-1"
                  style="font-size: 0.6em; vertical-align: super"
                  >WIP</b-badge
                >
              </template>
              <NoticeMessage variant="warning" class="mb-2">
                <b>Work in Progress:</b> We're part way through a slow migration
                from our own logging infrastructure to third-party solutions.
                This will include more detailed information to help diagnose
                problems - such as device type, screen size, browser, and a
                detailed trace of user actions. Please report bugs or usability
                issues to
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
                v-if="showSystemLogs"
                :key="'systemlogs-' + systemLogsBump"
              />
            </b-tab>
            <b-tab @click="onAIAssistantTab">
              <template #title>
                AI Support
                <b-badge
                  variant="danger"
                  class="ml-1"
                  style="font-size: 0.6em; vertical-align: super"
                  >WIP</b-badge
                >
              </template>
              <ModSupportAIAssistant
                v-if="showAIAssistant"
                :key="'aiassistant-' + aiAssistantBump"
              />
            </b-tab>
            <b-tab title="Email Stats" @click="onEmailStatsTab">
              <ModSupportEmailStats
                v-if="showEmailStats"
                :key="'emailstats-' + emailStatsBump"
              />
            </b-tab>
          </b-tabs>
        </b-tab>

        <!-- SPAM SECTION -->
        <b-tab @click="onSpamSection">
          <template #title>
            <h2 class="ml-2 mr-2">Spam</h2>
          </template>
          <b-tabs v-model="spamTab" content-class="mt-2" pills>
            <b-tab title="Worry Words" @click="onWorryWordsTab">
              <ModSupportWorryWords ref="worryWordsComponent" />
            </b-tab>
            <b-tab title="Spam Keywords" @click="onSpamKeywordsTab">
              <ModSupportSpamKeywords ref="spamKeywordsComponent" />
            </b-tab>
          </b-tabs>
        </b-tab>
      </b-tabs>
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
      showSystemLogs: false,
      systemLogsBump: 0,
      showAIAssistant: false,
      aiAssistantBump: 0,
      showEmailStats: false,
      emailStatsBump: 0,
      activeSection: 0,
      userTab: 0,
      communityTab: 0,
      systemTab: 0,
      spamTab: 0,
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
    this.chatStore.list = []
    this.messageStore.clear()

    // Handle section query parameter.
    const sectionParam = route.query.section
    if (sectionParam) {
      const sectionMap = { users: 0, communities: 1, system: 2, spam: 3 }
      if (sectionMap[sectionParam] !== undefined) {
        this.activeSection = sectionMap[sectionParam]
      }
    }

    // Handle tab query parameter within sections.
    const tabParam = route.query.tab
    if (tabParam) {
      if (tabParam === 'logs') {
        this.activeSection = 2
        this.systemTab = 0
        this.onSystemLogsTab()
      } else if (tabParam === 'ai') {
        this.activeSection = 2
        this.systemTab = 1
        this.onAIAssistantTab()
      } else if (tabParam === 'emailstats') {
        this.activeSection = 2
        this.systemTab = 2
        this.onEmailStatsTab()
      }
    }
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
          await this.searchById(term)
        } else if (term.substring(0, 1) === '#' && !isNaN(term.substring(1))) {
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

    onCommunitySection() {
      // Initialize first tab when section is selected.
      this.onFindCommunityTab()
    },

    onSystemSection() {
      // Initialize first tab when section is selected.
      this.onSystemLogsTab()
    },

    onSpamSection() {
      // Initialize first tab when section is selected.
      this.onWorryWordsTab()
    },

    async onFindCommunityTab() {
      if (this.$refs.findGroupComponent) {
        await this.$refs.findGroupComponent.loadCommunities()
      }
    },

    async onWorryWordsTab() {
      if (this.$refs.worryWordsComponent) {
        await this.$refs.worryWordsComponent.fetchWorryWords()
      }
    },

    async onSpamKeywordsTab() {
      if (this.$refs.spamKeywordsComponent) {
        await this.$refs.spamKeywordsComponent.fetchSpamKeywords()
      }
    },

    async onListCommunitiesTab() {
      if (this.$refs.listGroupsComponent) {
        await this.$refs.listGroupsComponent.fetchCommunities()
      }
    },

    onSystemLogsTab() {
      this.systemLogsBump = Date.now()
      this.showSystemLogs = true
      this.systemLogsStore.clear()
    },

    onAIAssistantTab() {
      this.aiAssistantBump = Date.now()
      this.showAIAssistant = true
    },

    onEmailStatsTab() {
      this.emailStatsBump = Date.now()
      this.showEmailStats = true
    },
  },
}
</script>
<style scoped>
.max {
  max-width: 300px;
}
</style>
