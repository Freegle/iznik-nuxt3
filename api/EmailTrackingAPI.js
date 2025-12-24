import BaseAPI from '@/api/BaseAPI'

export default class EmailTrackingAPI extends BaseAPI {
  /**
   * Fetch aggregate email statistics.
   * @param {Object} params - Query parameters
   * @param {string} [params.type] - Filter by email type (e.g., 'welcome', 'digest')
   * @param {string} [params.start] - Start date (YYYY-MM-DD)
   * @param {string} [params.end] - End date (YYYY-MM-DD)
   */
  async fetchStats(params = {}) {
    return await this.$getv2('/email/stats', params)
  }

  /**
   * Fetch email tracking records for a specific user.
   * @param {number|string} userIdOrEmail - The user ID or email address
   * @param {Object} params - Query parameters
   * @param {number} [params.limit] - Number of records (default 50, max 100)
   * @param {number} [params.offset] - Offset for pagination
   */
  async fetchUserEmails(userIdOrEmail, params = {}) {
    // If userIdOrEmail looks like an email, use ID 0 and pass email as query param.
    if (typeof userIdOrEmail === 'string' && userIdOrEmail.includes('@')) {
      return await this.$getv2('/email/user/0', {
        ...params,
        email: userIdOrEmail,
      })
    }
    return await this.$getv2(`/email/user/${userIdOrEmail}`, params)
  }

  /**
   * Fetch email types for filtering.
   */
  async fetchEmailTypes() {
    return await this.$getv2('/email/types')
  }

  /**
   * Fetch daily email statistics for time series charting.
   * @param {Object} params - Query parameters
   * @param {string} [params.type] - Filter by email type
   * @param {string} [params.start] - Start date (YYYY-MM-DD)
   * @param {string} [params.end] - End date (YYYY-MM-DD)
   */
  async fetchTimeSeries(params = {}) {
    return await this.$getv2('/email/stats/timeseries', params)
  }

  /**
   * Fetch email statistics broken down by email type.
   * @param {Object} params - Query parameters
   * @param {string} [params.start] - Start date (YYYY-MM-DD)
   * @param {string} [params.end] - End date (YYYY-MM-DD)
   */
  async fetchStatsByType(params = {}) {
    return await this.$getv2('/email/stats/bytype', params)
  }

  /**
   * Fetch top clicked links from emails.
   * @param {Object} params - Query parameters
   * @param {string} [params.start] - Start date (YYYY-MM-DD)
   * @param {string} [params.end] - End date (YYYY-MM-DD)
   * @param {number} [params.limit] - Number of links to return (default 5, 0 for all)
   */
  async fetchTopClickedLinks(params = {}) {
    return await this.$getv2('/email/stats/clicks', params)
  }
}
