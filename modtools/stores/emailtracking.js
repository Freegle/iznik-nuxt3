import { defineStore } from 'pinia'
import api from '~/api'

export const useEmailTrackingStore = defineStore({
  id: 'emailtracking',
  state: () => ({
    // Aggregate statistics.
    stats: null,
    ampStats: null,
    statsLoading: false,
    statsError: null,

    // Time series data for charts.
    timeSeries: [],
    timeSeriesLoading: false,
    timeSeriesError: null,

    // Stats by email type for comparison charts.
    statsByType: [],
    statsByTypeLoading: false,
    statsByTypeError: null,

    // Top clicked links.
    clickedLinks: [],
    clickedLinksTotal: 0,
    clickedLinksLoading: false,
    clickedLinksError: null,
    showAllClickedLinks: false,
    aggregateClickedLinks: true,

    // User email history.
    userEmails: [],
    userEmailsTotal: 0,
    userEmailsLoading: false,
    userEmailsError: null,

    // Email types for filtering.
    emailTypes: [],

    // Current filters.
    filters: {
      type: '',
      start: '',
      end: '',
    },

    // Current user ID or email being viewed.
    currentUserId: null,
    currentEmail: null,

    // Pagination for user emails.
    limit: 50,
    offset: 0,

    // Incoming email state (from Loki logs).
    incomingEntries: [],
    incomingLoading: false,
    incomingError: null,
    incomingHasMore: true,
    incomingSearch: '',
    incomingTimeRange: '24h',
    incomingOutcomeFilter: '',
    incomingCounts: {},
    incomingCountsTotal: 0,
    incomingCountsLoading: false,

    // Bounce entries (from Loki logs).
    bounceEntries: [],
    bounceLoading: false,
    bounceError: null,
  }),
  actions: {
    init(config) {
      this.config = config
    },

    clear() {
      this.stats = null
      this.ampStats = null
      this.statsError = null
      this.timeSeries = []
      this.timeSeriesError = null
      this.statsByType = []
      this.statsByTypeError = null
      this.clickedLinks = []
      this.clickedLinksTotal = 0
      this.clickedLinksError = null
      this.showAllClickedLinks = false
      this.aggregateClickedLinks = true
      this.userEmails = []
      this.userEmailsTotal = 0
      this.userEmailsError = null
      this.currentUserId = null
      this.currentEmail = null
      this.offset = 0
    },

    clearStats() {
      this.stats = null
      this.ampStats = null
      this.statsError = null
    },

    clearUserEmails() {
      this.userEmails = []
      this.userEmailsTotal = 0
      this.userEmailsError = null
      this.currentUserId = null
      this.currentEmail = null
      this.offset = 0
    },

    setFilters(filters) {
      this.filters = { ...this.filters, ...filters }
    },

    async fetchStats() {
      this.statsLoading = true
      this.statsError = null

      try {
        const params = {}
        if (this.filters.type) {
          params.type = this.filters.type
        }
        if (this.filters.start) {
          params.start = this.filters.start
        }
        if (this.filters.end) {
          params.end = this.filters.end
        }

        const response = await api(this.config).emailtracking.fetchStats(params)
        this.stats = response.stats
        this.ampStats = response.amp_stats || null
      } catch (e) {
        this.statsError = e.message || 'Failed to fetch email statistics'
        console.error('Email stats fetch error:', e)
      } finally {
        this.statsLoading = false
      }
    },

    async fetchTimeSeries() {
      this.timeSeriesLoading = true
      this.timeSeriesError = null

      try {
        const params = {}
        if (this.filters.type) {
          params.type = this.filters.type
        }
        if (this.filters.start) {
          params.start = this.filters.start
        }
        if (this.filters.end) {
          params.end = this.filters.end
        }

        const response = await api(this.config).emailtracking.fetchTimeSeries(
          params
        )
        this.timeSeries = response.data || []
      } catch (e) {
        this.timeSeriesError = e.message || 'Failed to fetch time series data'
        console.error('Time series fetch error:', e)
      } finally {
        this.timeSeriesLoading = false
      }
    },

    async fetchStatsByType() {
      this.statsByTypeLoading = true
      this.statsByTypeError = null

      try {
        const params = {}
        if (this.filters.start) {
          params.start = this.filters.start
        }
        if (this.filters.end) {
          params.end = this.filters.end
        }

        const response = await api(this.config).emailtracking.fetchStatsByType(
          params
        )
        this.statsByType = response.data || []
      } catch (e) {
        this.statsByTypeError =
          e.message || 'Failed to fetch stats by email type'
        console.error('Stats by type fetch error:', e)
      } finally {
        this.statsByTypeLoading = false
      }
    },

    async fetchClickedLinks(showAll = false) {
      this.clickedLinksLoading = true
      this.clickedLinksError = null
      this.showAllClickedLinks = showAll

      try {
        const params = {
          limit: showAll ? 0 : 5,
          aggregate: this.aggregateClickedLinks ? 'true' : 'false',
        }
        if (this.filters.start) {
          params.start = this.filters.start
        }
        if (this.filters.end) {
          params.end = this.filters.end
        }

        const response = await api(
          this.config
        ).emailtracking.fetchTopClickedLinks(params)
        // Filter out internal amp:// tracking URLs (amp://render, amp://reply)
        const links = (response.data || []).filter((link) => {
          const url = link.url || link.normalized_url || ''
          return !url.startsWith('amp://')
        })
        this.clickedLinks = links
        // Adjust total to account for filtered items
        const filteredCount = (response.data || []).length - links.length
        this.clickedLinksTotal = Math.max(
          0,
          (response.total || 0) - filteredCount
        )
      } catch (e) {
        this.clickedLinksError = e.message || 'Failed to fetch clicked links'
        console.error('Clicked links fetch error:', e)
      } finally {
        this.clickedLinksLoading = false
      }
    },

    toggleShowAllClickedLinks() {
      this.fetchClickedLinks(!this.showAllClickedLinks)
    },

    toggleAggregateClickedLinks() {
      this.aggregateClickedLinks = !this.aggregateClickedLinks
      this.fetchClickedLinks(this.showAllClickedLinks)
    },

    async fetchUserEmails(userIdOrEmail, append = false) {
      if (!userIdOrEmail) return

      this.userEmailsLoading = true
      this.userEmailsError = null

      if (!append) {
        this.offset = 0
        this.userEmails = []
        this.currentUserId = null
        this.currentEmail = null
      }

      try {
        const response = await api(this.config).emailtracking.fetchUserEmails(
          userIdOrEmail,
          {
            limit: this.limit,
            offset: this.offset,
          }
        )

        // Store the resolved user ID or email from the response.
        if (response.userid) {
          this.currentUserId = response.userid
          this.currentEmail = null
        } else if (response.email) {
          // Response was from searching by recipient_email
          this.currentEmail = response.email
          this.currentUserId = null
        } else if (typeof userIdOrEmail === 'number') {
          this.currentUserId = userIdOrEmail
        } else if (
          typeof userIdOrEmail === 'string' &&
          userIdOrEmail.includes('@')
        ) {
          this.currentEmail = userIdOrEmail
        }

        if (append) {
          this.userEmails.push(...(response.emails || []))
        } else {
          this.userEmails = response.emails || []
        }
        this.userEmailsTotal = response.total || 0

        // If no emails found, set a friendly message rather than leaving it empty
        if (this.userEmails.length === 0 && this.userEmailsTotal === 0) {
          const searchTerm =
            typeof userIdOrEmail === 'string' && userIdOrEmail.includes('@')
              ? userIdOrEmail
              : `user #${userIdOrEmail}`
          this.userEmailsError = `No email history found for ${searchTerm}.`
        }
      } catch (e) {
        // Provide a user-friendly error message
        const searchTerm =
          typeof userIdOrEmail === 'string' && userIdOrEmail.includes('@')
            ? userIdOrEmail
            : `user #${userIdOrEmail}`
        this.userEmailsError = `No email history found for ${searchTerm}.`
        console.error('User emails fetch error:', e)
      } finally {
        this.userEmailsLoading = false
      }
    },

    async loadMoreUserEmails() {
      if (this.userEmailsLoading || !this.hasMoreUserEmails) return

      this.offset += this.limit
      // Use whichever identifier we have (userId or email)
      const identifier = this.currentUserId || this.currentEmail
      await this.fetchUserEmails(identifier, true)
    },

    setUserFilter(userId) {
      if (userId !== this.currentUserId) {
        this.clearUserEmails()
        this.currentUserId = userId
      }
    },

    // Incoming email actions.
    async fetchIncomingEmails(append = false) {
      this.incomingLoading = true
      this.incomingError = null

      try {
        const params = {
          sources: 'incoming_mail',
          limit: 100,
          start: this.incomingTimeRange,
        }

        // Server-side search filtering.
        if (this.incomingSearch) {
          params.search = this.incomingSearch
        }

        // Server-side outcome filtering.
        if (this.incomingOutcomeFilter) {
          params.subtypes = this.incomingOutcomeFilter
        }

        if (append && this.incomingEntries.length > 0) {
          const lastEntry =
            this.incomingEntries[this.incomingEntries.length - 1]
          params.end = lastEntry.timestamp
        }

        const result = await api(this.config).systemlogs.fetch(params)
        const logs = result?.logs || []

        const parsed = logs.map((log) => {
          const raw = log.raw || {}
          return {
            id: log.id,
            timestamp: log.timestamp,
            envelope_from: raw.envelope_from || '',
            envelope_to: raw.envelope_to || '',
            from_address: raw.from_address || '',
            subject: raw.subject || '',
            message_id: raw.message_id || '',
            routing_outcome: raw.routing_outcome || log.subtype || '',
            group_id: raw.group_id || null,
            group_name: raw.group_name || '',
            user_id: raw.user_id || null,
            to_user_id: raw.to_user_id || null,
            chat_id: raw.chat_id || null,
            message_ref_id: raw.message_id_ref || null,
          }
        })

        if (append) {
          this.incomingEntries = [...this.incomingEntries, ...parsed]
        } else {
          this.incomingEntries = parsed
        }

        this.incomingHasMore = logs.length >= 100
      } catch (e) {
        this.incomingError = e.message || 'Failed to fetch incoming email logs'
      } finally {
        this.incomingLoading = false
      }
    },

    async fetchIncomingCounts() {
      this.incomingCountsLoading = true

      try {
        const params = {
          sources: 'incoming_mail',
          start: this.incomingTimeRange,
        }

        // Include search in counts so they reflect filtered totals.
        if (this.incomingSearch) {
          params.search = this.incomingSearch
        }

        const result = await api(this.config).systemlogs.fetchCounts(params)
        this.incomingCounts = result?.counts || {}
        this.incomingCountsTotal = result?.total || 0
      } catch (e) {
        console.error('Failed to fetch incoming counts:', e)
        this.incomingCounts = {}
        this.incomingCountsTotal = 0
      } finally {
        this.incomingCountsLoading = false
      }
    },

    clearIncoming() {
      this.incomingEntries = []
      this.incomingHasMore = true
      this.incomingError = null
      this.incomingSearch = ''
      this.incomingOutcomeFilter = ''
      this.incomingCounts = {}
      this.incomingCountsTotal = 0
    },

    async fetchBounceEvents() {
      this.bounceLoading = true
      this.bounceError = null

      try {
        const params = {
          sources: 'bounce',
          limit: 500,
          start: this.incomingTimeRange,
        }

        const result = await api(this.config).systemlogs.fetch(params)
        const logs = result?.logs || []

        this.bounceEntries = logs.map((log) => {
          const raw = log.raw || {}
          return {
            id: log.id,
            timestamp: log.timestamp,
            email: raw.email || '',
            user_id: raw.user_id || 0,
            is_permanent: raw.is_permanent || false,
            reason: raw.reason || '',
            subtype: log.subtype || '',
          }
        })
      } catch (e) {
        this.bounceError = e.message || 'Failed to fetch bounce logs'
      } finally {
        this.bounceLoading = false
      }
    },
  },
  getters: {
    hasStats: (state) => state.stats !== null,

    hasAMPStats: (state) => state.ampStats !== null,

    hasTimeSeries: (state) => state.timeSeries.length > 0,

    hasStatsByType: (state) => state.statsByType.length > 0,

    hasClickedLinks: (state) => state.clickedLinks.length > 0,

    hasMoreClickedLinks: (state) =>
      !state.showAllClickedLinks && state.clickedLinksTotal > 5,

    hasUserEmails: (state) => state.userEmails.length > 0,

    hasMoreUserEmails: (state) => {
      return state.userEmails.length < state.userEmailsTotal
    },

    // Incoming email getters - counts come from server-side metric queries.
    incomingOutcomeCounts: (state) => {
      const counts = {}
      for (const [subtype, count] of Object.entries(state.incomingCounts)) {
        // Normalize case: capitalize first letter.
        const normalized = subtype.charAt(0).toUpperCase() + subtype.slice(1)
        counts[normalized] = count
      }
      return counts
    },

    // Entries are already filtered server-side by search and outcome.
    filteredIncomingEntries: (state) => {
      return state.incomingEntries
    },

    // Calculate derived statistics.
    formattedStats: (state) => {
      if (!state.stats) return null

      return {
        totalSent: state.stats.total_sent || 0,
        opened: state.stats.opened || 0,
        clicked: state.stats.clicked || 0,
        bounced: state.stats.bounced || 0,
        openRate: (state.stats.open_rate || 0).toFixed(1),
        clickRate: (state.stats.click_rate || 0).toFixed(1),
        clickToOpenRate: (state.stats.click_to_open_rate || 0).toFixed(1),
        bounceRate: (state.stats.bounce_rate || 0).toFixed(1),
      }
    },

    // Calculate AMP statistics.
    formattedAMPStats: (state) => {
      if (!state.ampStats) return null

      return {
        totalWithAMP: state.ampStats.total_with_amp || 0,
        totalWithoutAMP: state.ampStats.total_without_amp || 0,
        ampPercentage: (state.ampStats.amp_percentage || 0).toFixed(1),
        // AMP rendering metrics
        ampRendered: state.ampStats.amp_rendered || 0,
        ampRenderRate: (state.ampStats.amp_render_rate || 0).toFixed(1),
        // AMP engagement
        ampOpened: state.ampStats.amp_opened || 0,
        ampClicked: state.ampStats.amp_clicked || 0,
        ampBounced: state.ampStats.amp_bounced || 0,
        ampReplied: state.ampStats.amp_replied || 0,
        ampOpenRate: (state.ampStats.amp_open_rate || 0).toFixed(1),
        ampClickRate: (state.ampStats.amp_click_rate || 0).toFixed(1),
        ampBounceRate: (state.ampStats.amp_bounce_rate || 0).toFixed(1),
        ampReplyRate: (state.ampStats.amp_reply_rate || 0).toFixed(1),
        // Reply breakdown by method for AMP-enabled emails
        ampRepliedViaAMP: state.ampStats.amp_replied_via_amp || 0,
        ampRepliedViaEmail: state.ampStats.amp_replied_via_email || 0,
        ampReplyViaAMPRate: (
          state.ampStats.amp_reply_via_amp_rate || 0
        ).toFixed(1),
        ampReplyViaEmailRate: (
          state.ampStats.amp_reply_via_email_rate || 0
        ).toFixed(1),
        // Click breakdown for AMP emails
        ampReplyClicks: state.ampStats.amp_reply_clicks || 0,
        ampOtherClicks: state.ampStats.amp_other_clicks || 0,
        ampReplyClickRate: (state.ampStats.amp_reply_click_rate || 0).toFixed(
          1
        ),
        ampOtherClickRate: (state.ampStats.amp_other_click_rate || 0).toFixed(
          1
        ),
        // Response rate: all ways of responding (replies + reply-clicks)
        // Falls back to action rate if response rate not yet available from API
        ampResponseRate: (
          state.ampStats.amp_response_rate ??
          state.ampStats.amp_action_rate ??
          0
        ).toFixed(1),
        // Legacy action rate (for backwards compatibility)
        ampActionRate: (state.ampStats.amp_action_rate || 0).toFixed(1),
        // Non-AMP engagement (for comparison)
        nonAMPOpened: state.ampStats.non_amp_opened || 0,
        nonAMPClicked: state.ampStats.non_amp_clicked || 0,
        nonAMPBounced: state.ampStats.non_amp_bounced || 0,
        nonAMPReplied: state.ampStats.non_amp_replied || 0,
        nonAMPOpenRate: (state.ampStats.non_amp_open_rate || 0).toFixed(1),
        nonAMPClickRate: (state.ampStats.non_amp_click_rate || 0).toFixed(1),
        nonAMPBounceRate: (state.ampStats.non_amp_bounce_rate || 0).toFixed(1),
        nonAMPReplyRate: (state.ampStats.non_amp_reply_rate || 0).toFixed(1),
        // Click breakdown for non-AMP emails
        nonAMPReplyClicks: state.ampStats.non_amp_reply_clicks || 0,
        nonAMPOtherClicks: state.ampStats.non_amp_other_clicks || 0,
        nonAMPReplyClickRate: (
          state.ampStats.non_amp_reply_click_rate || 0
        ).toFixed(1),
        nonAMPOtherClickRate: (
          state.ampStats.non_amp_other_click_rate || 0
        ).toFixed(1),
        // Response rate: email replies + reply-clicks
        // Falls back to action rate if response rate not yet available from API
        nonAMPResponseRate: (
          state.ampStats.non_amp_response_rate ??
          state.ampStats.non_amp_action_rate ??
          0
        ).toFixed(1),
        // Legacy action rate (for backwards compatibility)
        nonAMPActionRate: (state.ampStats.non_amp_action_rate || 0).toFixed(1),
      }
    },

    // AMP vs non-AMP comparison chart data - focuses on action rate as the key metric.
    ampComparisonChartData: (state) => {
      if (!state.ampStats) return null

      const ampStats = state.ampStats

      return [
        ['Metric', 'AMP Emails', 'Non-AMP Emails'],
        [
          'Action Rate (%)',
          ampStats.amp_action_rate || 0,
          ampStats.non_amp_action_rate || 0,
        ],
        [
          'Click Rate (%)',
          ampStats.amp_click_rate || 0,
          ampStats.non_amp_click_rate || 0,
        ],
        [
          'Reply Rate (%)',
          ampStats.amp_reply_rate || 0,
          ampStats.non_amp_reply_rate || 0,
        ],
      ]
    },

    // Time series data formatted for Google Charts (engagement rates focus).
    timeSeriesChartData: (state) => {
      if (!state.timeSeries.length) return null

      // Header row for the chart - show opens, clicks and bounces.
      const data = [
        ['Date', 'Open Rate (%)', 'Click Rate (%)', 'Bounce Rate (%)'],
      ]

      state.timeSeries.forEach((day) => {
        const date = new Date(day.date)
        const openRate = day.sent > 0 ? (day.opened / day.sent) * 100 : 0
        const clickRate = day.sent > 0 ? (day.clicked / day.sent) * 100 : 0
        const bounceRate = day.sent > 0 ? (day.bounced / day.sent) * 100 : 0
        data.push([date, openRate, clickRate, bounceRate])
      })

      return data
    },

    // Email type comparison data formatted for Google Charts.
    typeComparisonChartData: (state) => {
      if (!state.statsByType.length) return null

      // Show opens, clicks and bounces by email type.
      const data = [
        ['Email Type', 'Open Rate (%)', 'Click Rate (%)', 'Bounce Rate (%)'],
      ]

      state.statsByType.forEach((type) => {
        // Capitalize first letter for display.
        const displayName =
          type.email_type.charAt(0).toUpperCase() + type.email_type.slice(1)
        data.push([
          displayName,
          type.open_rate || 0,
          type.click_rate || 0,
          type.bounce_rate || 0,
        ])
      })

      return data
    },

    // Volume data for secondary chart (raw numbers).
    volumeChartData: (state) => {
      if (!state.timeSeries.length) return null

      const data = [['Date', 'Emails Sent']]

      state.timeSeries.forEach((day) => {
        const date = new Date(day.date)
        data.push([date, day.sent])
      })

      return data
    },
  },
})
