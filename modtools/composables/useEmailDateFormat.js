/**
 * Shared date formatting for email tabs (Outgoing Email, Incoming Email).
 * Provides consistent timestamp display across all email-related ModTools views.
 */
export function useEmailDateFormat() {
  function formatEmailDate(dateStr) {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return { formatEmailDate }
}
