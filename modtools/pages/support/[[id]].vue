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

          <!-- Outgoing Email Tab -->
          <b-tab @click="onEmailStatsTab">
            <template #title>
              <h2 class="ml-2 mr-2">Outgoing Email</h2>
            </template>
            <ModSupportEmailStats
              v-if="showEmailStats"
              :key="'emailstats-' + emailStatsBump"
            />
          </b-tab>

          <!-- Incoming Email Tab -->
          <b-tab @click="onIncomingEmailTab">
            <template #title>
              <h2 class="ml-2 mr-2">Incoming Email</h2>
            </template>
            <ModSupportIncomingEmail
              v-if="showIncomingEmail"
              :key="'incomingemail-' + incomingEmailBump"
            />
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

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useChatStore } from '~/stores/chat'
import { useMessageStore } from '~/stores/message'
import { useSystemLogsStore } from '~/stores/systemlogs'
import { useMe } from '~/composables/useMe'

// Stores
const chatStore = useChatStore()
const messageStore = useMessageStore()
const systemLogsStore = useSystemLogsStore()

// Composables
const { supportOrAdmin } = useMe()

// Route
const route = useRoute()

// Template refs
const findGroupComponent = ref(null)
const listGroupsComponent = ref(null)
const worryWordsComponent = ref(null)
const spamKeywordsComponent = ref(null)

// Local state (formerly data())
const error = ref(false)
const messageTerm = ref(null)
const id = ref('id' in route.params ? parseInt(route.params.id) : 0)
const showSystemLogs = ref(false)
const systemLogsBump = ref(0)
const showEmailStats = ref(false)
const emailStatsBump = ref(0)
const showIncomingEmail = ref(false)
const incomingEmailBump = ref(0)
const showAIAssistant = ref(false)
const aiAssistantBump = ref(0)
const activeTab = ref(0)
const communitySubTab = ref(0)
const logsSubTab = ref(0)
const spamSubTab = ref(0)

// Tab name to index mapping
const topTabMap = {
  user: 0,
  community: 1,
  message: 2,
  outgoing: 3,
  incoming: 4,
  logs: 5,
  spam: 6,
}

const communitySubTabMap = {
  find: 0,
  list: 1,
  contact: 2,
  add: 3,
  volunteers: 4,
}

const logsSubTabMap = {
  system: 0,
  ai: 1,
}

const spamSubTabMap = {
  worry: 0,
  keywords: 1,
}

// Computed properties
const messages = computed(() => {
  return messageStore.all
})

// Initialize (formerly created hook)
chatStore.list = [] // chatStore.clear()
messageStore.clear()

// Lifecycle
onMounted(() => {
  // Handle tab query parameter after component is mounted.
  const tabParam = route.query.tab
  const subTabParam = route.query.subtab

  if (tabParam && topTabMap[tabParam] !== undefined) {
    nextTick(() => {
      activeTab.value = topTabMap[tabParam]

      // Handle sub-tabs.
      if (tabParam === 'community') {
        onCommunityTab()
        if (subTabParam && communitySubTabMap[subTabParam] !== undefined) {
          communitySubTab.value = communitySubTabMap[subTabParam]
          if (subTabParam === 'find') {
            onFindCommunityTab()
          } else if (subTabParam === 'list') {
            onListCommunitiesTab()
          }
        }
      } else if (tabParam === 'outgoing') {
        onEmailStatsTab()
      } else if (tabParam === 'incoming') {
        onIncomingEmailTab()
      } else if (tabParam === 'logs') {
        onLogsTab()
        if (subTabParam && logsSubTabMap[subTabParam] !== undefined) {
          logsSubTab.value = logsSubTabMap[subTabParam]
          if (subTabParam === 'system') {
            onSystemLogsTab()
          } else if (subTabParam === 'ai') {
            onAIAssistantTab()
          }
        } else {
          // Default to system logs.
          onSystemLogsTab()
        }
      } else if (tabParam === 'spam') {
        onSpamTab()
        if (subTabParam && spamSubTabMap[subTabParam] !== undefined) {
          spamSubTab.value = spamSubTabMap[subTabParam]
          if (subTabParam === 'worry') {
            onWorryWordsTab()
          } else if (subTabParam === 'keywords') {
            onSpamKeywordsTab()
          }
        }
      }
    })
  }
})

// Methods
function changedMessageTerm(term) {
  messageTerm.value = term.trim()
}

async function searchedMessage() {
  const term = messageTerm.value
  await messageStore.clearContext()
  await messageStore.clear()

  if (term) {
    if (!isNaN(term)) {
      // This is a raw message id
      await searchById(term)
    } else if (term.substring(0, 1) === '#' && !isNaN(term.substring(1))) {
      // This is a #id
      await searchById(term.substring(1))
    } else {
      await searchBySubject(term)
    }
  }
}

async function searchById(msgId) {
  error.value = false

  try {
    const message = await messageStore.fetchMT({
      id: msgId,
      messagehistory: true,
    })
    if (message) messageStore.list[msgId] = message
  } catch (e) {
    console.log("Couldn't fetch", e)
    error.value = true
  }
}

async function searchBySubject(subj) {
  error.value = false
  await messageStore.searchMT({ term: subj, groupid: undefined })
}

function onCommunityTab() {
  // Initialize community tab - load find communities by default.
  nextTick(() => {
    onFindCommunityTab()
  })
}

async function onFindCommunityTab() {
  // Load communities when tab is selected
  if (findGroupComponent.value) {
    await findGroupComponent.value.loadCommunities()
  }
}

async function onWorryWordsTab() {
  // Fetch worry words when tab is selected
  if (worryWordsComponent.value) {
    await worryWordsComponent.value.fetchWorryWords()
  }
}

async function onSpamKeywordsTab() {
  // Fetch spam keywords when tab is selected
  if (spamKeywordsComponent.value) {
    await spamKeywordsComponent.value.fetchSpamKeywords()
  }
}

async function onListCommunitiesTab() {
  // Fetch communities when tab is selected
  if (listGroupsComponent.value) {
    await listGroupsComponent.value.fetchCommunities()
  }
}

function onLogsTab() {
  // Initialize logs tab - show system logs by default.
  nextTick(() => {
    onSystemLogsTab()
  })
}

function onSystemLogsTab() {
  // Initialize system logs when tab is clicked.
  systemLogsBump.value = Date.now()
  showSystemLogs.value = true
  systemLogsStore.clear()
}

function onEmailStatsTab() {
  // Initialize email stats when tab is clicked.
  emailStatsBump.value = Date.now()
  showEmailStats.value = true
}

function onIncomingEmailTab() {
  incomingEmailBump.value = Date.now()
  showIncomingEmail.value = true
}

function onAIAssistantTab() {
  // Initialize AI assistant when tab is clicked.
  aiAssistantBump.value = Date.now()
  showAIAssistant.value = true
}

function onSpamTab() {
  // Initialize spam tab - load worry words by default.
  nextTick(() => {
    onWorryWordsTab()
  })
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
