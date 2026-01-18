<template>
  <div class="ai-chat-container">
    <!-- Privacy Info Modal -->
    <b-modal
      v-model="showPrivacyModal"
      title="Privacy &amp; Legal Compliance"
      ok-only
      ok-title="I Understand"
      centered
      size="lg"
    >
      <h6>How This System Protects Privacy</h6>
      <p>
        This assistant uses Claude AI with <strong>pseudonymization</strong> - a
        technique endorsed by the ICO (Information Commissioner's Office) for
        privacy-preserving data analysis.
      </p>

      <h6>What is Pseudonymization?</h6>
      <p>
        Personal data is replaced with consistent tokens (e.g.,
        "john@example.com" becomes "TOKEN_a8f3"). The mapping key is kept
        securely within Freegle's infrastructure and
        <strong>never shared with Anthropic/Claude</strong>.
      </p>

      <h6>ICO Guidance Compliance</h6>
      <p class="small">
        From the
        <a
          href="https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/data-sharing/anonymisation/pseudonymisation/"
          target="_blank"
          rel="noopener"
          >ICO Pseudonymisation Guidance</a
        >:
      </p>
      <blockquote class="small border-left pl-3 text-muted">
        "Pseudonymised data in the hands of an organisation that does not have
        access to the key – or any other means of identifying those individuals
        – may be considered anonymous data."
      </blockquote>
      <p class="small">
        This means: <strong>Freegle</strong> (has key) treats data as personal
        data with full GDPR compliance. <strong>Anthropic</strong> (no key)
        receives effectively anonymous data - tokens are meaningless without the
        key.
      </p>

      <h6>Architecture</h6>
      <ul class="small">
        <li>
          <strong>Query Sanitizer</strong> - Replaces PII with tokens before
          sending to Claude
        </li>
        <li>
          <strong>Pseudonymizer</strong> - Has the key, queries logs, returns
          tokenized results
        </li>
        <li>
          <strong>Claude Code</strong> - Has read-only access to codebase for
          system knowledge
        </li>
      </ul>

      <h6>What Claude Never Sees</h6>
      <ul class="small">
        <li>Real email addresses or names</li>
        <li>Passwords, phone numbers, or postcodes</li>
        <li>Authentication tokens or session data</li>
        <li>Chat message contents</li>
      </ul>

      <p class="small text-muted mt-3">
        Session mappings are cryptographically random and cleared when you close
        this page. Even if conversation transcripts were leaked, attackers would
        only see meaningless tokens.
      </p>
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

    <NoticeMessage v-if="needsLogin && !authExpired" variant="info" class="m-2">
      <strong>Claude authentication required.</strong><br />
      <span v-if="loginUrl">
        Click the button below to authenticate with your Anthropic account.
        <div class="mt-2">
          <b-button
            variant="primary"
            size="sm"
            :href="loginUrl"
            target="_blank"
            rel="noopener"
            class="mr-2"
          >
            Open Login Page
          </b-button>
          <b-button
            variant="outline-secondary"
            size="sm"
            :disabled="checkingAuth"
            @click="checkAuthStatus"
          >
            <b-spinner v-if="checkingAuth" small class="mr-1" />
            Check Authentication
          </b-button>
        </div>
      </span>
      <span v-else>
        <b-button
          variant="primary"
          size="sm"
          :disabled="startingAuth"
          @click="startAuthFlow"
        >
          <b-spinner v-if="startingAuth" small class="mr-1" />
          Login with Claude
        </b-button>
      </span>
    </NoticeMessage>

    <NoticeMessage v-if="authExpired" variant="warning" class="m-2">
      <strong>Claude authentication has expired.</strong><br />
      <b-button
        variant="primary"
        size="sm"
        :disabled="startingAuth"
        class="mt-2"
        @click="startAuthFlow"
      >
        <b-spinner v-if="startingAuth" small class="mr-1" />
        Re-authenticate with Claude
      </b-button>
    </NoticeMessage>

    <!-- Chat messages area -->
    <div ref="chatContent" class="ai-chat-content">
      <div class="ai-chat-messages">
        <!-- Welcome message -->
        <div v-if="messages.length === 0" class="ai-welcome-message">
          <div class="ai-message ai-message--assistant">
            <div class="ai-message-content">
              Hello! I'm the AI Support Helper. I can answer questions about how
              the Freegle website works or investigate specific problems for
              freeglers. What would you like to know?
            </div>
          </div>
        </div>

        <!-- Message history -->
        <div
          v-for="(msg, idx) in messages"
          v-show="msg.role !== 'assistant' || msg.content"
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
            <!-- eslint-disable-next-line vue/no-v-html -->
            <template v-else-if="msg.role === 'assistant' && msg.content">
              <div v-html="formatMarkdown(msg.content)" />
            </template>

            <!-- System/status message -->
            <template v-else-if="msg.role === 'system'">
              <div class="text-muted small">
                <em>{{ msg.content }}</em>
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
import { marked } from 'marked'

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
      needsLogin: false,
      loginUrl: null,
      startingAuth: false,
      checkingAuth: false,
      question: '',
      messages: [],
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
      this.needsLogin = false
      this.loginUrl = null

      try {
        const response = await fetch(`${AGENT_API_URL}/health`)
        if (response.ok) {
          const data = await response.json()
          this.connected = true

          // Check auth status from health response
          if (data.auth) {
            if (data.auth.needsLogin) {
              this.needsLogin = true
              this.connected = false
            }
            if (data.auth.loginUrl) {
              this.loginUrl = data.auth.loginUrl
            }
          }
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

    async startAuthFlow() {
      this.startingAuth = true
      this.authExpired = false

      try {
        const response = await fetch(`${AGENT_API_URL}/api/auth/start`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })

        if (response.ok) {
          const data = await response.json()

          if (data.status === 'already_authenticated') {
            await this.checkConnection()
            return
          }

          if (data.loginUrl) {
            this.loginUrl = data.loginUrl
            this.needsLogin = true
          } else if (data.status === 'manual_required') {
            this.connectionError =
              'Could not start automatic auth. Please run "claude" in a terminal on the server.'
          }
        } else {
          throw new Error('Auth start failed')
        }
      } catch (error) {
        this.connectionError = `Failed to start authentication: ${error.message}`
      } finally {
        this.startingAuth = false
      }
    },

    async checkAuthStatus() {
      this.checkingAuth = true

      try {
        const response = await fetch(`${AGENT_API_URL}/api/auth/check`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })

        if (response.ok) {
          const data = await response.json()

          if (data.status === 'authenticated') {
            this.needsLogin = false
            this.loginUrl = null
            this.authExpired = false
            await this.checkConnection()
          } else {
            this.connectionError =
              'Authentication not complete. Please visit the login URL and try again.'
          }
        }
      } catch (error) {
        this.connectionError = `Failed to check authentication: ${error.message}`
      } finally {
        this.checkingAuth = false
      }
    },

    async submitQuestion() {
      if (!this.question.trim() || this.isProcessing || !this.connected) return

      const userQuestion = this.question.trim()
      this.question = ''

      await this.$nextTick()

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
      })
      this.messages.push(assistantMessage)
      this.scrollToBottom()

      this.isProcessing = true
      this.currentStep = 'Starting investigation...'

      try {
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
                assistantMessage.content ||
                'Session expired. Please ask your question again.'
              this.isProcessing = false
            }
            return
          }

          const { events, status, answer } = await response.json()

          // Process events
          for (const event of events) {
            this.handleEvent(event, assistantMessage)
          }

          // Check if complete
          if (
            status === 'complete' ||
            status === 'error' ||
            status === 'interrupted'
          ) {
            this.stopPolling()
            if (answer) {
              assistantMessage.content = answer
            }
            this.isProcessing = false
            this.scrollToBottom()
          }
        } catch {
          // Polling error - continue trying
        }
      }, 500)
    },

    stopPolling() {
      if (this.pollInterval) {
        clearInterval(this.pollInterval)
        this.pollInterval = null
      }
      this.currentSessionId = null
    },

    handleEvent(event, assistantMessage) {
      switch (event.type) {
        case 'thinking':
          this.currentStep = event.content
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
      return this.messages
        .filter(
          (m) => m.role === 'user' || (m.role === 'assistant' && m.content)
        )
        .map((m) => ({
          role: m.role,
          content: m.content,
        }))
        .slice(-10)
    },

    scrollToBottom() {
      this.$nextTick(() => {
        const chatContent = this.$refs.chatContent
        if (chatContent) {
          chatContent.scrollTop = chatContent.scrollHeight
        }
      })
    },

    formatMarkdown(text) {
      if (!text) return ''
      return marked(text)
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
    opacity: 0.3;
  }
  40% {
    opacity: 1;
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
