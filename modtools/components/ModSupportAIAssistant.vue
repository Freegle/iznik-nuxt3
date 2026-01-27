<template>
  <div class="log-analysis-container">
    <!-- Privacy Notice Modal -->
    <b-modal
      v-model="showPrivacyModal"
      title="Privacy Notice"
      ok-only
      ok-title="I Understand"
      centered
    >
      <p>
        This tool uses AI to help investigate user issues by analyzing logs.
      </p>
      <p><strong>Privacy protection measures:</strong></p>
      <ul>
        <li>
          <strong>All PII is pseudonymized</strong> before reaching the AI
          service.
        </li>
        <li>
          <strong>Email addresses, IPs, phone numbers</strong> are replaced with
          random tokens (e.g., user_abc123@gmail.com).
        </li>
        <li>
          <strong>You see real values</strong> - tokens are replaced back to
          real values in your browser only.
        </li>
        <li>
          <strong>Claude/Anthropic never sees</strong> the real email, IP, or
          other PII - only meaningless tokens.
        </li>
      </ul>
      <p class="small text-muted mt-2">
        This system complies with ICO guidance on pseudonymization - the tokens
        are meaningless without the key, which never leaves Freegle's servers.
      </p>
    </b-modal>

    <!-- PII Warning Modal -->
    <b-modal
      v-model="showPiiWarning"
      title="Personal Data Detected"
      centered
      @ok="confirmPiiQuery"
      @cancel="cancelPiiQuery"
    >
      <p>The following personal data was detected in your query:</p>
      <ul>
        <li v-for="(pii, idx) in detectedPii" :key="idx">
          <strong>{{ pii.type }}:</strong> {{ pii.value }}
          <span v-if="pii.source === 'selected_user'" class="text-muted">
            (selected user)
          </span>
        </li>
      </ul>
      <p>
        This data will be <strong>pseudonymized</strong> before processing. The
        AI service will only see random tokens, not the actual values.
      </p>
      <p>Do you want to proceed?</p>
    </b-modal>

    <!-- Privacy Review Modal (shown when privacyReviewMode is enabled) -->
    <b-modal
      v-model="showPrivacyReview"
      title="Privacy Review"
      size="lg"
      centered
      ok-title="Approve & Send to AI"
      cancel-title="Cancel"
      @ok="approvePrivacyReview"
      @cancel="cancelPrivacyReview"
    >
      <p class="text-info">
        <strong>Privacy Review Mode:</strong> Please verify that all personal
        data has been properly pseudonymized before sending to the AI.
      </p>

      <div class="privacy-review-section mb-3">
        <h6>Your Original Query:</h6>
        <div class="privacy-review-box original">
          {{ pendingPrivacyReview?.originalQuery }}
        </div>
      </div>

      <div class="privacy-review-section mb-3">
        <h6>Pseudonymized Query (what the AI will see):</h6>
        <div class="privacy-review-box pseudonymized">
          {{ pendingPrivacyReview?.pseudonymizedQuery }}
        </div>
      </div>

      <div
        v-if="
          pendingPrivacyReview?.mapping &&
          Object.keys(pendingPrivacyReview.mapping).length > 0
        "
        class="privacy-review-section mb-3"
      >
        <h6>Pseudonymized Values:</h6>
        <table class="table table-sm table-bordered">
          <thead>
            <tr>
              <th>Pseudonymized (sent to AI)</th>
              <th>Real Value (kept private)</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(value, token) in pendingPrivacyReview.mapping"
              :key="token"
            >
              <td>
                <code class="text-danger">{{ token }}</code>
              </td>
              <td>{{ value }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="alert alert-warning">
        <strong>Check:</strong> Does the pseudonymized query contain any real
        email addresses, names, phone numbers, or other personal data? If so,
        click Cancel and report the issue.
      </div>
    </b-modal>

    <!-- MCP Query Approval Modal -->
    <b-modal
      v-model="showMcpQueryApproval"
      title="Log Query Approval"
      size="lg"
      centered
      ok-title="Approve Query"
      cancel-title="Reject"
      @ok="approveMcpQuery"
      @cancel="rejectMcpQuery"
    >
      <p class="text-info">
        <strong>Privacy Review:</strong> The AI wants to query the log system.
        Please review and approve the query before it executes.
      </p>

      <div class="privacy-review-section mb-3">
        <h6>Log Query:</h6>
        <div class="privacy-review-box pseudonymized">
          <code>{{ pendingMcpQuery?.query }}</code>
        </div>
      </div>

      <div class="d-flex gap-3 mb-3">
        <div><strong>Time Range:</strong> {{ pendingMcpQuery?.timeRange }}</div>
        <div><strong>Limit:</strong> {{ pendingMcpQuery?.limit }} results</div>
      </div>

      <div class="alert alert-info">
        <strong>Note:</strong> All log results will be pseudonymized (emails,
        IPs replaced with tokens). You will review the results before they are
        sent to the AI.
      </div>
    </b-modal>

    <!-- MCP Results Approval Modal -->
    <b-modal
      v-model="showMcpResultsApproval"
      title="Log Results Approval"
      size="xl"
      centered
      ok-title="Send to AI"
      cancel-title="Reject"
      @ok="approveMcpResults"
      @cancel="rejectMcpResults"
    >
      <p class="text-info">
        <strong>Privacy Review:</strong> Review the log results before they are
        sent to the AI. Check that no unexpected personal data is visible.
      </p>

      <div class="mb-2">
        <strong>Results:</strong> {{ pendingMcpResults?.resultCount }} log
        entries from {{ pendingMcpResults?.streamCount }} streams
      </div>

      <div class="mcp-results-preview">
        <div
          v-for="(stream, idx) in pendingMcpResults?.results || []"
          :key="idx"
          class="result-stream mb-2"
        >
          <div class="stream-labels small text-muted">
            {{ formatStreamLabels(stream.stream) }}
          </div>
          <div
            v-for="(entry, entryIdx) in stream.values?.slice(0, 10) || []"
            :key="entryIdx"
            class="log-entry"
          >
            <span class="timestamp">{{ formatLogTimestamp(entry[0]) }}</span>
            <span class="log-line">{{ entry[1] }}</span>
          </div>
          <div v-if="stream.values?.length > 10" class="text-muted small mt-1">
            ... and {{ stream.values.length - 10 }} more entries
          </div>
        </div>
      </div>

      <div class="alert alert-warning mt-3">
        <strong>Check:</strong> Do these results contain any unexpected personal
        data that wasn't properly pseudonymized? If so, click Reject.
      </div>
    </b-modal>

    <!-- DB Query Approval Modal -->
    <b-modal
      v-model="showDbQueryApproval"
      title="Database Query Approval"
      size="lg"
      centered
      ok-title="Approve Query"
      cancel-title="Reject"
      @ok="approveDbQuery"
      @cancel="rejectDbQuery"
    >
      <p class="text-info">
        <strong>Privacy Review:</strong> The AI wants to query the database.
        Please review the SQL query before it executes.
      </p>

      <div class="privacy-review-section mb-3">
        <h6>SQL Query:</h6>
        <div class="privacy-review-box pseudonymized">
          <code>{{ pendingDbQuery?.query }}</code>
        </div>
      </div>

      <div class="d-flex gap-3 mb-3">
        <div>
          <strong>Tables:</strong> {{ pendingDbQuery?.tables?.join(', ') }}
        </div>
        <div><strong>Limit:</strong> {{ pendingDbQuery?.limit }} rows</div>
      </div>

      <div v-if="pendingDbQuery?.columns?.length > 0" class="mb-3">
        <strong>Columns accessed: </strong>
        <small class="text-muted">{{
          pendingDbQuery?.columns?.join(', ')
        }}</small>
      </div>

      <div class="alert alert-info">
        <strong>Note:</strong> Sensitive columns (names, emails) will be
        pseudonymized in the results. You will review the results before they
        are sent to the AI.
      </div>
    </b-modal>

    <!-- DB Results Approval Modal -->
    <b-modal
      v-model="showDbResultsApproval"
      title="Database Results Approval"
      size="xl"
      centered
      ok-title="Send to AI"
      cancel-title="Reject"
      @ok="approveDbResults"
      @cancel="rejectDbResults"
    >
      <p class="text-info">
        <strong>Privacy Review:</strong> Review the database results before they
        are sent to the AI. Check that no unexpected personal data is visible.
      </p>

      <div class="mb-2">
        <strong>Results:</strong> {{ pendingDbResults?.rowCount }} rows,
        {{ pendingDbResults?.tokenCount }} values pseudonymized
      </div>

      <div class="db-results-preview">
        <table class="table table-sm table-bordered">
          <thead>
            <tr>
              <th v-for="col in pendingDbResults?.columns" :key="col">
                {{ col }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, idx) in (pendingDbResults?.rows || []).slice(0, 20)"
              :key="idx"
            >
              <td v-for="col in pendingDbResults?.columns" :key="col">
                {{ row[col] }}
              </td>
            </tr>
          </tbody>
        </table>
        <div
          v-if="(pendingDbResults?.rows || []).length > 20"
          class="text-muted small"
        >
          ... and {{ pendingDbResults.rows.length - 20 }} more rows
        </div>
      </div>

      <div class="alert alert-warning mt-3">
        <strong>Check:</strong> Do these results contain any unexpected personal
        data that wasn't properly pseudonymized? If so, click Reject.
      </div>
    </b-modal>

    <!-- Header -->
    <div class="log-analysis-header">
      <div class="d-flex align-items-center justify-content-between">
        <div>
          <strong>AI Support Helper</strong>
          <span v-if="!sanitizerAvailable" class="text-danger ml-2">
            (Service unavailable)
          </span>
          <span v-if="totalCost > 0" class="session-cost ml-2">
            Session: ${{ totalCost.toFixed(4) }}
          </span>
        </div>
        <div class="d-flex align-items-center gap-2">
          <b-form-checkbox
            v-model="privacyReviewMode"
            switch
            size="sm"
            class="mr-3"
          >
            <small>Privacy Review</small>
          </b-form-checkbox>
          <b-form-checkbox
            v-model="showAnonymisedData"
            switch
            size="sm"
            class="mr-3"
          >
            <small>{{
              showAnonymisedData ? 'Show PII' : 'Show Anonymised'
            }}</small>
          </b-form-checkbox>
          <b-form-checkbox v-model="debugMode" switch size="sm" class="mr-3">
            <small>Debug</small>
          </b-form-checkbox>
          <b-button
            variant="link"
            size="sm"
            class="p-0"
            @click="showPrivacyModal = true"
          >
            <span class="text-info">&#9432;</span> Privacy
          </b-button>
        </div>
      </div>
    </div>

    <!-- Step 1: User Selection -->
    <div
      v-if="!selectedUser && !skippedUserSelection"
      class="log-analysis-step p-3"
    >
      <h6>Step 1: Select a user to investigate</h6>
      <p class="text-muted small mb-2">
        Focus on a specific user for better results, or skip for general
        queries.
      </p>
      <b-input-group class="mb-2">
        <b-form-input
          v-model="userSearch"
          placeholder="Search by email, name, or user ID"
          :disabled="searchingUser"
          autocapitalize="none"
          autocomplete="off"
          @keyup.enter.exact="searchUsers"
        />
        <b-button
          variant="primary"
          :disabled="searchingUser"
          @click="searchUsers"
        >
          <v-icon v-if="searchingUser" icon="sync" class="fa-spin" />
          <v-icon v-else icon="search" /> Search
        </b-button>
        <b-button
          variant="secondary"
          :disabled="searchingUser"
          @click="skipUserSelection"
        >
          Skip
        </b-button>
      </b-input-group>

      <div v-if="searchResults.length > 0" class="user-results mt-2">
        <div
          v-for="user in searchResults"
          :key="user.id"
          class="user-result-item p-2"
          @click="selectUser(user)"
        >
          <div class="d-flex align-items-center">
            <div class="flex-grow-1">
              <strong>{{ user.displayname || 'No name' }}</strong>
              <span class="text-muted ml-2">{{ user.email }}</span>
              <br />
              <small class="text-muted">
                ID: {{ user.id }}
                <span v-if="user.lastaccess">
                  | Last active: {{ formatDate(user.lastaccess) }}
                </span>
              </small>
            </div>
            <v-icon icon="chevron-right" />
          </div>
        </div>
      </div>

      <NoticeMessage v-if="noResults" class="mt-2">
        No users found matching "{{ userSearch }}".
      </NoticeMessage>
    </div>

    <!-- User selected or skipped: show either initial query or chat -->
    <template v-else>
      <!-- User banner (always visible when user selected) -->
      <div class="selected-user-banner p-2 bg-light d-flex align-items-center">
        <div v-if="selectedUser" class="flex-grow-1">
          <strong>{{ selectedUser.displayname || 'User' }}</strong>
          <span class="text-muted ml-2">{{ selectedUser.email }}</span>
          <small class="text-muted ml-2">(ID: {{ selectedUser.id }})</small>
          <span v-if="selectedUser.lastaccess" class="text-muted ml-2">
            | Last active: {{ formatDate(selectedUser.lastaccess) }}
          </span>
        </div>
        <div v-else class="flex-grow-1">
          <strong class="text-secondary">General Query</strong>
          <span class="text-muted ml-2">(no specific user selected)</span>
        </div>
        <b-button variant="outline-primary" size="sm" @click="newChat">
          New Chat
        </b-button>
      </div>

      <!-- Initial query (before conversation starts) -->
      <div v-if="messages.length === 0" class="log-analysis-step p-3">
        <h6>What would you like to investigate?</h6>
        <b-form @submit.prevent="submitQuery">
          <b-form-textarea
            v-model="query"
            rows="3"
            max-rows="6"
            placeholder="e.g., 'Why are they getting errors?' or 'Show their recent login activity'"
            :disabled="isProcessing"
            @keydown.enter.exact.prevent="submitQuery"
          />
          <div class="d-flex justify-content-between align-items-center mt-2">
            <small v-if="query" class="text-muted">
              Press Enter to submit, Shift+Enter for new line
            </small>
            <b-button
              type="submit"
              variant="primary"
              :disabled="!query.trim() || isProcessing"
            >
              <b-spinner v-if="isProcessing" small />
              <span v-else>Analyze</span>
            </b-button>
          </div>
        </b-form>
      </div>

      <!-- Chat interface (after conversation starts) -->
      <template v-else>
        <!-- Debug Panel -->
        <div v-if="debugMode && debugLog.length > 0" class="debug-panel p-3">
          <h6 class="d-flex align-items-center justify-content-between">
            <span>Debug: Data Flow</span>
            <b-button variant="link" size="sm" @click="debugLog = []"
              >Clear</b-button
            >
          </h6>
          <div class="debug-entries">
            <div
              v-for="(entry, idx) in debugLog"
              :key="idx"
              class="debug-entry mb-2 p-2"
              :class="'debug-' + entry.type"
            >
              <div class="debug-header d-flex justify-content-between">
                <strong>{{ entry.label }}</strong>
                <small class="text-muted">{{ entry.timestamp }}</small>
              </div>
              <div v-if="entry.tokenMapping" class="token-mapping mt-1">
                <small class="text-muted">Tokens created:</small>
                <div
                  v-for="(value, token) in entry.tokenMapping"
                  :key="token"
                  class="token-item"
                >
                  <code class="token">{{ token }}</code>
                  <span class="mx-1">&rarr;</span>
                  <span class="real-value">{{ value }}</span>
                </div>
              </div>
              <pre v-if="entry.data" class="debug-data mt-1 mb-0">{{
                formatDebugData(entry.data)
              }}</pre>
            </div>
          </div>
        </div>

        <!-- Chat messages -->
        <div ref="messagesContainer" class="log-analysis-messages p-3">
          <div
            v-for="(msg, idx) in messages"
            :key="idx"
            class="message-item mb-3"
            :class="{
              'message-user': msg.role === 'user',
              'message-assistant': msg.role === 'assistant',
            }"
          >
            <div class="message-header small text-muted mb-1">
              {{ msg.role === 'user' ? 'You' : 'AI Assistant' }}
            </div>
            <div class="message-content" v-html="formatMessageContent(msg)" />
            <div
              v-if="msg.role === 'assistant' && msg.costUsd"
              class="message-cost"
            >
              Cost: ${{ msg.costUsd.toFixed(4) }}
            </div>
          </div>

          <!-- Processing indicator -->
          <div v-if="isProcessing" class="message-item message-assistant mb-3">
            <div class="message-header small text-muted mb-1">AI Assistant</div>
            <div class="message-content">
              <div class="d-flex align-items-center">
                <b-spinner small class="mr-2" />
                <span>{{ processingStatus }}</span>
              </div>
              <b-button
                variant="outline-danger"
                size="sm"
                class="mt-2"
                @click="cancelQuery"
              >
                Cancel
              </b-button>
            </div>
          </div>
        </div>

        <!-- Follow-up input -->
        <div class="chat-input-area p-3">
          <b-form class="d-flex gap-2" @submit.prevent="submitQuery">
            <b-form-input
              v-model="query"
              placeholder="Ask a follow-up question..."
              :disabled="isProcessing"
              class="flex-grow-1"
              @keydown.enter.exact.prevent="submitQuery"
            />
            <b-button
              type="submit"
              variant="primary"
              :disabled="!query.trim() || isProcessing"
            >
              <b-spinner v-if="isProcessing" small />
              <span v-else>Send</span>
            </b-button>
          </b-form>
        </div>
      </template>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { marked } from 'marked'
import { useUserStore } from '~/stores/user'

// Query sanitizer service - frontend talks to this for PII handling
const SANITIZER_URL = 'http://mcp-sanitizer.localhost'

// AI support helper for Claude integration (same as existing AI assistant)
const AI_SUPPORT_URL = 'http://ai-support-helper.localhost'

// UI state
const showPrivacyModal = ref(false)
const showPiiWarning = ref(false)
const showPrivacyReview = ref(false)
const sanitizerAvailable = ref(true)
const showAnonymisedData = ref(false)
const debugMode = ref(false)
const privacyReviewMode = ref(true) // Default on for privacy verification
const pendingPrivacyReview = ref(null)

// User search
const userSearch = ref('')
const searchingUser = ref(false)
const searchResults = ref([])
const noResults = ref(false)
const selectedUser = ref(null)
const skippedUserSelection = ref(false)

// Query input
const query = ref('')
const detectedPii = ref([])
const pendingQuery = ref(null)

// Processing
const isProcessing = ref(false)
const processingStatus = ref('Analyzing...')
const currentSessionId = ref(null)
const claudeSessionId = ref(null) // For Claude Code conversation continuity
const localMapping = ref({})

// Conversation with raw data for debug
const messages = ref([])
const debugLog = ref([])

// MCP query approval state
const showMcpQueryApproval = ref(false)
const showMcpResultsApproval = ref(false)
const pendingMcpQuery = ref(null)
const pendingMcpResults = ref(null)
const mcpPollInterval = ref(null)

// DB query approval state
const showDbQueryApproval = ref(false)
const showDbResultsApproval = ref(false)
const pendingDbQuery = ref(null)
const pendingDbResults = ref(null)

// Template refs
const messagesContainer = ref(null)

const totalCost = computed(() => {
  return messages.value
    .filter((m) => m.role === 'assistant' && m.costUsd)
    .reduce((sum, m) => sum + m.costUsd, 0)
})

onMounted(async () => {
  await checkSanitizerAvailability()
})

onBeforeUnmount(() => {
  stopMcpPolling()
})
async function checkSanitizerAvailability() {
  try {
    const response = await fetch(`${SANITIZER_URL}/health`)
    sanitizerAvailable.value = response.ok
  } catch {
    sanitizerAvailable.value = false
  }
}

async function searchUsers() {
  if (!userSearch.value.trim()) return

  searchingUser.value = true
  searchResults.value = []
  noResults.value = false

  try {
    const userStore = useUserStore()
    userStore.clear()

    await userStore.fetchMT({
      search: userSearch.value.trim(),
      emailhistory: true,
    })

    // Get results and sort by last access
    searchResults.value = Object.values(userStore.list)
      .sort((a, b) => {
        return (
          new Date(b.lastaccess).getTime() - new Date(a.lastaccess).getTime()
        )
      })
      .slice(0, 10) // Limit to 10 results

    // Auto-select if only one result
    if (searchResults.value.length === 1) {
      selectUser(searchResults.value[0])
      return
    }

    noResults.value = searchResults.value.length === 0
  } catch (error) {
    console.error('User search error:', error)
    noResults.value = true
  } finally {
    searchingUser.value = false
  }
}

function selectUser(user) {
  selectedUser.value = user
  searchResults.value = []
  userSearch.value = ''
  // Focus the query input after Vue updates the DOM
  nextTick(() => {
    const textarea = document.querySelector('.log-analysis-container textarea')
    if (textarea) {
      textarea.focus()
    }
  })
}

function newChat() {
  // Start a fresh conversation - clears user and all state
  selectedUser.value = null
  skippedUserSelection.value = false
  messages.value = []
  query.value = ''
  currentSessionId.value = null
  claudeSessionId.value = null
  localMapping.value = {}
  debugLog.value = []
  searchResults.value = []
  userSearch.value = ''
  // Clear any pending approval states
  showMcpQueryApproval.value = false
  showMcpResultsApproval.value = false
  pendingMcpQuery.value = null
  pendingMcpResults.value = null
  showDbQueryApproval.value = false
  showDbResultsApproval.value = false
  pendingDbQuery.value = null
  pendingDbResults.value = null
}

function scrollToBottom() {
  nextTick(() => {
    const container = messagesContainer.value
    if (container) {
      container.scrollTop = container.scrollHeight
    }
  })
}

function skipUserSelection() {
  skippedUserSelection.value = true
  searchResults.value = []
  userSearch.value = ''
  // Focus the query input after Vue updates the DOM
  nextTick(() => {
    const textarea = document.querySelector('.log-analysis-container textarea')
    if (textarea) {
      textarea.focus()
    }
  })
}

function addDebugEntry(type, label, data, tokenMapping = null) {
  if (debugMode.value) {
    debugLog.value.push({
      type,
      label,
      data,
      tokenMapping,
      timestamp: new Date().toLocaleTimeString(),
    })
  }
}

async function submitQuery() {
  if (!query.value.trim() || isProcessing.value) return
  if (!selectedUser.value && !skippedUserSelection.value) return

  // First, scan for PII
  try {
    const scanPayload = {
      query: query.value,
      knownPii: selectedUser.value
        ? {
            email: selectedUser.value.email,
            displayname: selectedUser.value.displayname,
            userid: selectedUser.value.id,
          }
        : {},
    }

    addDebugEntry('request', 'PII Scan Request', scanPayload)

    const response = await fetch(`${SANITIZER_URL}/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scanPayload),
    })

    if (response.ok) {
      const scanResult = await response.json()
      addDebugEntry('response', 'PII Scan Response', scanResult)

      if (scanResult.containsEmailTrail) {
        alert(
          'Your query appears to contain copy-pasted email content. Please describe the issue in your own words to protect user privacy.'
        )
        return
      }

      if (scanResult.detectedPii && scanResult.detectedPii.length > 0) {
        detectedPii.value = scanResult.detectedPii
        pendingQuery.value = query.value
        showPiiWarning.value = true
        return
      }
    }
  } catch (error) {
    console.error('PII scan error:', error)
    addDebugEntry('error', 'PII Scan Error', {
      message: error.message,
    })
  }

  await executeQuery(query.value)
}

function confirmPiiQuery() {
  if (pendingQuery.value) {
    executeQuery(pendingQuery.value)
    pendingQuery.value = null
  }
  showPiiWarning.value = false
}

function cancelPiiQuery() {
  pendingQuery.value = null
  showPiiWarning.value = false
}

async function approvePrivacyReview() {
  if (pendingPrivacyReview.value) {
    const { originalQuery, pseudonymizedQuery } = pendingPrivacyReview.value
    pendingPrivacyReview.value = null
    showPrivacyReview.value = false
    await proceedWithQuery(originalQuery, pseudonymizedQuery)
  }
}

function cancelPrivacyReview() {
  pendingPrivacyReview.value = null
  showPrivacyReview.value = false
  query.value = ''
}

async function executeQuery(queryText) {
  isProcessing.value = true
  processingStatus.value = 'Sanitizing query...'

  try {
    // Step 1: Sanitize the query
    const sanitizePayload = {
      query: queryText,
      knownPii: selectedUser.value
        ? {
            email: selectedUser.value.email,
            displayname: selectedUser.value.displayname,
            userid: selectedUser.value.id,
            postcode: selectedUser.value.postcode,
            location: selectedUser.value.location,
          }
        : {},
      userId: selectedUser.value?.id || 0,
    }

    addDebugEntry('request', 'Sanitize Request', sanitizePayload)

    const sanitizeResponse = await fetch(`${SANITIZER_URL}/sanitize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sanitizePayload),
    })

    if (!sanitizeResponse.ok) {
      const error = await sanitizeResponse.json()
      throw new Error(error.message || 'Failed to sanitize query')
    }

    const sanitizeResult = await sanitizeResponse.json()
    const {
      pseudonymizedQuery,
      sessionId,
      localMapping: newMapping,
    } = sanitizeResult

    addDebugEntry(
      'response',
      'Sanitize Response',
      { pseudonymizedQuery, sessionId },
      newMapping
    )

    currentSessionId.value = sessionId
    localMapping.value = { ...localMapping.value, ...newMapping }

    // If privacy review mode is enabled, show review modal and wait for approval
    if (privacyReviewMode.value) {
      pendingPrivacyReview.value = {
        originalQuery: queryText,
        pseudonymizedQuery,
        mapping: newMapping,
        sessionId,
      }
      isProcessing.value = false
      showPrivacyReview.value = true
      return
    }

    // Otherwise proceed directly
    await proceedWithQuery(queryText, pseudonymizedQuery)
  } catch (error) {
    console.error('Query error:', error)
    addDebugEntry('error', 'Query Error', { message: error.message })
    messages.value.push({
      role: 'assistant',
      content: `Error: ${error.message}`,
      rawContent: `Error: ${error.message}`,
    })
    scrollToBottom()
  } finally {
    isProcessing.value = false
  }
}

async function proceedWithQuery(queryText, pseudonymizedQuery) {
  isProcessing.value = true

  // Start polling for MCP approval requests if privacy review mode is on
  if (privacyReviewMode.value) {
    startMcpPolling()
  }

  try {
    // Add user message to conversation (store both raw and display versions)
    messages.value.push({
      role: 'user',
      content: queryText,
      rawContent: queryText,
    })
    scrollToBottom()

    processingStatus.value = 'Analyzing...'

    // Send pseudonymized query to Claude Code for log analysis
    const logResult = await queryLogsForUser(pseudonymizedQuery)

    addDebugEntry('response', 'Log Analysis Response (raw)', {
      analysis:
        logResult.analysis.substring(0, 500) +
        (logResult.analysis.length > 500 ? '...' : ''),
      costUsd: logResult.costUsd,
    })

    // Step 3: Store both raw and de-tokenized versions with cost
    const deTokenizedResponse = deTokenize(logResult.analysis)

    messages.value.push({
      role: 'assistant',
      content: deTokenizedResponse,
      rawContent: logResult.analysis,
      mapping: { ...localMapping.value },
      costUsd: logResult.costUsd,
      usage: logResult.usage,
    })
    scrollToBottom()

    query.value = ''
  } catch (error) {
    console.error('Query error:', error)
    addDebugEntry('error', 'Query Error', { message: error.message })
    messages.value.push({
      role: 'assistant',
      content: `Error: ${error.message}`,
      rawContent: `Error: ${error.message}`,
    })
    scrollToBottom()
  } finally {
    stopMcpPolling()
    isProcessing.value = false
  }
}

async function queryLogsForUser(userQuery) {
  try {
    const requestBody = {
      query: userQuery,
      userId: selectedUser.value?.id || 0,
    }

    // Include Claude session ID for conversation continuity
    if (claudeSessionId.value) {
      requestBody.claudeSessionId = claudeSessionId.value
    }

    addDebugEntry('request', 'Claude Code Request', requestBody)

    const response = await fetch(`${AI_SUPPORT_URL}/api/log-analysis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      if (response.status === 404) {
        return `**Log Analysis Service**\n\nThe AI-powered log analysis service is being set up.`
      }
      const errorData = await response.json().catch(() => ({}))
      // Handle expired session gracefully - clear it and inform user
      if (response.status === 410 || errorData.error === 'SESSION_EXPIRED') {
        claudeSessionId.value = null
        return {
          analysis:
            '**Session Expired**\n\nYour previous conversation has expired. Please ask your question again to start a new session.',
          costUsd: null,
        }
      }
      throw new Error(errorData.message || 'Failed to query logs')
    }

    const data = await response.json()

    // Save Claude session ID for conversation continuity
    if (data.claudeSessionId) {
      claudeSessionId.value = data.claudeSessionId
      addDebugEntry('response', 'Claude Code Response', {
        claudeSessionId: data.claudeSessionId,
        isNewSession: data.isNewSession,
        analysisLength: data.analysis?.length || 0,
        costUsd: data.costUsd,
        usage: data.usage,
      })
    }

    // Return analysis and cost info
    return {
      analysis: data.analysis || 'No analysis available.',
      costUsd: data.costUsd,
      usage: data.usage,
    }
  } catch (error) {
    if (error.message.includes('fetch')) {
      const userInfo = selectedUser.value
        ? `\n\nUser ID for manual search: **${selectedUser.value.id}**`
        : ''
      return {
        analysis: `**Log Analysis Service**\n\nThe AI log analysis service is not currently running.${userInfo}`,
        costUsd: null,
      }
    }
    return {
      analysis: `Unable to query logs: ${error.message}`,
      costUsd: null,
    }
  }
}

function deTokenize(text) {
  if (!text || !localMapping.value) return text

  let result = text
  for (const [token, realValue] of Object.entries(localMapping.value)) {
    result = result.split(token).join(realValue)
  }
  return result
}

function highlightPii(text, mapping, showTokens) {
  if (!text || !mapping) return text

  let result = text
  for (const [token, realValue] of Object.entries(mapping)) {
    // Always highlight PII in red - show either token or real value based on toggle
    const displayValue = showTokens ? token : realValue
    const highlightHtml = `<span class="pii-highlight" title="Anonymised: ${token} = ${realValue}">${displayValue}</span>`

    // Replace both token and real value with highlighted version
    result = result.split(token).join(highlightHtml)
    if (!showTokens) {
      // When showing real values, also replace any remaining tokens
      result = result.split(realValue).join(highlightHtml)
    }
  }
  return result
}

function formatMessageContent(msg) {
  if (!msg.content) return ''

  // Start with the de-tokenized content, then re-highlight based on toggle
  let html = marked(msg.content)

  // Always highlight PII - toggle controls whether we show token or real value
  if (msg.mapping && Object.keys(msg.mapping).length > 0) {
    html = highlightPii(html, msg.mapping, showAnonymisedData.value)
  }

  return html
}

function formatDebugData(data) {
  if (typeof data === 'string') return data
  return JSON.stringify(data, null, 2)
}

function cancelQuery() {
  isProcessing.value = false
  processingStatus.value = ''
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
}

// MCP Query Approval Methods
function startMcpPolling() {
  if (mcpPollInterval.value) return // Already polling

  mcpPollInterval.value = setInterval(async () => {
    await pollPendingMcpQueries()
  }, 2000) // Poll every 2 seconds
}

function stopMcpPolling() {
  if (mcpPollInterval.value) {
    clearInterval(mcpPollInterval.value)
    mcpPollInterval.value = null
  }
}

async function pollPendingMcpQueries() {
  if (!isProcessing.value || !privacyReviewMode.value) return

  try {
    const response = await fetch('http://status.localhost/api/mcp/pending')
    if (!response.ok) return

    const data = await response.json()
    const queries = data.queries || []

    // Check for pending log query approval
    const pendingLogQuery = queries.find(
      (q) => q.status === 'pending_query' && q.type === 'log'
    )
    if (pendingLogQuery && !showMcpQueryApproval.value) {
      pendingMcpQuery.value = pendingLogQuery
      showMcpQueryApproval.value = true
    }

    // Check for pending log results approval
    const pendingLogResults = queries.find(
      (q) => q.status === 'pending_results' && q.type === 'log'
    )
    if (pendingLogResults && !showMcpResultsApproval.value) {
      pendingMcpResults.value = {
        ...pendingLogResults,
        resultCount:
          pendingLogResults.results?.data?.result?.reduce(
            (sum, s) => sum + (s.values?.length || 0),
            0
          ) || 0,
        streamCount: pendingLogResults.results?.data?.result?.length || 0,
        results: pendingLogResults.results?.data?.result || [],
      }
      showMcpResultsApproval.value = true
    }

    // Check for pending DB query approval
    const pendingDbQueryResult = queries.find(
      (q) => q.status === 'pending_query' && q.type === 'db'
    )
    if (pendingDbQueryResult && !showDbQueryApproval.value) {
      pendingDbQuery.value = pendingDbQueryResult
      showDbQueryApproval.value = true
    }

    // Check for pending DB results approval
    const pendingDbResultsResult = queries.find(
      (q) => q.status === 'pending_results' && q.type === 'db'
    )
    if (pendingDbResultsResult && !showDbResultsApproval.value) {
      pendingDbResults.value = {
        ...pendingDbResultsResult,
        rows: pendingDbResultsResult.results?.rows || [],
        columns: pendingDbResultsResult.results?.columns || [],
        rowCount: pendingDbResultsResult.results?.rowCount || 0,
        tokenCount: pendingDbResultsResult.results?.tokenCount || 0,
      }
      showDbResultsApproval.value = true
    }
  } catch (error) {
    console.error('MCP polling error:', error)
  }
}

async function approveMcpQuery() {
  if (!pendingMcpQuery.value) return

  try {
    const response = await fetch(
      `http://status.localhost/api/mcp/approve/${pendingMcpQuery.value.id}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: 'query' }),
      }
    )

    if (!response.ok) {
      throw new Error('Failed to approve query')
    }

    addDebugEntry('response', 'MCP Query Approved', {
      queryId: pendingMcpQuery.value.id,
    })
  } catch (error) {
    console.error('Approve query error:', error)
  } finally {
    pendingMcpQuery.value = null
    showMcpQueryApproval.value = false
  }
}

async function rejectMcpQuery() {
  if (!pendingMcpQuery.value) return

  try {
    await fetch(
      `http://status.localhost/api/mcp/reject/${pendingMcpQuery.value.id}`,
      { method: 'POST' }
    )

    addDebugEntry('response', 'MCP Query Rejected', {
      queryId: pendingMcpQuery.value.id,
    })
  } catch (error) {
    console.error('Reject query error:', error)
  } finally {
    pendingMcpQuery.value = null
    showMcpQueryApproval.value = false
  }
}

async function approveMcpResults() {
  if (!pendingMcpResults.value) return

  try {
    const response = await fetch(
      `http://status.localhost/api/mcp/approve/${pendingMcpResults.value.id}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: 'results' }),
      }
    )

    if (!response.ok) {
      throw new Error('Failed to approve results')
    }

    addDebugEntry('response', 'MCP Results Approved', {
      queryId: pendingMcpResults.value.id,
      resultCount: pendingMcpResults.value.resultCount,
    })
  } catch (error) {
    console.error('Approve results error:', error)
  } finally {
    pendingMcpResults.value = null
    showMcpResultsApproval.value = false
  }
}

async function rejectMcpResults() {
  if (!pendingMcpResults.value) return

  try {
    await fetch(
      `http://status.localhost/api/mcp/reject/${pendingMcpResults.value.id}`,
      { method: 'POST' }
    )

    addDebugEntry('response', 'MCP Results Rejected', {
      queryId: pendingMcpResults.value.id,
    })
  } catch (error) {
    console.error('Reject results error:', error)
  } finally {
    pendingMcpResults.value = null
    showMcpResultsApproval.value = false
  }
}

// DB Query Approval Methods
async function approveDbQuery() {
  if (!pendingDbQuery.value) return

  try {
    const response = await fetch(
      `http://status.localhost/api/mcp/approve/${pendingDbQuery.value.id}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: 'query' }),
      }
    )

    if (!response.ok) {
      throw new Error('Failed to approve DB query')
    }

    addDebugEntry('response', 'DB Query Approved', {
      queryId: pendingDbQuery.value.id,
    })
  } catch (error) {
    console.error('Approve DB query error:', error)
  } finally {
    pendingDbQuery.value = null
    showDbQueryApproval.value = false
  }
}

async function rejectDbQuery() {
  if (!pendingDbQuery.value) return

  try {
    await fetch(
      `http://status.localhost/api/mcp/reject/${pendingDbQuery.value.id}`,
      { method: 'POST' }
    )

    addDebugEntry('response', 'DB Query Rejected', {
      queryId: pendingDbQuery.value.id,
    })
  } catch (error) {
    console.error('Reject DB query error:', error)
  } finally {
    pendingDbQuery.value = null
    showDbQueryApproval.value = false
  }
}

async function approveDbResults() {
  if (!pendingDbResults.value) return

  try {
    const response = await fetch(
      `http://status.localhost/api/mcp/approve/${pendingDbResults.value.id}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: 'results' }),
      }
    )

    if (!response.ok) {
      throw new Error('Failed to approve DB results')
    }

    addDebugEntry('response', 'DB Results Approved', {
      queryId: pendingDbResults.value.id,
      rowCount: pendingDbResults.value.rowCount,
    })
  } catch (error) {
    console.error('Approve DB results error:', error)
  } finally {
    pendingDbResults.value = null
    showDbResultsApproval.value = false
  }
}

async function rejectDbResults() {
  if (!pendingDbResults.value) return

  try {
    await fetch(
      `http://status.localhost/api/mcp/reject/${pendingDbResults.value.id}`,
      { method: 'POST' }
    )

    addDebugEntry('response', 'DB Results Rejected', {
      queryId: pendingDbResults.value.id,
    })
  } catch (error) {
    console.error('Reject DB results error:', error)
  } finally {
    pendingDbResults.value = null
    showDbResultsApproval.value = false
  }
}

function formatStreamLabels(stream) {
  if (!stream) return ''
  return Object.entries(stream)
    .map(([k, v]) => `${k}="${v}"`)
    .join(', ')
}

function formatLogTimestamp(ts) {
  if (!ts) return ''
  // Loki timestamps are in nanoseconds
  const ms = parseInt(ts, 10) / 1000000
  return new Date(ms).toLocaleTimeString()
}
</script>

<style scoped lang="scss">
.log-analysis-container {
  border: 1px solid #dee2e6;
  background: #f8f9fa;
}

.log-analysis-header {
  padding: 0.75rem 1rem;
  background: #ffffff;
  border-bottom: 1px solid #dee2e6;
}

.session-cost {
  font-size: 0.8rem;
  color: #757575;
  font-weight: normal;
}

.log-analysis-step {
  background: #ffffff;
  border-bottom: 1px solid #dee2e6;
}

.user-results {
  max-height: 300px;
  overflow-y: auto;
}

.user-result-item {
  border: 1px solid #dee2e6;
  cursor: pointer;
  transition: background-color 0.15s;

  &:hover {
    background-color: #e9ecef;
  }
}

.selected-user-banner {
  border-bottom: 1px solid #dee2e6;
}

.log-analysis-messages {
  background: #f5f5f5;
  min-height: 200px;
  max-height: 500px;
  overflow-y: auto;
  flex: 1;
}

.message-item {
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  max-width: 85%;
  background: #ffffff;
}

.message-user {
  margin-left: auto;
  border: 2px solid #28a745;
  border-bottom-right-radius: 0.125rem;
}

.message-user .message-header {
  color: #28a745;
}

.message-assistant {
  margin-right: auto;
  border: 2px solid #007bff;
  border-bottom-left-radius: 0.125rem;
}

.message-assistant .message-header {
  color: #007bff;
}

.message-cost {
  margin-top: 0.5rem;
  font-size: 0.7rem;
  color: #9e9e9e;
  text-align: right;
}

.chat-input-area {
  background: #ffffff;
  border-top: 1px solid #dee2e6;
}

.message-content {
  :deep(p) {
    margin-bottom: 0.5rem;

    &:last-child {
      margin-bottom: 0;
    }
  }

  :deep(ul),
  :deep(ol) {
    margin-bottom: 0.5rem;
  }

  :deep(code) {
    background: #e9ecef;
    padding: 0.1rem 0.3rem;
    font-size: 0.85em;
  }

  /* PII highlighting - always red to show what was anonymised */
  :deep(.pii-highlight) {
    background-color: #ffebee;
    color: #c62828;
    padding: 0.1rem 0.3rem;
    border-radius: 3px;
    border-bottom: 2px solid #ef5350;
  }
}

/* Debug panel styles */
.debug-panel {
  background: #263238;
  color: #eceff1;
  border-bottom: 1px solid #dee2e6;
  max-height: 300px;
  overflow-y: auto;

  h6 {
    color: #80cbc4;
    margin-bottom: 0.5rem;
  }
}

.debug-entries {
  font-family: monospace;
  font-size: 0.85em;
}

.debug-entry {
  border-radius: 4px;

  &.debug-request {
    background: #1b5e20;
    border-left: 3px solid #4caf50;
  }

  &.debug-response {
    background: #0d47a1;
    border-left: 3px solid #2196f3;
  }

  &.debug-error {
    background: #b71c1c;
    border-left: 3px solid #f44336;
  }
}

.debug-header {
  font-size: 0.9em;
}

.debug-data {
  background: rgba(0, 0, 0, 0.2);
  padding: 0.5rem;
  border-radius: 3px;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 150px;
  overflow-y: auto;
  color: #b0bec5;
}

.token-mapping {
  .token-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.2rem 0;

    .token {
      background: #ffcdd2;
      color: #c62828;
      padding: 0.1rem 0.4rem;
      border-radius: 3px;
    }

    .real-value {
      color: #ffcc80;
    }
  }
}

.gap-2 {
  gap: 0.5rem;
}

/* Privacy Review Modal styles */
.privacy-review-box {
  padding: 1rem;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.9em;
  white-space: pre-wrap;
  word-break: break-word;

  &.original {
    background: #fff3e0;
    border: 1px solid #ffcc80;
  }

  &.pseudonymized {
    background: #e8f5e9;
    border: 1px solid #81c784;
  }
}

.privacy-review-section h6 {
  margin-bottom: 0.5rem;
  color: #616161;
}

/* MCP Results Preview styles */
.mcp-results-preview {
  max-height: 400px;
  overflow-y: auto;
  background: #263238;
  border-radius: 4px;
  padding: 0.75rem;
  font-family: monospace;
  font-size: 0.85em;
}

.result-stream {
  border-bottom: 1px solid #37474f;
  padding-bottom: 0.5rem;

  &:last-child {
    border-bottom: none;
  }
}

.stream-labels {
  color: #80cbc4;
  margin-bottom: 0.25rem;
}

.log-entry {
  color: #eceff1;
  padding: 0.1rem 0;
  display: flex;
  gap: 0.5rem;

  .timestamp {
    color: #78909c;
    flex-shrink: 0;
  }

  .log-line {
    word-break: break-word;
  }
}

.gap-3 {
  gap: 1rem;
}

/* DB Results Preview styles */
.db-results-preview {
  max-height: 400px;
  overflow: auto;
  border: 1px solid #dee2e6;
  border-radius: 4px;

  .table {
    margin-bottom: 0;
    font-size: 0.85em;

    th {
      position: sticky;
      top: 0;
      background: #f8f9fa;
      z-index: 1;
    }

    td {
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}
</style>
