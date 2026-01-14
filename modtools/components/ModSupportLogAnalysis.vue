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
          random tokens (e.g., EMAIL_a8f3c2).
        </li>
        <li>
          <strong>You see real values</strong> - tokens are replaced back to
          real values in your browser only.
        </li>
        <li>
          <strong>Claude/Anthropic never sees</strong> the real email, IP, or
          other PII - only meaningless tokens.
        </li>
        <li>
          <strong>Audit log</strong> records all queries for compliance
          purposes.
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

    <!-- Header -->
    <div class="log-analysis-header">
      <div class="d-flex align-items-center justify-content-between">
        <div>
          <strong>AI Log Analysis</strong>
          <span v-if="!sanitizerAvailable" class="text-danger ml-2">
            (Service unavailable)
          </span>
        </div>
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

    <!-- Step 1: User Selection -->
    <div v-if="!selectedUser" class="log-analysis-step p-3">
      <h6>Step 1: Select a user to investigate</h6>
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

    <!-- Step 2: Query Input (after user selection) -->
    <div v-else class="log-analysis-step p-3">
      <div
        class="selected-user-banner mb-3 p-2 bg-light d-flex align-items-center"
      >
        <div class="flex-grow-1">
          <strong>{{ selectedUser.displayname || 'User' }}</strong>
          <span class="text-muted ml-2">{{ selectedUser.email }}</span>
          <small class="text-muted ml-2">(ID: {{ selectedUser.id }})</small>
        </div>
        <b-button variant="link" size="sm" @click="clearUser">
          Change user
        </b-button>
      </div>

      <h6>Step 2: Ask about this user</h6>
      <b-form @submit.prevent="submitQuery">
        <b-form-textarea
          v-model="query"
          rows="3"
          max-rows="6"
          placeholder="What would you like to know? e.g., 'Why are they getting errors?' or 'Show their recent login activity'"
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

    <!-- Conversation History -->
    <div v-if="messages.length > 0" class="log-analysis-messages p-3">
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
        <div class="message-content" v-html="formatContent(msg.content)" />
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
  </div>
</template>

<script>
import { marked } from 'marked'
import { useUserStore } from '~/stores/user'

// Query sanitizer service - frontend talks to this for PII handling
const SANITIZER_URL = 'http://mcp-sanitizer.localhost'

// AI support helper for Claude integration (same as existing AI assistant)
const AI_SUPPORT_URL = 'http://ai-support-helper.localhost'

export default {
  name: 'ModSupportLogAnalysis',
  data() {
    return {
      // UI state
      showPrivacyModal: false,
      showPiiWarning: false,
      sanitizerAvailable: true,

      // User search
      userSearch: '',
      searchingUser: false,
      searchResults: [],
      noResults: false,
      selectedUser: null,

      // Query input
      query: '',
      detectedPii: [],
      pendingQuery: null,

      // Processing
      isProcessing: false,
      processingStatus: 'Analyzing...',
      currentSessionId: null,
      localMapping: {},

      // Conversation
      messages: [],
    }
  },
  async mounted() {
    await this.checkSanitizerAvailability()
  },
  methods: {
    async checkSanitizerAvailability() {
      try {
        const response = await fetch(`${SANITIZER_URL}/health`)
        this.sanitizerAvailable = response.ok
      } catch {
        this.sanitizerAvailable = false
      }
    },

    async searchUsers() {
      if (!this.userSearch.trim()) return

      this.searchingUser = true
      this.searchResults = []
      this.noResults = false

      try {
        const userStore = useUserStore()
        userStore.clear()

        await userStore.fetchMT({
          search: this.userSearch.trim(),
          emailhistory: true,
        })

        // Get results and sort by last access
        this.searchResults = Object.values(userStore.list)
          .sort((a, b) => {
            return (
              new Date(b.lastaccess).getTime() -
              new Date(a.lastaccess).getTime()
            )
          })
          .slice(0, 10) // Limit to 10 results

        this.noResults = this.searchResults.length === 0
      } catch (error) {
        console.error('User search error:', error)
        this.noResults = true
      } finally {
        this.searchingUser = false
      }
    },

    selectUser(user) {
      this.selectedUser = user
      this.searchResults = []
      this.userSearch = ''
    },

    clearUser() {
      this.selectedUser = null
      this.messages = []
      this.query = ''
      this.currentSessionId = null
      this.localMapping = {}
    },

    async submitQuery() {
      if (!this.query.trim() || this.isProcessing || !this.selectedUser) return

      // First, scan for PII
      try {
        const response = await fetch(`${SANITIZER_URL}/scan`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: this.query,
            knownPii: {
              email: this.selectedUser.email,
              displayname: this.selectedUser.displayname,
              userid: this.selectedUser.id,
            },
          }),
        })

        if (response.ok) {
          const { detectedPii, containsEmailTrail } = await response.json()

          if (containsEmailTrail) {
            alert(
              'Your query appears to contain copy-pasted email content. Please describe the issue in your own words to protect user privacy.'
            )
            return
          }

          if (detectedPii && detectedPii.length > 0) {
            this.detectedPii = detectedPii
            this.pendingQuery = this.query
            this.showPiiWarning = true
            return
          }
        }
      } catch (error) {
        console.error('PII scan error:', error)
        // Continue anyway - sanitizer will handle it
      }

      await this.executeQuery(this.query)
    },

    confirmPiiQuery() {
      if (this.pendingQuery) {
        this.executeQuery(this.pendingQuery)
        this.pendingQuery = null
      }
      this.showPiiWarning = false
    },

    cancelPiiQuery() {
      this.pendingQuery = null
      this.showPiiWarning = false
    },

    async executeQuery(queryText) {
      this.isProcessing = true
      this.processingStatus = 'Sanitizing query...'

      try {
        // Step 1: Sanitize the query
        const sanitizeResponse = await fetch(`${SANITIZER_URL}/sanitize`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: queryText,
            knownPii: {
              email: this.selectedUser.email,
              displayname: this.selectedUser.displayname,
              userid: this.selectedUser.id,
              postcode: this.selectedUser.postcode,
              location: this.selectedUser.location,
            },
            userId: this.selectedUser.id,
          }),
        })

        if (!sanitizeResponse.ok) {
          const error = await sanitizeResponse.json()
          throw new Error(error.message || 'Failed to sanitize query')
        }

        // eslint-disable-next-line no-unused-vars
        const { pseudonymizedQuery, sessionId, localMapping } =
          await sanitizeResponse.json()

        this.currentSessionId = sessionId
        this.localMapping = { ...this.localMapping, ...localMapping }

        // Add user message to conversation
        this.messages.push({
          role: 'user',
          content: queryText,
        })

        this.processingStatus = 'Querying logs...'

        // Step 2: Query logs via MCP interface
        // For now, we'll simulate the Claude interaction
        // In the full implementation, this would go through the AI support helper
        // with the pseudonymized query and session ID
        const logResponse = await this.queryLogsForUser(sessionId)

        // Step 3: De-tokenize the response
        const deTokenizedResponse = this.deTokenize(logResponse)

        this.messages.push({
          role: 'assistant',
          content: deTokenizedResponse,
        })

        this.query = ''
      } catch (error) {
        console.error('Query error:', error)
        this.messages.push({
          role: 'assistant',
          content: `Error: ${error.message}`,
        })
      } finally {
        this.isProcessing = false
      }
    },

    async queryLogsForUser(sessionId) {
      // Query the AI support helper with the pseudonymized query
      // The AI helper will use MCP tools to query logs via the pseudonymizer
      try {
        const response = await fetch(`${AI_SUPPORT_URL}/api/log-analysis`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            userId: this.selectedUser.id,
            timeRange: '24h',
          }),
        })

        if (!response.ok) {
          // If the log analysis endpoint isn't available yet, provide helpful message
          if (response.status === 404) {
            return `**Log Analysis Service**\n\nThe AI-powered log analysis service is being set up. Once available, it will:\n\n- Query Loki logs for user activity\n- Identify patterns and issues\n- Provide insights about errors and problems\n\nIn the meantime, you can use the **System Logs** tab to manually search for this user's activity.`
          }
          throw new Error('Failed to query logs')
        }

        const data = await response.json()
        return data.analysis || 'No analysis available.'
      } catch (error) {
        // Service not available - provide helpful fallback message
        if (error.message.includes('fetch')) {
          return `**Log Analysis Service**\n\nThe AI log analysis service is not currently running. Please:\n\n1. Check that the **ai-support-helper** container is running\n2. Use the **System Logs** tab to manually search logs\n3. Contact geeks@ilovefreegle.org if issues persist\n\nUser ID for manual search: **${this.selectedUser.id}**`
        }
        return `Unable to query logs: ${error.message}`
      }
    },

    deTokenize(text) {
      if (!text || !this.localMapping) return text

      let result = text
      for (const [token, realValue] of Object.entries(this.localMapping)) {
        result = result.split(token).join(realValue)
      }
      return result
    },

    cancelQuery() {
      this.isProcessing = false
      this.processingStatus = ''
    },

    formatDate(dateStr) {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
    },

    formatContent(content) {
      if (!content) return ''
      return marked(content)
    },
  },
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
  border: 1px solid #dee2e6;
}

.log-analysis-messages {
  background: #ffffff;
  max-height: 400px;
  overflow-y: auto;
}

.message-item {
  padding: 0.75rem;
}

.message-user {
  background: #e3f2fd;
  margin-left: 2rem;
}

.message-assistant {
  background: #ffffff;
  border: 1px solid #dee2e6;
  margin-right: 2rem;
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
}
</style>
