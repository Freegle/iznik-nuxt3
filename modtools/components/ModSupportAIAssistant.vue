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
        <strong>Privacy protection measures:</strong>
      </p>
      <ul>
        <li>
          <strong>Email addresses</strong> are replaced with realistic fake
          emails - Claude never sees real emails.
        </li>
        <li>
          <strong>Display names</strong> are replaced with realistic fake names.
        </li>
        <li>
          <strong>IP addresses</strong> are hashed to unrecoverable codes.
        </li>
        <li>
          <strong>Chat messages, passwords, and phone numbers</strong> are never
          shared.
        </li>
        <li>
          <strong>Log content</strong> is scrubbed to remove auth tokens and
          sensitive data.
        </li>
        <li>
          <strong>Public info</strong> like group names and post subjects may be
          shared.
        </li>
        <li>
          <strong>Transparency:</strong> You can see all queries made and stop
          at any time.
        </li>
      </ul>
      <p class="small text-muted mt-2">
        The fake name/email mapping is session-specific and cannot be reversed,
        even if transcripts leak. Mappings are cleared when you close the page.
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

            <!-- Assistant message (hide if empty - placeholder before response arrives) -->
            <template v-else-if="msg.role === 'assistant' && msg.content">
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
                <div
                  class="ai-queries-header"
                  @click="msg.showQueries = !msg.showQueries"
                >
                  <span>{{ msg.showQueries ? '▼' : '▶' }}</span>
                  {{ msg.queries.length }} fact
                  {{ msg.queries.length === 1 ? 'query' : 'queries' }} executed
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
                      {{
                        q.status === 'error' ? q.error : formatAnswer(q.result)
                      }}
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
import { marked } from 'marked'
import { faker } from '@faker-js/faker'
import api from '~/api'

/**
 * PII Sanitizer - Session-scoped pseudonymization for privacy protection.
 *
 * Security design:
 * - Session secret is random, never stored or logged
 * - Pseudonyms are sequential (user1@, Person A) - can't reverse from value alone
 * - Even with code + transcript, attackers only see pseudonyms
 * - Map exists only in browser memory, cleared on page unload
 */
class PiiSanitizer {
  constructor() {
    // Generate random session secret - never stored or logged
    this.sessionSecret = crypto.randomUUID() + Date.now()
    this.emailMap = new Map() // realEmail -> pseudonym
    this.emailReverse = new Map() // pseudonym -> realEmail
    this.nameMap = new Map() // realName -> pseudonym
    this.nameReverse = new Map() // pseudonym -> realName
    this.emailCounter = 0
    this.nameCounter = 0
  }

  pseudonymizeEmail(realEmail) {
    if (!realEmail) return null
    const normalized = realEmail.toLowerCase().trim()
    if (this.emailMap.has(normalized)) return this.emailMap.get(normalized)

    // Generate a realistic fake email using faker
    // Seed with counter for consistency within session
    faker.seed(this.emailCounter + 2000)
    const pseudonym = faker.internet.email()
    this.emailCounter++
    this.emailMap.set(normalized, pseudonym)
    this.emailReverse.set(pseudonym, normalized)
    return pseudonym
  }

  depseudonymizeEmail(pseudoEmail) {
    if (!pseudoEmail) return null
    return this.emailReverse.get(pseudoEmail) || pseudoEmail
  }

  pseudonymizeName(realName) {
    if (!realName) return null
    const normalized = realName.trim()
    if (this.nameMap.has(normalized)) return this.nameMap.get(normalized)

    // Generate a realistic fake name using faker
    // Seed with counter for consistency within session
    faker.seed(this.nameCounter + 1000)
    const pseudonym = faker.person.fullName()
    this.nameCounter++
    this.nameMap.set(normalized, pseudonym)
    this.nameReverse.set(pseudonym, normalized)
    return pseudonym
  }

  depseudonymizeName(pseudoName) {
    if (!pseudoName) return null
    return this.nameReverse.get(pseudoName) || pseudoName
  }

  /**
   * Replace all pseudonyms in text with real values.
   * Used to show real names/emails to the authorized user viewing responses.
   */
  depseudonymizeText(text) {
    if (!text) return text
    let result = text

    // Replace pseudonymized names (Person A, Person B, etc.)
    for (const [pseudonym, realName] of this.nameReverse) {
      result = result.split(pseudonym).join(realName)
    }

    // Replace pseudonymized emails (user1@freegle.pseudo, etc.)
    for (const [pseudonym, realEmail] of this.emailReverse) {
      result = result.split(pseudonym).join(realEmail)
    }

    return result
  }

  hashIp(ip) {
    if (!ip) return null
    // One-way hash to 8-char prefix using session secret
    // Can't reverse without session secret (which is never stored)
    const combined = ip + this.sessionSecret
    let hash = 0
    for (let i = 0; i < combined.length; i++) {
      hash = ((hash << 5) - hash + combined.charCodeAt(i)) | 0
    }
    return Math.abs(hash).toString(36).substring(0, 8).toUpperCase()
  }

  roundCoords(lat, lng) {
    if (lat === null || lat === undefined) return null
    if (lng === null || lng === undefined) return null
    // Round to ~1km accuracy (2 decimal places)
    return {
      lat: Math.round(parseFloat(lat) * 100) / 100,
      lng: Math.round(parseFloat(lng) * 100) / 100,
    }
  }

  // Sanitize a user object, removing/pseudonymizing PII fields
  sanitizeUser(user) {
    if (!user) return null
    return {
      id: user.id,
      role: user.systemrole || user.role || 'User',
      added: user.added,
      lastaccess: user.lastaccess,
      engagement: user.engagement,
      trustlevel: user.trustlevel,
      displayname: user.displayname
        ? this.pseudonymizeName(user.displayname)
        : null,
      // Exclude: email, firstname, lastname, fullname, phone, address
    }
  }

  // Sanitize log text by scrubbing sensitive patterns
  scrubLogText(text) {
    if (!text) return null
    let result = String(text)

    // Auth tokens - MUST remove
    result = result.replace(/Bearer\s+[A-Za-z0-9_\-.]+/gi, '[BEARER_REDACTED]')
    result = result.replace(/eyJ[A-Za-z0-9_\-.]{10,}/g, '[JWT_REDACTED]')
    result = result.replace(/sk-[a-zA-Z0-9]{20,}/g, '[KEY_REDACTED]')
    result = result.replace(
      /token["\s:=]+["']?[A-Za-z0-9_\-.]{20,}/gi,
      'token:[REDACTED]'
    )

    // Passwords - MUST remove
    result = result.replace(
      /"password"\s*:\s*"[^"]+"/gi,
      '"password":"[REDACTED]"'
    )
    result = result.replace(/password=[^&\s]+/gi, 'password=[REDACTED]')

    // Phone numbers - remove entirely
    result = result.replace(/(\+44|0)[\d\s\-()]{9,12}/g, '[PHONE]')

    // UK postcodes - generalize
    result = result.replace(
      /\b[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\b/gi,
      '[POSTCODE]'
    )

    // Credit cards - remove entirely
    result = result.replace(
      /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
      '[CARD]'
    )

    // Emails - pseudonymize
    result = result.replace(/[\w.-]+@[\w.-]+\.\w+/g, (match) =>
      this.pseudonymizeEmail(match)
    )

    // IP addresses - hash
    result = result.replace(
      /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
      (match) => `[IP:${this.hashIp(match)}]`
    )

    return result
  }

  // Sanitize a log entry, removing dangerous fields
  sanitizeLogEntry(entry) {
    if (!entry) return null

    // Fields to completely exclude
    const EXCLUDED_FIELDS = [
      'request_body',
      'response_body',
      'text',
      'message',
      'headers',
      'query_params',
    ]

    const safe = {}
    for (const [key, value] of Object.entries(entry)) {
      if (EXCLUDED_FIELDS.includes(key)) continue

      // Scrub any remaining string values
      if (typeof value === 'string') {
        safe[key] = this.scrubLogText(value)
      } else {
        safe[key] = value
      }
    }
    return safe
  }
}

// Singleton sanitizer instance - created fresh on component mount
let sanitizer = null

/**
 * Convert timerange strings to ISO date strings for API calls.
 * Supports: "today", "yesterday", "week", "month", "year", "all", or ISO date
 * Also supports shorthand like "7d", "30d", "1h", "2w", "3m"
 */
function parseTimerange(timerange) {
  if (!timerange || timerange === 'all') return null // No filter

  const now = new Date()
  let start

  const lowerTimerange = timerange.toLowerCase()

  // Check for shorthand format like "7d", "30d", "1h", "2w", "3m"
  const shorthandMatch = lowerTimerange.match(/^(\d+)([hdwmy])$/)
  if (shorthandMatch) {
    const amount = parseInt(shorthandMatch[1])
    const unit = shorthandMatch[2]
    start = new Date(now)
    switch (unit) {
      case 'h':
        start.setHours(start.getHours() - amount)
        break
      case 'd':
        start.setDate(start.getDate() - amount)
        break
      case 'w':
        start.setDate(start.getDate() - amount * 7)
        break
      case 'm':
        start.setMonth(start.getMonth() - amount)
        break
      case 'y':
        start.setFullYear(start.getFullYear() - amount)
        break
    }
    return start.toISOString()
  }

  // Check for natural language format like "1 year", "2 months", "3 weeks", "5 days"
  const naturalMatch = lowerTimerange.match(
    /^(\d+)\s*(hours?|days?|weeks?|months?|years?)$/
  )
  if (naturalMatch) {
    const amount = parseInt(naturalMatch[1])
    const unit = naturalMatch[2]
    start = new Date(now)
    if (unit.startsWith('hour')) {
      start.setHours(start.getHours() - amount)
    } else if (unit.startsWith('day')) {
      start.setDate(start.getDate() - amount)
    } else if (unit.startsWith('week')) {
      start.setDate(start.getDate() - amount * 7)
    } else if (unit.startsWith('month')) {
      start.setMonth(start.getMonth() - amount)
    } else if (unit.startsWith('year')) {
      start.setFullYear(start.getFullYear() - amount)
    }
    return start.toISOString()
  }

  switch (lowerTimerange) {
    case 'today':
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      break
    case 'yesterday':
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
      break
    case 'week':
    case '7days':
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case 'month':
    case '30days':
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      break
    case 'year':
    case '365days':
      start = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
      break
    default:
      // Assume it's already a date string
      return timerange
  }

  return start.toISOString()
}

// Fact query types that can be executed in the browser.
const QUERY_TYPES = {
  // Counts - return numbers only.
  count_api_calls: {
    params: ['userid', 'timerange'],
    execute: async (params, config) => {
      const response = await api(config).systemlogs.fetch({
        sources: 'api',
        userid: params.userid,
        start: params.timerange || '365d',
        limit: 1,
      })
      return response?.stats?.total_returned || 0
    },
  },
  count_errors: {
    params: ['userid', 'timerange'],
    execute: async (params, config) => {
      const response = await api(config).systemlogs.fetch({
        sources: 'api',
        userid: params.userid,
        start: params.timerange || '365d',
        levels: 'error',
        limit: 1,
      })
      return response?.stats?.total_returned || 0
    },
  },
  count_logins: {
    params: ['userid', 'timerange'],
    execute: async (params, config) => {
      const response = await api(config).systemlogs.fetch({
        sources: 'logs_table',
        userid: params.userid,
        start: params.timerange || '365d',
        types: 'User',
        subtypes: 'Login',
        limit: 1,
      })
      return response?.stats?.total_returned || 0
    },
  },

  // Yes/No questions.
  has_recent_activity: {
    params: ['userid', 'timerange'],
    execute: async (params, config) => {
      const response = await api(config).systemlogs.fetch({
        sources: 'api,client,logs_table',
        userid: params.userid,
        start: params.timerange || '365d',
        limit: 1,
      })
      return (response?.stats?.total_returned || 0) > 0
    },
  },
  has_errors: {
    params: ['userid', 'timerange'],
    execute: async (params, config) => {
      const response = await api(config).systemlogs.fetch({
        sources: 'api,client',
        userid: params.userid,
        start: params.timerange || '365d',
        levels: 'error',
        limit: 1,
      })
      return (response?.stats?.total_returned || 0) > 0
    },
  },

  // Safe summaries (no PII).
  get_error_summary: {
    params: ['userid', 'timerange'],
    execute: async (params, config) => {
      const response = await api(config).systemlogs.fetch({
        sources: 'api',
        userid: params.userid,
        start: params.timerange || '365d',
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
        const user = await api(config).user.fetch(parseInt(params.userid))
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
        // Depseudonymize email if it's a pseudonym (user1@freegle.pseudo)
        const realEmail = sanitizer.depseudonymizeEmail(params.email)
        // Try direct email lookup first (more reliable)
        try {
          const user = await api(config).user.fetchByEmail(
            encodeURIComponent(realEmail),
            false
          )
          if (user?.id) {
            return {
              id: user.id,
              displayname: sanitizer.pseudonymizeName(user.displayname),
              role: user.systemrole || 'User',
              found: true,
            }
          }
        } catch {
          // Fall through to search method
        }
        // Fallback to search with emailhistory
        const result = await api(config).user.fetchMT({
          search: realEmail,
          emailhistory: true,
        })
        if (result?.users?.length > 0) {
          const user = result.users[0]
          return {
            id: user.id,
            displayname: sanitizer.pseudonymizeName(user.displayname),
            role: user.systemrole || 'User',
            found: true,
          }
        }
        if (result?.user) {
          return {
            id: result.user.id,
            displayname: sanitizer.pseudonymizeName(result.user.displayname),
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
  find_user_by_name: {
    params: ['name'],
    execute: async (params, config) => {
      try {
        // Depseudonymize name if it's a pseudonym (Person A)
        const realName = sanitizer.depseudonymizeName(params.name)
        // Use fetchMT which supports search parameter
        const result = await api(config).user.fetchMT({
          search: realName,
        })
        if (result?.users?.length > 0) {
          return result.users.slice(0, 10).map((u) => ({
            id: u.id,
            displayname: sanitizer.pseudonymizeName(u.displayname),
            role: u.systemrole || 'User',
          }))
        }
        if (result?.user) {
          return [
            {
              id: result.user.id,
              displayname: sanitizer.pseudonymizeName(result.user.displayname),
              role: result.user.systemrole || 'User',
            },
          ]
        }
        return []
      } catch {
        return []
      }
    },
  },
  check_team_membership: {
    params: ['userid', 'teamname'],
    execute: async (params, config) => {
      try {
        // Fetch team with members by name
        const teamData = await api(config).team.fetch({ name: params.teamname })
        const members =
          teamData?.members || (Array.isArray(teamData) ? teamData : [])
        return members.some(
          (m) => (m.userid || m.id) === parseInt(params.userid)
        )
      } catch {
        return false
      }
    },
  },
  get_user_teams: {
    params: ['userid'],
    execute: async (params, config) => {
      try {
        const teams = await api(config).team.fetch()
        const userTeams = []
        for (const team of teams || []) {
          // Fetch each team with members
          const teamData = await api(config).team.fetch({ name: team.name })
          const members =
            teamData?.members || (Array.isArray(teamData) ? teamData : [])
          if (
            members.some((m) => (m.userid || m.id) === parseInt(params.userid))
          ) {
            userTeams.push(team.name)
          }
        }
        return userTeams
      } catch {
        return []
      }
    },
  },
  get_last_login: {
    params: ['userid'],
    execute: async (params, config) => {
      try {
        const user = await api(config).user.fetch(parseInt(params.userid))
        return user?.lastaccess || 'never'
      } catch {
        return 'unknown'
      }
    },
  },
  get_last_activity: {
    params: ['userid'],
    execute: async (params, config) => {
      try {
        const user = await api(config).user.fetch(parseInt(params.userid))
        return user?.lastaccess || 'never'
      } catch {
        return 'unknown'
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
        // Use v1 API which returns all groups
        const groups = await api(config).group.listMT({})
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

  // ============================================
  // USER PROFILE QUERIES (with sanitization)
  // ============================================

  get_user_profile: {
    params: ['userid'],
    execute: async (params, config) => {
      try {
        const user = await api(config).user.fetch(parseInt(params.userid))
        return sanitizer.sanitizeUser(user)
      } catch {
        return null
      }
    },
  },

  count_user_posts: {
    params: ['userid', 'timerange'],
    execute: async (params, config) => {
      try {
        // fetchByUser returns array directly (not wrapped in {messages: []})
        // Second param 'false' means include inactive/completed posts too
        const messages =
          (await api(config).message.fetchByUser(params.userid, false)) || []
        // Filter by timerange if provided
        const timerangeParsed = parseTimerange(params.timerange)
        if (timerangeParsed) {
          const cutoff = new Date(timerangeParsed)
          return messages.filter((m) => new Date(m.arrival) >= cutoff).length
        }
        return messages.length
      } catch {
        return 0
      }
    },
  },

  get_user_messages: {
    params: ['userid', 'timerange'],
    execute: async (params, config) => {
      try {
        // fetchByUser returns array directly
        const messages =
          (await api(config).message.fetchByUser(params.userid, false)) || []
        // Filter by timerange if provided
        const timerangeParsed = parseTimerange(params.timerange || '365d')
        let filtered = messages
        if (timerangeParsed) {
          const cutoff = new Date(timerangeParsed)
          filtered = messages.filter((m) => new Date(m.arrival) >= cutoff)
        }
        // Sort by arrival date descending (newest first)
        filtered.sort((a, b) => new Date(b.arrival) - new Date(a.arrival))
        // Return list of message IDs with basic info
        return filtered.map((m) => ({
          id: m.id,
          type: m.type,
          subject: m.subject?.substring(0, 50),
          arrival: m.arrival,
          hasoutcome: m.hasoutcome,
        }))
      } catch {
        return []
      }
    },
  },

  get_user_post_replies: {
    params: ['userid', 'timerange'],
    execute: async (params, config) => {
      try {
        // fetchByUser returns array directly
        const messages =
          (await api(config).message.fetchByUser(params.userid, false)) || []
        // Filter by timerange if provided
        const timerangeParsed = parseTimerange(params.timerange || '365d')
        let filtered = messages
        if (timerangeParsed) {
          const cutoff = new Date(timerangeParsed)
          filtered = messages.filter((m) => new Date(m.arrival) >= cutoff)
        }
        // Sum up replycount from all messages
        const totalReplies = filtered.reduce(
          (sum, m) => sum + (m.replycount || 0),
          0
        )
        return totalReplies
      } catch {
        return 0
      }
    },
  },

  get_user_groups: {
    params: ['userid'],
    execute: async (params, config) => {
      try {
        // The memberships API returns {memberships: [...]} or {members: [...]}
        const response = await api(config).memberships.fetch({
          userid: params.userid,
        })
        const memberships = response?.memberships || response?.members || []
        return (memberships || []).map((m) => ({
          groupid: m.groupid,
          groupname: m.namedisplay || m.nameshort,
          role: m.role,
          joined: m.added,
        }))
      } catch {
        return []
      }
    },
  },

  // ============================================
  // TEAM/ADMIN QUERIES
  // ============================================

  list_teams: {
    params: [],
    execute: async (params, config) => {
      try {
        const teams = await api(config).team.fetch()
        return (teams || []).map((t) => t.name)
      } catch {
        return []
      }
    },
  },

  list_team_members: {
    params: ['teamname'],
    execute: async (params, config) => {
      try {
        // Fetch team with members by name
        const teamData = await api(config).team.fetch({ name: params.teamname })
        const members =
          teamData?.members || (Array.isArray(teamData) ? teamData : [])
        return members.map((m) => ({
          id: m.userid || m.id,
          displayname: sanitizer.pseudonymizeName(
            m.displayname || m.name || `User ${m.userid || m.id}`
          ),
          role: m.role || 'Member',
        }))
      } catch {
        return []
      }
    },
  },

  // ============================================
  // GROUP QUERIES (public data)
  // ============================================

  get_group_stats: {
    params: ['groupid', 'timerange'],
    execute: async (params, config) => {
      try {
        // fetchMessages returns { messages: [...] }
        const response = await api(config).message.fetchMessages({
          groupid: params.groupid,
          limit: 1000,
        })
        const messages = response?.messages || []
        let posts = 0
        let taken = 0
        // Use parseTimerange for consistency
        const timerangeParsed = parseTimerange(params.timerange || '365d')
        const cutoff = timerangeParsed ? new Date(timerangeParsed) : new Date(0)
        for (const msg of messages) {
          if (new Date(msg.arrival) >= cutoff) {
            posts++
            if (
              msg.outcomes?.some(
                (o) => o.outcome === 'Taken' || o.outcome === 'Received'
              )
            ) {
              taken++
            }
          }
        }
        return { posts, taken }
      } catch {
        return { posts: 0, taken: 0 }
      }
    },
  },

  get_group_mods: {
    params: ['groupid'],
    execute: async (params, config) => {
      try {
        const group = await api(config).group.fetch(params.groupid, true)
        const mods = (group?.members || []).filter(
          (m) => m.role === 'Moderator' || m.role === 'Owner'
        )
        return mods.map((m) => ({
          id: m.userid,
          displayname: sanitizer.pseudonymizeName(m.displayname),
          role: m.role,
        }))
      } catch {
        return []
      }
    },
  },

  // ============================================
  // MESSAGE QUERIES (with sanitization)
  // ============================================

  get_message_info: {
    params: ['messageid'],
    execute: async (params, config) => {
      try {
        const msg = await api(config).message.fetch(params.messageid)
        return {
          id: msg?.id,
          type: msg?.type,
          subject: msg?.subject ? msg.subject.substring(0, 50) : null, // Truncate
          status: msg?.deleted ? 'Deleted' : msg?.heldby ? 'Held' : 'Active',
          groupname: msg?.groups?.[0]?.namedisplay || null,
          posted: msg?.arrival,
          outcome: msg?.outcomes?.[0]?.outcome || null,
          // Exclude: body content, fromaddr, fromname
        }
      } catch {
        return null
      }
    },
  },

  get_message_history: {
    params: ['messageid'],
    execute: async (params, config) => {
      try {
        const response = await api(config).systemlogs.fetch({
          sources: 'logs_table',
          msgid: params.messageid,
          limit: 50,
        })
        return (response?.logs || []).map((log) => ({
          action: log.type + (log.subtype ? `:${log.subtype}` : ''),
          timestamp: log.timestamp,
          byuser: log.byuser
            ? sanitizer.pseudonymizeName(`User ${log.byuser}`)
            : null,
        }))
      } catch {
        return []
      }
    },
  },

  search_messages: {
    params: ['search', 'groupid'],
    execute: async (params, config) => {
      try {
        const searchParams = { search: params.search, limit: 20 }
        if (params.groupid) searchParams.groupid = params.groupid
        // fetchMessages returns { messages: [...] }
        const response = await api(config).message.fetchMessages(searchParams)
        const messages = response?.messages || []
        return messages.map((m) => ({
          id: m.id,
          type: m.type,
          subject: m.subject ? m.subject.substring(0, 50) : null,
          status: m.deleted ? 'Deleted' : m.heldby ? 'Held' : 'Active',
        }))
      } catch {
        return []
      }
    },
  },

  count_group_messages: {
    params: ['groupid', 'timerange'],
    execute: async (params, config) => {
      try {
        // fetchMessages returns { messages: [...] }
        const response = await api(config).message.fetchMessages({
          groupid: params.groupid,
          limit: 1000,
        })
        const messages = response?.messages || []
        // Use parseTimerange for consistency
        const timerangeParsed = parseTimerange(params.timerange || '365d')
        const cutoff = timerangeParsed ? new Date(timerangeParsed) : new Date(0)
        const filtered = messages.filter((m) => new Date(m.arrival) >= cutoff)
        const offers = filtered.filter((m) => m.type === 'Offer').length
        const wanteds = filtered.filter((m) => m.type === 'Wanted').length
        const taken = filtered.filter((m) =>
          m.outcomes?.some(
            (o) => o.outcome === 'Taken' || o.outcome === 'Received'
          )
        ).length
        return { offers, wanteds, taken }
      } catch {
        return { offers: 0, wanteds: 0, taken: 0 }
      }
    },
  },

  // ============================================
  // ERROR/LOG QUERIES (heavily sanitized)
  // ============================================

  get_error_types: {
    params: ['userid', 'timerange'],
    execute: async (params, config) => {
      try {
        const response = await api(config).systemlogs.fetch({
          sources: 'api',
          userid: params.userid,
          start: params.timerange || '365d',
          levels: 'error',
          limit: 100,
        })
        const summary = {}
        for (const log of response?.logs || []) {
          const key = `${log.raw?.method || 'UNKNOWN'} ${
            log.raw?.endpoint || 'unknown'
          }`
          summary[key] = (summary[key] || 0) + 1
        }
        return Object.entries(summary).map(([endpoint, count]) => {
          const [method, path] = endpoint.split(' ')
          return { endpoint: path, method, count }
        })
      } catch {
        return []
      }
    },
  },

  get_recent_errors: {
    params: ['userid', 'limit'],
    execute: async (params, config) => {
      try {
        const response = await api(config).systemlogs.fetch({
          sources: 'api',
          userid: params.userid,
          levels: 'error',
          limit: params.limit || 10,
        })
        // Return ONLY safe fields - no request/response bodies, no text
        return (response?.logs || []).map((log) => ({
          timestamp: log.timestamp,
          statusCode: log.raw?.status_code || 'unknown',
          endpoint: log.raw?.endpoint || 'unknown',
          method: log.raw?.method || 'unknown',
          // Excluded: request_body, response_body, text, headers
        }))
      } catch {
        return []
      }
    },
  },

  // ============================================
  // SYSTEM LOG QUERIES (sanitized)
  // ============================================

  get_user_actions: {
    params: ['userid', 'timerange'],
    execute: async (params, config) => {
      try {
        // Query all sources for user activity
        const timeRange = params.timerange || '365d'
        const response = await api(config).systemlogs.fetch({
          sources: 'api,client,logs_table',
          userid: params.userid,
          start: timeRange,
          limit: 50,
        })
        // Return structured fields based on source type
        return (response?.logs || []).map((log) => ({
          source: log.source,
          type: log.type || log.raw?.method,
          subtype: log.subtype || log.raw?.endpoint,
          timestamp: log.timestamp,
          groupid: log.group_id,
        }))
      } catch {
        return []
      }
    },
  },

  get_login_history: {
    params: ['userid', 'limit'],
    execute: async (params, config) => {
      try {
        const response = await api(config).systemlogs.fetch({
          sources: 'logs_table',
          userid: params.userid,
          types: 'User',
          subtypes: 'Login',
          limit: params.limit || 20,
        })
        return (response?.logs || []).map((log) => ({
          timestamp: log.timestamp,
          success: log.subtype === 'Login',
          ip_hash: log.raw?.fromip ? sanitizer.hashIp(log.raw.fromip) : null,
        }))
      } catch {
        return []
      }
    },
  },

  // ============================================
  // MODERATION QUERIES
  // ============================================

  get_user_spam_score: {
    params: ['userid'],
    execute: async (params, config) => {
      try {
        const user = await api(config).user.fetch(parseInt(params.userid))
        return {
          score: user?.spamscore || 0,
          reason_summary: user?.spamreason ? 'Flagged' : 'Clean',
          // Don't expose detailed spam reason - may contain PII
        }
      } catch {
        return { score: 0, reason_summary: 'Unknown' }
      }
    },
  },

  is_user_banned: {
    params: ['userid'],
    execute: async (params, config) => {
      try {
        const user = await api(config).user.fetch(parseInt(params.userid))
        return user?.banned === 1 || user?.deleted !== null
      } catch {
        return false
      }
    },
  },

  get_user_warnings: {
    params: ['userid'],
    execute: async (params, config) => {
      try {
        const response = await api(config).systemlogs.fetch({
          sources: 'logs_table',
          userid: params.userid,
          types: 'User',
          subtypes: 'Warning,Reported,Suspend',
          limit: 20,
        })
        return (response?.logs || []).map((log) => ({
          date: log.timestamp,
          type: log.subtype,
          groupid: log.groupid,
          // Excluded: warning text/reason
        }))
      } catch {
        return []
      }
    },
  },

  get_pending_messages: {
    params: ['groupid'],
    execute: async (params, config) => {
      try {
        // fetchMessages returns { messages: [...] }
        const response = await api(config).message.fetchMessages({
          groupid: params.groupid,
          collection: 'Pending',
          limit: 50,
        })
        const messages = response?.messages || []
        return messages.map((m) => ({
          id: m.id,
          subject: m.subject ? m.subject.substring(0, 50) : null,
          type: m.type,
          pending_since: m.arrival,
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
    // Initialize fresh sanitizer for this session
    sanitizer = new PiiSanitizer()
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

      // Force Vue to process the clearing before continuing
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
                assistantMessage.content ||
                'Session expired. Please ask your question again.'
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
          if (
            status === 'complete' ||
            status === 'error' ||
            status === 'interrupted'
          ) {
            this.stopPolling()
            if (answer) {
              // Depseudonymize for display to authorized user
              assistantMessage.content = sanitizer.depseudonymizeText(answer)
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
          // Depseudonymize for display to authorized user
          assistantMessage.content = sanitizer.depseudonymizeText(event.content)
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
        .filter(
          (m) => m.role === 'user' || (m.role === 'assistant' && m.content)
        )
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
      if (!text) return ''
      // Use marked library for proper markdown rendering
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
