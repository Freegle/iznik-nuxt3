import BaseAPI from '@/api/BaseAPI'

export default class SystemLogsAPI extends BaseAPI {
  fetch(params) {
    // Use v2 endpoint for system logs from Loki
    return this.$getv2('/systemlogs', params)
  }

  // Fetch API headers for a specific API log entry by request_id.
  // Headers are logged separately with source=api_headers.
  fetchHeadersByRequestId(requestId) {
    const params = {
      sources: 'api_headers',
      search: requestId,
      start: '24h',
      limit: 1,
    }
    return this.$getv2('/systemlogs', params)
  }

  // Fallback: Fetch API headers by timestamp and endpoint (for older logs without request_id).
  fetchHeadersByTimestamp(timestamp, endpoint, userId = null) {
    const params = {
      sources: 'api_headers',
      // Search within 2 seconds of the API call timestamp
      start: new Date(new Date(timestamp).getTime() - 1000).toISOString(),
      end: new Date(new Date(timestamp).getTime() + 1000).toISOString(),
      limit: 10,
    }

    if (userId) {
      params.userid = userId
    }

    // Search for matching endpoint
    if (endpoint) {
      params.search = endpoint
    }

    return this.$getv2('/systemlogs', params)
  }
}
