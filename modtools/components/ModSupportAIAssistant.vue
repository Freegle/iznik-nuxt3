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

    <!-- Debug Modal: MCP Data Summary -->
    <b-modal
      v-model="showDebugModal"
      title="MCP Data Sent to AI"
      size="lg"
      centered
      ok-only
      ok-title="Close"
    >
      <p class="text-muted small mb-3">
        This shows all unique values from MCP tools (logs, database) that were
        sent to Claude. User-typed queries are excluded.
      </p>

      <div
        v-if="mcpDataSummary.length === 0"
        class="text-center text-muted py-3"
      >
        No MCP data has been sent to AI yet.
      </div>

      <table v-else class="table table-sm table-bordered">
        <thead>
          <tr>
            <th>Value Sent to AI</th>
            <th v-if="showAnonymisedData">Real Value</th>
            <th class="text-center" style="width: 80px">Count</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in mcpDataSummary" :key="item.token">
            <td>
              <code class="text-primary">{{ item.token }}</code>
              <span
                v-if="item.isPseudonymized"
                class="badge bg-success ms-2"
                title="This value was pseudonymized"
                ><i class="fas fa-check"
              /></span>
              <span
                v-else-if="item.looksLikePii"
                class="badge bg-danger ms-2"
                title="This may contain PII"
                ><i class="fas fa-exclamation-triangle"
              /></span>
            </td>
            <td v-if="showAnonymisedData">
              <span v-if="item.realValue" class="text-muted">{{
                item.realValue
              }}</span>
              <span v-else class="text-muted">-</span>
            </td>
            <td class="text-center">{{ item.count }}</td>
          </tr>
        </tbody>
      </table>

      <div class="mt-3 small text-muted">
        <strong>Legend:</strong>
        <span class="badge bg-success ms-2"><i class="fas fa-check" /></span>
        Pseudonymized (safe)
        <span class="badge bg-danger ms-2"
          ><i class="fas fa-exclamation-triangle"
        /></span>
        May contain PII (review)
      </div>
    </b-modal>

    <!-- Settings Modal: Server Configuration -->
    <b-modal
      v-model="showSettingsModal"
      title="Server Configuration"
      size="md"
      centered
      ok-title="Save"
      @ok="saveServerSettings"
    >
      <b-form-group label="Environment" label-size="sm" class="mb-3">
        <b-form-select
          v-model="serverEnvironment"
          :options="[
            { value: 'dev', text: 'Development (local containers)' },
            { value: 'live', text: 'Live (via SSH tunnels)' },
          ]"
          size="sm"
          @change="onEnvironmentChange"
        />
      </b-form-group>

      <template v-if="serverEnvironment === 'live'">
        <div class="alert alert-warning small mb-3">
          <strong>Live Mode:</strong> Configure SSH tunnels to connect to
          production servers. See tips below for setup.
        </div>

        <b-form-group
          label="API Server (for user search)"
          label-size="sm"
          class="mb-3"
        >
          <b-form-input
            v-model="apiServerUrl"
            placeholder="https://www.ilovefreegle.org/api"
            size="sm"
          />
          <small class="text-muted">
            Freegle API endpoint for user search
          </small>
        </b-form-group>

        <b-form-group label="Loki Server" label-size="sm" class="mb-3">
          <b-form-input
            v-model="lokiServerUrl"
            placeholder="http://localhost:3101"
            size="sm"
          />
          <small class="text-muted">
            Loki API for log queries (via SSH tunnel)
          </small>
        </b-form-group>

        <b-form-group label="MySQL Server" label-size="sm" class="mb-2">
          <b-form-input
            v-model="sqlServerUrl"
            placeholder="localhost:1234"
            size="sm"
          />
          <small class="text-muted">
            MySQL host:port for database queries (via SSH tunnel)
          </small>
        </b-form-group>

        <div class="row mb-3">
          <div class="col-6">
            <b-form-group label="MySQL Username" label-size="sm" class="mb-0">
              <b-form-input
                v-model="sqlServerUser"
                placeholder="root"
                size="sm"
              />
            </b-form-group>
          </div>
          <div class="col-6">
            <b-form-group label="MySQL Password" label-size="sm" class="mb-0">
              <b-form-input
                v-model="sqlServerPassword"
                type="password"
                placeholder="password"
                size="sm"
              />
            </b-form-group>
          </div>
        </div>

        <b-form-group label="Database Name" label-size="sm" class="mb-3">
          <b-form-input
            v-model="sqlServerDatabase"
            placeholder="iznik"
            size="sm"
          />
        </b-form-group>

        <div class="alert alert-info small mb-0">
          <strong>SSH Tunnel Setup:</strong>
          <ul class="mb-0 ps-3">
            <li>
              <strong>From Windows (MobaXterm):</strong> Bind to
              <code>0.0.0.0</code> instead of <code>127.0.0.1</code>, then use
              Windows IP (e.g., <code>192.168.1.166:port</code>)
            </li>
            <li>
              <strong>From WSL:</strong> Use
              <code>ssh -L 3101:localhost:3100 liveserver</code>, then use
              <code>localhost:3101</code>
            </li>
          </ul>
        </div>
      </template>

      <template v-else>
        <div class="alert alert-success small mb-0">
          <strong>Development Mode:</strong> Using local Docker containers. No
          additional configuration needed.
        </div>
      </template>
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
            v-model="showAnonymisedData"
            switch
            size="sm"
            class="mr-3"
          >
            <small>{{
              showAnonymisedData ? 'Show PII' : 'Show Anonymised'
            }}</small>
          </b-form-checkbox>
          <b-button
            variant="secondary"
            size="sm"
            class="mr-2"
            @click="showSettingsModal = true"
          >
            Settings
          </b-button>
          <b-button
            variant="secondary"
            size="sm"
            class="mr-3"
            @click="showDebugModal = true"
          >
            Debug
          </b-button>
          <b-button
            variant="link"
            size="sm"
            class="p-0"
            @click="showPrivacyModal = true"
          >
            <i class="fas fa-info-circle text-info" /> Privacy
          </b-button>
        </div>
      </div>
    </div>

    <!-- Chat header with New Chat button -->
    <div class="chat-header p-2 bg-light d-flex align-items-center">
      <div class="flex-grow-1">
        <span class="text-muted small">
          Ask about any user by mentioning their email address in your query.
        </span>
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
            {{ msg.role === 'user' ? 'You' : 'AI Support Helper' }}
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
          <div class="message-header small text-muted mb-1">
            AI Support Helper
          </div>
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
  </div>
</template>

<script>
import { marked } from 'marked'

// AI Sanitizer service - combined service for PII handling, Loki queries, and DB queries
// Backwards compatible: mcp-sanitizer.localhost is aliased to ai-sanitizer.localhost in Traefik
const SANITIZER_URL = 'http://ai-sanitizer.localhost'

// AI support helper for Claude integration (same as existing AI assistant)
const AI_SUPPORT_URL = 'http://ai-support-helper.localhost'

export default {
  name: 'ModSupportAIAssistant',
  data() {
    return {
      // UI state
      showPrivacyModal: false,
      showPiiWarning: false,
      showDebugModal: false,
      sanitizerAvailable: true,
      showAnonymisedData: false,

      // User context (optional - users can mention emails directly in chat)
      selectedUser: null,

      // Query input
      query: '',
      detectedPii: [],
      pendingQuery: null,

      // Processing
      isProcessing: false,
      processingStatus: 'Analyzing...',
      currentSessionId: null,
      claudeSessionId: null, // For Claude Code conversation continuity
      localMapping: {},

      // Conversation with raw data for debug
      messages: [],
      debugLog: [],

      // Server configuration (for development tunnels)
      showSettingsModal: false,
      serverEnvironment: localStorage.getItem('aiSupport_environment') || 'dev',
      lokiServerUrl: localStorage.getItem('aiSupport_lokiUrl') || '',
      sqlServerUrl: localStorage.getItem('aiSupport_sqlUrl') || '',
      sqlServerUser: localStorage.getItem('aiSupport_sqlUser') || '',
      sqlServerPassword: localStorage.getItem('aiSupport_sqlPassword') || '',
      sqlServerDatabase:
        localStorage.getItem('aiSupport_sqlDatabase') || 'iznik',
      apiServerUrl: localStorage.getItem('aiSupport_apiUrl') || '',
    }
  },
  computed: {
    totalCost() {
      return this.messages
        .filter((m) => m.role === 'assistant' && m.costUsd)
        .reduce((sum, m) => sum + m.costUsd, 0)
    },
    mcpDataSummary() {
      // Build a map of unique strings sent to AI from MCP (not user queries)
      const tokenCounts = new Map()

      // localMapping contains token -> realValue pairs from pseudonymization
      // These are the values that were replaced before sending to AI
      for (const [token, realValue] of Object.entries(this.localMapping)) {
        if (!tokenCounts.has(token)) {
          tokenCounts.set(token, {
            token,
            realValue,
            count: 1,
            isPseudonymized: true,
            looksLikePii: false,
          })
        } else {
          tokenCounts.get(token).count++
        }
      }

      // Also look through MCP response data for any values that weren't pseudonymized
      // These would be in response entries from debug log
      for (const entry of this.debugLog) {
        if (
          entry.type === 'response' &&
          entry.label &&
          entry.label.includes('MCP')
        ) {
          // Extract strings from response data that look like they might be PII
          const dataStr =
            typeof entry.data === 'string'
              ? entry.data
              : JSON.stringify(entry.data)

          // Look for email-like patterns that weren't pseudonymized
          const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
          const emails = dataStr.match(emailRegex) || []

          for (const email of emails) {
            // Skip if this is already a pseudonymized token (contains user_ or has our pattern)
            if (email.includes('user_') || email.includes('_')) continue

            // Check if it's in our mapping as a real value (meaning it was pseudonymized)
            const isPseudonymized = Object.values(this.localMapping).includes(
              email
            )
            if (isPseudonymized) continue // Already tracked via token

            // This is a non-pseudonymized email found in MCP data
            if (!tokenCounts.has(email)) {
              tokenCounts.set(email, {
                token: email,
                realValue: null,
                count: 1,
                isPseudonymized: false,
                looksLikePii: true,
              })
            } else {
              tokenCounts.get(email).count++
            }
          }

          // Look for IP addresses
          const ipRegex = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g
          const ips = dataStr.match(ipRegex) || []

          for (const ip of ips) {
            // Skip localhost and common internal IPs
            if (
              ip.startsWith('127.') ||
              ip.startsWith('10.') ||
              ip.startsWith('172.') ||
              ip.startsWith('192.168.')
            )
              continue

            const isPseudonymized = Object.values(this.localMapping).includes(
              ip
            )
            if (isPseudonymized) continue

            if (!tokenCounts.has(ip)) {
              tokenCounts.set(ip, {
                token: ip,
                realValue: null,
                count: 1,
                isPseudonymized: false,
                looksLikePii: true,
              })
            } else {
              tokenCounts.get(ip).count++
            }
          }
        }
      }

      // Convert to array and sort by count descending
      return Array.from(tokenCounts.values()).sort((a, b) => b.count - a.count)
    },
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

    onEnvironmentChange(env) {
      if (env === 'live') {
        // Set default live values if not already set
        if (!this.apiServerUrl) {
          this.apiServerUrl = 'https://www.ilovefreegle.org/api'
        }
        if (!this.lokiServerUrl) {
          this.lokiServerUrl = 'http://localhost:3101'
        }
        if (!this.sqlServerUrl) {
          this.sqlServerUrl = 'localhost:1234'
        }
      }
    },

    saveServerSettings() {
      // Save to localStorage for persistence across sessions
      localStorage.setItem('aiSupport_environment', this.serverEnvironment)
      localStorage.setItem('aiSupport_lokiUrl', this.lokiServerUrl)
      localStorage.setItem('aiSupport_sqlUrl', this.sqlServerUrl)
      localStorage.setItem('aiSupport_sqlUser', this.sqlServerUser)
      localStorage.setItem('aiSupport_sqlPassword', this.sqlServerPassword)
      localStorage.setItem('aiSupport_sqlDatabase', this.sqlServerDatabase)
      localStorage.setItem('aiSupport_apiUrl', this.apiServerUrl)
      console.log('Server settings saved:', {
        environment: this.serverEnvironment,
        api: this.apiServerUrl,
        loki: this.lokiServerUrl,
        sql: this.sqlServerUrl,
        sqlUser: this.sqlServerUser,
      })
    },

    newChat() {
      // Start a fresh conversation
      this.selectedUser = null
      this.messages = []
      this.query = ''
      this.currentSessionId = null
      this.claudeSessionId = null
      this.localMapping = {}
      this.debugLog = []
    },

    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.messagesContainer
        if (container) {
          container.scrollTop = container.scrollHeight
        }
      })
    },

    addDebugEntry(type, label, data, tokenMapping = null) {
      if (this.debugMode) {
        this.debugLog.push({
          type,
          label,
          data,
          tokenMapping,
          timestamp: new Date().toLocaleTimeString(),
        })
      }
    },

    async submitQuery() {
      if (!this.query.trim() || this.isProcessing) return

      // First, scan for PII
      try {
        const scanPayload = {
          query: this.query,
          knownPii: this.selectedUser
            ? {
                email: this.selectedUser.email,
                displayname: this.selectedUser.displayname,
                userid: this.selectedUser.id,
              }
            : {},
        }

        this.addDebugEntry('request', 'PII Scan Request', scanPayload)

        const response = await fetch(`${SANITIZER_URL}/scan`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(scanPayload),
        })

        if (response.ok) {
          const scanResult = await response.json()
          this.addDebugEntry('response', 'PII Scan Response', scanResult)

          if (scanResult.containsEmailTrail) {
            alert(
              'Your query appears to contain copy-pasted email content. Please describe the issue in your own words to protect user privacy.'
            )
            return
          }

          if (scanResult.detectedPii && scanResult.detectedPii.length > 0) {
            this.detectedPii = scanResult.detectedPii
            this.pendingQuery = this.query
            this.showPiiWarning = true
            return
          }
        }
      } catch (error) {
        console.error('PII scan error:', error)
        this.addDebugEntry('error', 'PII Scan Error', {
          message: error.message,
        })
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
        // Add user context to query BEFORE sanitization
        // This ensures Claude knows which user we're investigating, while the email
        // gets pseudonymized (e.g., "testmod@test.com" -> "user_abc123@test.com")
        let contextualQuery = queryText
        if (this.selectedUser) {
          contextualQuery = `Investigating Freegle user ${this.selectedUser.email} (ID: ${this.selectedUser.id}). Query: ${queryText}`
        }

        // Step 1: Sanitize the query (including user context)
        const sanitizePayload = {
          query: contextualQuery,
          knownPii: this.selectedUser
            ? {
                email: this.selectedUser.email,
                displayname: this.selectedUser.displayname,
                userid: this.selectedUser.id,
                postcode: this.selectedUser.postcode,
                location: this.selectedUser.location,
              }
            : {},
          userId: this.selectedUser?.id || 0,
        }

        this.addDebugEntry('request', 'Sanitize Request', sanitizePayload)

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
        const { pseudonymizedQuery, sessionId, localMapping } = sanitizeResult

        this.addDebugEntry(
          'response',
          'Sanitize Response',
          { pseudonymizedQuery, sessionId },
          localMapping
        )

        this.currentSessionId = sessionId
        this.localMapping = { ...this.localMapping, ...localMapping }

        // Proceed with the query
        await this.proceedWithQuery(queryText, pseudonymizedQuery)
      } catch (error) {
        console.error('Query error:', error)
        this.addDebugEntry('error', 'Query Error', { message: error.message })
        this.messages.push({
          role: 'assistant',
          content: `Error: ${error.message}`,
          rawContent: `Error: ${error.message}`,
        })
        this.scrollToBottom()
      } finally {
        this.isProcessing = false
      }
    },

    async proceedWithQuery(queryText, pseudonymizedQuery) {
      this.isProcessing = true

      try {
        // Add user message to conversation (store both raw and display versions)
        this.messages.push({
          role: 'user',
          content: queryText,
          rawContent: queryText,
        })
        this.scrollToBottom()

        this.processingStatus = 'Analyzing...'

        // Send pseudonymized query to Claude Code for log analysis
        const logResult = await this.queryLogsForUser(pseudonymizedQuery)

        this.addDebugEntry('response', 'Log Analysis Response (raw)', {
          analysis:
            logResult.analysis.substring(0, 500) +
            (logResult.analysis.length > 500 ? '...' : ''),
          costUsd: logResult.costUsd,
        })

        // Step 3: Store both raw and de-tokenized versions with cost
        const deTokenizedResponse = this.deTokenize(logResult.analysis)

        this.messages.push({
          role: 'assistant',
          content: deTokenizedResponse,
          rawContent: logResult.analysis,
          mapping: { ...this.localMapping },
          costUsd: logResult.costUsd,
          usage: logResult.usage,
        })
        this.scrollToBottom()

        this.query = ''
      } catch (error) {
        console.error('Query error:', error)
        this.addDebugEntry('error', 'Query Error', { message: error.message })
        this.messages.push({
          role: 'assistant',
          content: `Error: ${error.message}`,
          rawContent: `Error: ${error.message}`,
        })
        this.scrollToBottom()
      } finally {
        this.isProcessing = false
      }
    },

    async queryLogsForUser(userQuery) {
      try {
        const requestBody = {
          query: userQuery,
          userId: this.selectedUser?.id || 0,
        }

        // Include Claude session ID for conversation continuity
        if (this.claudeSessionId) {
          requestBody.claudeSessionId = this.claudeSessionId
        }

        // Include custom server URLs if configured (for SSH tunnels to live servers)
        if (this.lokiServerUrl) {
          requestBody.lokiUrl = this.lokiServerUrl
        }
        if (this.sqlServerUrl) {
          requestBody.sqlUrl = this.sqlServerUrl
          // Include SQL credentials if configured
          if (this.sqlServerUser) {
            requestBody.sqlUser = this.sqlServerUser
          }
          if (this.sqlServerPassword) {
            requestBody.sqlPassword = this.sqlServerPassword
          }
          if (this.sqlServerDatabase) {
            requestBody.sqlDatabase = this.sqlServerDatabase
          }
        }

        this.addDebugEntry('request', 'Claude Code Request', requestBody)

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
          if (
            response.status === 410 ||
            errorData.error === 'SESSION_EXPIRED'
          ) {
            this.claudeSessionId = null
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
          this.claudeSessionId = data.claudeSessionId
          this.addDebugEntry('response', 'Claude Code Response', {
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
          const userInfo = this.selectedUser
            ? `\n\nUser ID for manual search: **${this.selectedUser.id}**`
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
    },

    deTokenize(text) {
      if (!text || !this.localMapping) return text

      let result = text
      for (const [token, realValue] of Object.entries(this.localMapping)) {
        result = result.split(token).join(realValue)
      }
      return result
    },

    highlightPii(text, mapping, showTokens) {
      if (!text || !mapping) return text

      let result = text

      // Build a map of what to search for and what to replace with
      // Do all replacements in a single pass to avoid matching inside already-replaced content
      const replacements = []

      for (const [token, realValue] of Object.entries(mapping)) {
        const displayValue = showTokens ? token : realValue
        // Use data attribute instead of title with real value to avoid nested replacement issues
        const highlightHtml = `<span class="pii-highlight" data-token="${token}">${displayValue}</span>`

        // Always replace tokens
        replacements.push({ search: token, replace: highlightHtml })

        // When showing real values, also prepare to replace real values
        // (in case they appear in the text but weren't tokenized)
        if (!showTokens && realValue !== token) {
          replacements.push({ search: realValue, replace: highlightHtml })
        }
      }

      // Sort by length descending to replace longer matches first
      // This prevents partial matches (e.g., replacing "test" inside "test@example.com")
      replacements.sort((a, b) => b.search.length - a.search.length)

      // Apply replacements
      for (const { search, replace } of replacements) {
        // Use a marker to avoid re-replacing already replaced content
        const marker = `\x00HIGHLIGHT_${Math.random()
          .toString(36)
          .slice(2)}\x00`
        result = result.split(search).join(marker)
        result = result.split(marker).join(replace)
      }

      return result
    },

    formatMessageContent(msg) {
      if (!msg.content) return ''

      // Start with the de-tokenized content, then re-highlight based on toggle
      let html = marked(msg.content)

      // Always highlight PII - toggle controls whether we show token or real value
      if (msg.mapping && Object.keys(msg.mapping).length > 0) {
        html = this.highlightPii(html, msg.mapping, this.showAnonymisedData)
      }

      return html
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

.gap-2 {
  gap: 0.5rem;
}
</style>
