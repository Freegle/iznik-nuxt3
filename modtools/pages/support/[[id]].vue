<template>
  <div>
    <div v-if="supportOrAdmin">
      <div>
        <b-tabs v-model="activeTab" content-class="mt-3" card>
          <!-- User Tab -->
          <b-tab>
            <template #title>
              <h2 class="ml-2 mr-2">User</h2>
            </template>
            <ModSupportFindUser :id="id" />
          </b-tab>

          <!-- Community Tab with sub-tabs -->
          <b-tab @click="onCommunityTab">
            <template #title>
              <h2 class="ml-2 mr-2">Community</h2>
            </template>
            <div class="subtabs-wrapper">
              <b-tabs
                v-model="communitySubTab"
                content-class="mt-3"
                class="subtabs"
              >
                <b-tab @click="onFindCommunityTab">
                  <template #title>
                    <span class="subtab-title">Find</span>
                  </template>
                  <ModSupportFindGroup ref="findGroupComponent" />
                </b-tab>
                <b-tab @click="onListCommunitiesTab">
                  <template #title>
                    <span class="subtab-title">List</span>
                  </template>
                  <ModSupportListGroups ref="listGroupsComponent" />
                </b-tab>
                <b-tab>
                  <template #title>
                    <span class="subtab-title">Contact</span>
                  </template>
                  <ModSupportContactGroup />
                </b-tab>
                <b-tab>
                  <template #title>
                    <span class="subtab-title">Add</span>
                  </template>
                  <ModSupportAddGroup />
                </b-tab>
                <b-tab>
                  <template #title>
                    <span class="subtab-title">Check Volunteers</span>
                  </template>
                  <ModSupportCheckVolunteers />
                </b-tab>
              </b-tabs>
            </div>
          </b-tab>

          <!-- Message Tab -->
          <b-tab>
            <template #title>
              <h2 class="ml-2 mr-2">Message</h2>
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

          <!-- Logs Tab with sub-tabs -->
          <b-tab @click="onLogsTab">
            <template #title>
              <h2 class="ml-2 mr-2">
                Logs
                <b-badge
                  variant="danger"
                  class="ml-1"
                  style="font-size: 0.4em; vertical-align: super"
                  >WIP</b-badge
                >
              </h2>
            </template>
            <NoticeMessage variant="warning" class="mb-2">
              <b>Work in Progress:</b> We're part way through a slow migration
              from our own logging infrastructure to third-party solutions. This
              will include more detailed information to help diagnose problems -
              such as device type, screen size, browser, and a detailed trace of
              user actions. Please report bugs or usability issues to
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
            <div class="subtabs-wrapper">
              <b-tabs v-model="logsSubTab" content-class="mt-3" class="subtabs">
                <b-tab @click="onSystemLogsTab">
                  <template #title>
                    <span class="subtab-title">System Logs</span>
                  </template>
                  <ModSystemLogs
                    v-if="showSystemLogs"
                    :key="'systemlogs-' + systemLogsBump"
                  />
                </b-tab>
                <b-tab @click="onEmailStatsTab">
                  <template #title>
                    <span class="subtab-title">Outgoing Email</span>
                  </template>
                  <ModSupportEmailStats
                    v-if="showEmailStats"
                    :key="'emailstats-' + emailStatsBump"
                  />
                </b-tab>
                <b-tab @click="onIncomingEmailTab">
                  <template #title>
                    <span class="subtab-title">Incoming Email</span>
                  </template>
                  <ModSupportIncomingEmail
                    v-if="showIncomingEmail"
                    :key="'incomingemail-' + incomingEmailBump"
                  />
                </b-tab>
                <b-tab @click="onAIAssistantTab">
                  <template #title>
                    <span class="subtab-title">AI Support Helper</span>
                  </template>
                  <ModSupportAIAssistant
                    v-if="showAIAssistant"
                    :key="'aiassistant-' + aiAssistantBump"
                  />
                </b-tab>
              </b-tabs>
            </div>
          </b-tab>

          <!-- Spam Tab with sub-tabs -->
          <b-tab @click="onSpamTab">
            <template #title>
              <h2 class="ml-2 mr-2">Spam</h2>
            </template>
            <div class="subtabs-wrapper">
              <b-tabs v-model="spamSubTab" content-class="mt-3" class="subtabs">
                <b-tab @click="onWorryWordsTab">
                  <template #title>
                    <span class="subtab-title">Worry Words</span>
                  </template>
                  <ModSupportWorryWords ref="worryWordsComponent" />
                </b-tab>
                <b-tab @click="onSpamKeywordsTab">
                  <template #title>
                    <span class="subtab-title">Spam Keywords</span>
                  </template>
                  <ModSupportSpamKeywords ref="spamKeywordsComponent" />
                </b-tab>
              </b-tabs>
            </div>
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
      showSystemLogs: false,
      systemLogsBump: 0,
      showEmailStats: false,
      emailStatsBump: 0,
      showIncomingEmail: false,
      incomingEmailBump: 0,
      showAIAssistant: false,
      aiAssistantBump: 0,
      activeTab: 0,
      communitySubTab: 0,
      logsSubTab: 0,
      spamSubTab: 0,
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
  mounted() {
    // Handle tab query parameter after component is mounted.
    const route = useRoute()

    // Top-level tab mapping.
    const topTabMap = {
      user: 0,
      community: 1,
      message: 2,
      logs: 3,
      spam: 4,
    }

    // Sub-tab mappings.
    const communitySubTabMap = {
      find: 0,
      list: 1,
      contact: 2,
      add: 3,
      volunteers: 4,
    }

    const logsSubTabMap = {
      system: 0,
      email: 1,
      incoming: 2,
      ai: 3,
    }

    const spamSubTabMap = {
      worry: 0,
      keywords: 1,
    }

    const tabParam = route.query.tab
    const subTabParam = route.query.subtab

    if (tabParam && topTabMap[tabParam] !== undefined) {
      this.$nextTick(() => {
        this.activeTab = topTabMap[tabParam]

        // Handle sub-tabs.
        if (tabParam === 'community') {
          this.onCommunityTab()
          if (subTabParam && communitySubTabMap[subTabParam] !== undefined) {
            this.communitySubTab = communitySubTabMap[subTabParam]
            if (subTabParam === 'find') {
              this.onFindCommunityTab()
            } else if (subTabParam === 'list') {
              this.onListCommunitiesTab()
            }
          }
        } else if (tabParam === 'logs') {
          this.onLogsTab()
          if (subTabParam && logsSubTabMap[subTabParam] !== undefined) {
            this.logsSubTab = logsSubTabMap[subTabParam]
            if (subTabParam === 'system') {
              this.onSystemLogsTab()
            } else if (subTabParam === 'email') {
              this.onEmailStatsTab()
            } else if (subTabParam === 'incoming') {
              this.onIncomingEmailTab()
            } else if (subTabParam === 'ai') {
              this.onAIAssistantTab()
            }
          } else {
            // Default to system logs.
            this.onSystemLogsTab()
          }
        } else if (tabParam === 'spam') {
          this.onSpamTab()
          if (subTabParam && spamSubTabMap[subTabParam] !== undefined) {
            this.spamSubTab = spamSubTabMap[subTabParam]
            if (subTabParam === 'worry') {
              this.onWorryWordsTab()
            } else if (subTabParam === 'keywords') {
              this.onSpamKeywordsTab()
            }
          }
        }
      })
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

    onCommunityTab() {
      // Initialize community tab - load find communities by default.
      this.$nextTick(() => {
        this.onFindCommunityTab()
      })
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

    onLogsTab() {
      // Initialize logs tab - show system logs by default.
      this.$nextTick(() => {
        this.onSystemLogsTab()
      })
    },

    onSystemLogsTab() {
      // Initialize system logs when tab is clicked.
      this.systemLogsBump = Date.now()
      this.showSystemLogs = true
      this.systemLogsStore.clear()
    },

    onEmailStatsTab() {
      // Initialize email stats when tab is clicked.
      this.emailStatsBump = Date.now()
      this.showEmailStats = true
    },

    onIncomingEmailTab() {
      this.incomingEmailBump = Date.now()
      this.showIncomingEmail = true
    },

    onAIAssistantTab() {
      // Initialize AI assistant when tab is clicked.
      this.aiAssistantBump = Date.now()
      this.showAIAssistant = true
    },

    onSpamTab() {
      // Initialize spam tab - load worry words by default.
      this.$nextTick(() => {
        this.onWorryWordsTab()
      })
    },
  },
}
</script>
<style scoped>
.max {
  max-width: 300px;
}

/* Subtab container - visually distinct grouped panel */
:deep(.subtabs) {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  padding: 0.75rem;
  margin-bottom: 1rem;
}

/* Subtab navigation - segmented control style */
:deep(.subtabs .nav-tabs) {
  border: 1px solid #adb5bd !important;
  background-color: #e9ecef !important;
  padding: 3px !important;
  display: inline-flex !important;
  gap: 0 !important;
}

:deep(.subtabs .nav-item) {
  margin-bottom: 0 !important;
}

:deep(.subtabs .nav-link) {
  border: none !important;
  border-right: 1px solid #adb5bd !important;
  border-radius: 0 !important;
  padding: 0.5rem 1rem !important;
  color: #495057 !important;
  font-weight: 500 !important;
  background-color: transparent !important;
  transition: all 0.15s ease-in-out !important;
}

:deep(.subtabs .nav-item:last-child .nav-link) {
  border-right: none !important;
}

:deep(.subtabs .nav-link:hover) {
  color: #28a745 !important;
  background-color: rgba(255, 255, 255, 0.5) !important;
}

:deep(.subtabs .nav-link.active) {
  color: #fff !important;
  background-color: #28a745 !important;
  font-weight: 600 !important;
}

/* Subtab content area */
:deep(.subtabs .tab-content) {
  background-color: #fff;
  border: 1px solid #dee2e6;
  padding: 1rem;
  margin-top: 0.75rem;
}

.subtab-title {
  font-size: 0.9rem;
  letter-spacing: 0.01em;
}
</style>
