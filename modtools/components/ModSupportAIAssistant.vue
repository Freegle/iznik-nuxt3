<template>
  <div class="ai-chat-container">
    <!-- Privacy Info Modal -->
    <b-modal
      v-model="showPrivacyModal"
      title="Privacy Notice"
      ok-only
      ok-title="I Understand"
      centered
    >
      <p>This assistant uses Claude AI to help investigate issues.</p>
      <p>
        <strong>For privacy protection:</strong>
      </p>
      <ul>
        <li>Claude only receives yes/no answers and counts.</li>
        <li>Claude never sees emails, chat messages, or personal data.</li>
        <li>Public group, post or user info may be shared.</li>
        <li>You can see all queries made and stop at any time.</li>
      </ul>
    </b-modal>

    <!-- Header -->
    <div class="ai-chat-header">
      <div class="d-flex align-items-center justify-content-between">
        <div>
          <strong>AI Support Helper</strong>
          <span v-if="!connected && !connecting" class="text-danger ml-2">
            (Disconnected)
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

    <!-- Error messages -->
    <NoticeMessage v-if="connectionError" variant="danger" class="m-2">
      {{ connectionError }}
    </NoticeMessage>

    <NoticeMessage v-if="authExpired" variant="warning" class="m-2">
      <strong>Claude authentication has expired.</strong><br />
      Please ask an administrator to run 'claude' on the server to
      re-authenticate.
    </NoticeMessage>

    <!-- Chat messages area -->
    <div ref="chatContent" class="ai-chat-content">
      <div class="ai-chat-messages">
        <!-- Welcome message -->
        <div v-if="messages.length === 0" class="ai-welcome-message">
          <div class="ai-message ai-message--assistant">
            <div class="ai-message-content">
              Hello! I'm the AI Support Helper. I can answer questions about
              how the Freegle website works or investigate specific problems for
              freeglers. What would you like to know?
            </div>
          </div>
        </div>

        <!-- Message history -->
        <div
          v-for="(msg, idx) in messages"
          :key="idx"
          class="ai-message"
          :class="{
            'ai-message--user': msg.role === 'user',
            'ai-message--assistant': msg.role === 'assistant',
            'ai-message--system': msg.role === 'system',
          }"
        >
          <div class="ai-message-content">
            <!-- User message -->
            <template v-if="msg.role === 'user'">
              {{ msg.content }}
            </template>

            <!-- Assistant message -->
            <template v-else-if="msg.role === 'assistant'">
              <div v-html="formatMarkdown(msg.content)" />
            </template>

            <!-- System/status message -->
            <template v-else-if="msg.role === 'system'">
              <div class="text-muted small">
                <em>{{ msg.content }}</em>
              </div>
            </template>

            <!-- Fact queries (transparency) -->
            <template v-if="msg.queries && msg.queries.length > 0">
              <div class="ai-queries mt-2">
                <div class="ai-queries-header" @click="msg.showQueries = !msg.showQueries">
                  <span>{{ msg.showQueries ? '▼' : '▶' }}</span>
                  {{ msg.queries.length }} fact {{ msg.queries.length === 1 ? 'query' : 'queries' }} executed
                </div>
                <div v-if="msg.showQueries" class="ai-queries-list">
                  <div
                    v-for="(q, qIdx) in msg.queries"
                    :key="qIdx"
                    class="ai-query-item"
                  >
                    <code>{{ q.query }}({{ formatParams(q.params) }})</code>
                    <span class="ml-2">→</span>
                    <span
                      class="ml-1"
                      :class="{
                        'text-success': q.status === 'complete',
                        'text-danger': q.status === 'error',
                      }"
                    >
                      {{ q.status === 'error' ? q.error : formatAnswer(q.result) }}
                    </span>
                  </div>
                </div>
              </div>
            </template>

            <!-- Suggested new queries -->
            <template
              v-if="msg.suggestedQueries && msg.suggestedQueries.length > 0"
            >
              <div class="ai-suggested-queries mt-2">
                <strong>Suggested new fact queries:</strong>
                <div
                  v-for="(sq, sqIdx) in msg.suggestedQueries"
                  :key="sqIdx"
                  class="mt-1"
                >
                  <code>{{ sq.name }}({{ sq.params.join(', ') }})</code>
                  <span class="text-muted ml-2">- {{ sq.description }}</span>
                </div>
              </div>
            </template>
          </div>
        </div>

        <!-- Typing/processing indicator -->
        <div v-if="isProcessing" class="ai-message ai-message--assistant">
          <div class="ai-message-content">
            <div class="ai-typing">
              <span class="ai-typing-dot"></span>
              <span class="ai-typing-dot"></span>
              <span class="ai-typing-dot"></span>
              <span class="ml-2 text-muted small">{{ currentStep }}</span>
            </div>
            <b-button
              variant="outline-danger"
              size="sm"
              class="mt-2"
              @click="stopProcessing"
            >
              Stop
            </b-button>
          </div>
        </div>
      </div>
    </div>

    <!-- Input area -->
    <div class="ai-chat-footer">
      <b-form class="ai-input-form" @submit.prevent="submitQuestion">
        <b-form-textarea
          v-model="question"
          rows="2"
          max-rows="4"
          placeholder="Ask about a user or system issue..."
          :disabled="isProcessing || !connected"
          class="ai-input"
          @keydown.enter.exact.prevent="submitQuestion"
        />
        <b-button
          type="submit"
          variant="primary"
          :disabled="!question.trim() || isProcessing || !connected"
          class="ai-send-btn"
        >
          <span v-if="isProcessing">
            <b-spinner small />
          </span>
          <span v-else>Send</span>
        </b-button>
      </b-form>
    </div>
  </div>
</template>

<script>
import { reactive } from 'vue'
import api from '~/api'

// Fact query types that can be executed in the browser.
const QUERY_TYPES = {
  // Counts - return numbers only.
  count_api_calls: {
    params: ['userid', 'timerange'],
    execute: async (params, config) => {
      const response = await api(config).systemlogs.fetch({
        sources: 'api',
        userid: params.userid,
        start: params.timerange,
        limit: 1,
      })
      return response?.stats?.total_count || 0
    },
  },
  count_errors: {
    params: ['userid', 'timerange'],
    execute: async (params, config) => {
      const response = await api(config).systemlogs.fetch({
        sources: 'api',
        userid: params.userid,
        start: params.timerange,
        levels: 'error',
        limit: 1,
      })
      return response?.stats?.total_count || 0
    },
  },
  count_logins: {
    params: ['userid', 'timerange'],
    execute: async (params, config) => {
      const response = await api(config).systemlogs.fetch({
        sources: 'logs_table',
        userid: params.userid,
        start: params.timerange,
        types: 'User',
        subtypes: 'Login',
        limit: 1,
      })
      return response?.stats?.total_count || 0
    },
  },

  // Yes/No questions.
  has_recent_activity: {
    params: ['userid', 'timerange'],
    execute: async (params, config) => {
      const response = await api(config).systemlogs.fetch({
        sources: 'api,client',
        userid: params.userid,
        start: params.timerange,
        limit: 1,
      })
      return (response?.stats?.total_count || 0) > 0
    },
  },
  has_errors: {
    params: ['userid', 'timerange'],
    execute: async (params, config) => {
      const response = await api(config).systemlogs.fetch({
        sources: 'api,client',
        userid: params.userid,
        start: params.timerange,
        levels: 'error',
        limit: 1,
      })
      return (response?.stats?.total_count || 0) > 0
    },
  },

  // Safe summaries (no PII).
  get_error_summary: {
    params: ['userid', 'timerange'],
    execute: async (params, config) => {
      const response = await api(config).systemlogs.fetch({
        sources: 'api',
        userid: params.userid,
        start: params.timerange,
        levels: 'error',
        limit: 100,
      })
      const summary = {}
      for (const log of response?.logs || []) {
        const status = log.raw?.status_code || 'unknown'
        summary[status] = (summary[status] || 0) + 1
      }
      return Object.entries(summary).map(([statusCode, count]) => ({
        statusCode,
        count,
      }))
    },
  },
  get_user_role: {
    params: ['userid'],
    execute: async (params, config) => {
      try {
        const user = await api(config).user.fetchv2(params.userid)
        return user?.systemrole || 'User'
      } catch {
        return 'Unknown'
      }
    },
  },
  find_user_by_email: {
    params: ['email'],
    execute: async (params, config) => {
      try {
        const result = await api(config).user.fetch({
          search: params.email,
          emailhistory: true,
        })
        if (result?.user) {
          return {
            id: result.user.id,
            role: result.user.systemrole || 'User',
            found: true,
          }
        }
        return { found: false }
      } catch {
        return { found: false, error: 'Search failed' }
      }
    },
  },

  // PUBLIC DATA.
  get_group_info: {
    params: ['groupid'],
    execute: async (params, config) => {
      try {
        const group = await api(config).group.fetchv2(params.groupid)
        return {
          id: group?.id,
          name: group?.namedisplay || group?.nameshort,
          region: group?.region,
          membercount: group?.membercount,
        }
      } catch {
        return null
      }
    },
  },
  search_groups: {
    params: ['search'],
    execute: async (params, config) => {
      try {
        const groups = await api(config).group.listv2()
        const searchLower = (params.search || '').toLowerCase()
        return (groups || [])
          .filter(
            (g) =>
              (g.namedisplay || '').toLowerCase().includes(searchLower) ||
              (g.nameshort || '').toLowerCase().includes(searchLower)
          )
          .slice(0, 20)
          .map((g) => ({
            id: g.id,
            name: g.namedisplay || g.nameshort,
          }))
      } catch {
        return []
      }
    },
  },
}

// API base URL for ai-support-helper service
const AGENT_API_URL = 'http://ai-support-helper.localhost'

export default {
  name: 'ModSupportAIAssistant',
  setup() {
    const config = useRuntimeConfig()
    return { config }
  },
  data() {
    return {
      connected: false,
      connecting: true,
      connectionError: null,
      authExpired: false,
      question: '',
      messages: [], // Chat history
      isProcessing: false,
      currentStep: 'Thinking...',
      currentSessionId: null,
      pollInterval: null,
      showPrivacyModal: false,
    }
  },
  mounted() {
    this.checkConnection()
  },
  beforeUnmount() {
    this.stopPolling()
  },
  methods: {
    async checkConnection() {
      this.connecting = true
      this.connectionError = null

      try {
        const response = await fetch(`${AGENT_API_URL}/health`)
        if (response.ok) {
          this.connected = true
        } else {
          throw new Error('Health check failed')
        }
      } catch {
        this.connected = false
        this.connectionError =
          'AI Support Helper is not available. Please check the server is running.'
      } finally {
        this.connecting = false
      }
    },

    async submitQuestion() {
      if (!this.question.trim() || this.isProcessing || !this.connected) return

      const userQuestion = this.question.trim()
      this.question = ''

      // Add user message to chat
      this.messages.push({
        role: 'user',
        content: userQuestion,
      })
      this.scrollToBottom()

      // Add placeholder for assistant response
      const assistantMessage = reactive({
        role: 'assistant',
        content: '',
        queries: [],
        suggestedQueries: [],
        showQueries: false,
      })
      this.messages.push(assistantMessage)
      this.scrollToBottom()

      this.isProcessing = true
      this.currentStep = 'Starting investigation...'

      try {
        // Start the question
        const response = await fetch(`${AGENT_API_URL}/api/ask`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: userQuestion,
            conversationHistory: this.getConversationHistory(),
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to start question')
        }

        const { sessionId } = await response.json()
        this.currentSessionId = sessionId

        // Start polling for events
        this.startPolling(assistantMessage)
      } catch (error) {
        this.isProcessing = false
        assistantMessage.content = `Error: ${error.message}`
        this.scrollToBottom()
      }
    },

    startPolling(assistantMessage) {
      this.pollInterval = setInterval(async () => {
        if (!this.currentSessionId) {
          this.stopPolling()
          return
        }

        try {
          const response = await fetch(
            `${AGENT_API_URL}/api/poll/${this.currentSessionId}`
          )

          if (!response.ok) {
            if (response.status === 404) {
              this.stopPolling()
              assistantMessage.content =
                assistantMessage.content || 'Session expired.'
              this.isProcessing = false
            }
            return
          }

          const { events, status, answer, suggestedQueries } =
            await response.json()

          // Process events
          for (const event of events) {
            await this.handleEvent(event, assistantMessage)
          }

          // Check if complete
          if (status === 'complete' || status === 'error' || status === 'interrupted') {
            this.stopPolling()
            if (answer) {
              assistantMessage.content = answer
            }
            if (suggestedQueries?.length > 0) {
              assistantMessage.suggestedQueries = suggestedQueries
            }
            this.isProcessing = false
            this.scrollToBottom()
          }
        } catch {
          // Polling error - continue trying
        }
      }, 500) // Poll every 500ms
    },

    stopPolling() {
      if (this.pollInterval) {
        clearInterval(this.pollInterval)
        this.pollInterval = null
      }
      this.currentSessionId = null
    },

    async handleEvent(event, assistantMessage) {
      switch (event.type) {
        case 'thinking':
          this.currentStep = event.content
          this.scrollToBottom()
          break

        case 'fact_query':
          await this.handleFactQuery(event, assistantMessage)
          this.scrollToBottom()
          break

        case 'answer':
          assistantMessage.content = event.content
          this.scrollToBottom()
          break

        case 'error':
          if (event.code === 'AUTH_EXPIRED') {
            this.authExpired = true
          }
          assistantMessage.content = `Error: ${event.message}`
          this.stopPolling()
          this.isProcessing = false
          this.scrollToBottom()
          break

        case 'stopped':
          assistantMessage.content =
            assistantMessage.content || '(Processing was interrupted)'
          this.stopPolling()
          this.isProcessing = false
          this.scrollToBottom()
          break
      }
    },

    async handleFactQuery(event, assistantMessage) {
      const { queryId, query, params } = event

      // Add to queries list for transparency
      const queryRecord = reactive({
        query,
        params,
        status: 'pending',
        result: null,
        error: null,
      })
      assistantMessage.queries.push(queryRecord)
      this.currentStep = `Executing: ${query}...`

      // Execute the query locally
      let result = null
      let error = null

      try {
        const queryDef = QUERY_TYPES[query]
        if (!queryDef) {
          queryRecord.status = 'error'
          queryRecord.error = 'Unknown query type'
          error = 'Unknown query type'
        } else {
          result = await queryDef.execute(params, this.config)
          queryRecord.result = result
          queryRecord.status = 'complete'
        }
      } catch (e) {
        queryRecord.status = 'error'
        queryRecord.error = e.message
        error = e.message
      }

      // Send response back to container
      try {
        await fetch(
          `${AGENT_API_URL}/api/fact-response/${this.currentSessionId}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ queryId, result, error }),
          }
        )
      } catch {
        // Response send failed
      }
    },

    async stopProcessing() {
      if (this.currentSessionId) {
        try {
          await fetch(`${AGENT_API_URL}/api/stop/${this.currentSessionId}`, {
            method: 'POST',
          })
        } catch {
          // Stop request failed
        }
      }
      this.stopPolling()
      this.isProcessing = false
    },

    getConversationHistory() {
      // Return previous Q&A pairs for context
      return this.messages
        .filter((m) => m.role === 'user' || (m.role === 'assistant' && m.content))
        .map((m) => ({
          role: m.role,
          content: m.content,
        }))
        .slice(-10) // Last 10 messages
    },

    scrollToBottom() {
      this.$nextTick(() => {
        const chatContent = this.$refs.chatContent
        if (chatContent) {
          chatContent.scrollTop = chatContent.scrollHeight
        }
      })
    },

    formatParams(params) {
      if (!params) return ''
      return Object.entries(params)
        .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
        .join(', ')
    },

    formatAnswer(answer) {
      if (typeof answer === 'boolean') {
        return answer ? 'Yes' : 'No'
      }
      if (Array.isArray(answer)) {
        if (answer.length === 0) return '(empty)'
        if (answer.length <= 3) {
          return JSON.stringify(answer)
        }
        return `[${answer.length} items]`
      }
      if (typeof answer === 'object' && answer !== null) {
        return JSON.stringify(answer)
      }
      return String(answer)
    },

    formatMarkdown(text) {
      // Response is already HTML from the AI, just return it
      // Fall back to basic markdown conversion if needed
      if (!text) return ''
      if (text.includes('<p>') || text.includes('<h4>') || text.includes('<ul>')) {
        return text
      }
      // Fallback for any markdown that slips through
      return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/\n/g, '<br>')
    },
  },
}
</script>

<style scoped lang="scss">
.ai-chat-container {
  display: flex;
  flex-direction: column;
  height: 600px;
  max-height: 80vh;
  border: 1px solid #dee2e6;
  background: #f8f9fa;
}

.ai-chat-header {
  padding: 0.75rem 1rem;
  background: #ffffff;
  border-bottom: 1px solid #dee2e6;
}

.ai-chat-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.ai-chat-messages {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.ai-message {
  display: flex;
  max-width: 85%;
}

.ai-message--user {
  align-self: flex-end;

  .ai-message-content {
    background: #007bff;
    color: white;
  }
}

.ai-message--assistant {
  align-self: flex-start;

  .ai-message-content {
    background: #ffffff;
    border: 1px solid #dee2e6;
  }
}

.ai-message--system {
  align-self: center;
  max-width: 100%;

  .ai-message-content {
    background: transparent;
    text-align: center;
  }
}

.ai-message-content {
  padding: 0.75rem 1rem;
  word-wrap: break-word;
}

.ai-welcome-message {
  text-align: left;
}

.ai-queries {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid #dee2e6;
  font-size: 0.85em;
}

.ai-queries-header {
  cursor: pointer;
  color: #6c757d;

  &:hover {
    color: #495057;
  }
}

.ai-queries-list {
  margin-top: 0.5rem;
  padding-left: 1rem;
}

.ai-query-item {
  margin-bottom: 0.25rem;
}

.ai-suggested-queries {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: #fff3cd;
  border: 1px solid #ffc107;
  font-size: 0.85em;
}

.ai-typing {
  display: flex;
  align-items: center;
}

.ai-typing-dot {
  width: 8px;
  height: 8px;
  background: #6c757d;
  border-radius: 50%;
  margin-right: 4px;
  animation: typing 1.4s infinite ease-in-out both;

  &:nth-child(1) {
    animation-delay: -0.32s;
  }
  &:nth-child(2) {
    animation-delay: -0.16s;
  }
}

@keyframes typing {
  0%,
  80%,
  100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

.ai-chat-footer {
  padding: 0.75rem;
  background: #ffffff;
  border-top: 1px solid #dee2e6;
}

.ai-input-form {
  display: flex;
  gap: 0.5rem;
}

.ai-input {
  flex: 1;
  resize: none;
}

.ai-send-btn {
  align-self: flex-end;
}

code {
  background: #e9ecef;
  padding: 0.1rem 0.3rem;
  font-size: 0.85em;
}
</style>
