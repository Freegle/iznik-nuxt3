import { defineStore } from 'pinia'
import api from '~/api'

export const useEmailTrackingStore = defineStore({
  id: 'emailtracking',
  state: () => ({
    // Aggregate statistics.
    stats: null,
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
  }),
  actions: {
    init(config) {
      this.config = config
    },

    clear() {
      this.stats = null
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
        this.clickedLinks = response.data || []
        this.clickedLinksTotal = response.total || 0
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
  },
  getters: {
    hasStats: (state) => state.stats !== null,

    hasTimeSeries: (state) => state.timeSeries.length > 0,

    hasStatsByType: (state) => state.statsByType.length > 0,

    hasClickedLinks: (state) => state.clickedLinks.length > 0,

    hasMoreClickedLinks: (state) =>
      !state.showAllClickedLinks && state.clickedLinksTotal > 5,

    hasUserEmails: (state) => state.userEmails.length > 0,

    hasMoreUserEmails: (state) => {
      return state.userEmails.length < state.userEmailsTotal
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

    // Time series data formatted for Google Charts (engagement rates focus).
    timeSeriesChartData: (state) => {
      if (!state.timeSeries.length) return null

      // Header row for the chart - focus on engagement rates, not raw counts.
      const data = [['Date', 'Click Rate (%)', 'Bounce Rate (%)']]

      state.timeSeries.forEach((day) => {
        const date = new Date(day.date)
        const clickRate = day.sent > 0 ? (day.clicked / day.sent) * 100 : 0
        const bounceRate = day.sent > 0 ? (day.bounced / day.sent) * 100 : 0
        data.push([date, clickRate, bounceRate])
      })

      return data
    },

    // Email type comparison data formatted for Google Charts.
    typeComparisonChartData: (state) => {
      if (!state.statsByType.length) return null

      // Focus on engagement rates by email type.
      const data = [['Email Type', 'Click Rate (%)', 'Bounce Rate (%)']]

      state.statsByType.forEach((type) => {
        // Capitalize first letter for display.
        const displayName =
          type.email_type.charAt(0).toUpperCase() + type.email_type.slice(1)
        data.push([displayName, type.click_rate || 0, type.bounce_rate || 0])
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
