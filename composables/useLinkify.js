/**
 * Utility to convert URLs in text to clickable links.
 * Used in ModTools to make chat message links clickable.
 * Not used in Freegle for safety reasons.
 */

/**
 * Escape HTML special characters to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

/**
 * URL regex pattern that matches common URL formats
 * Matches http://, https://, and www. prefixed URLs
 */
const URL_REGEX =
  /(\b(?:https?:\/\/|www\.)[^\s<>'"]+(?:\([^\s<>'"]*\)|[^\s<>'".,;:!?)\]]))/gi

/**
 * Convert URLs in text to clickable anchor tags.
 * The text is first HTML-escaped for safety, then URLs are converted to links.
 *
 * @param {string} text - The raw text to process
 * @returns {string} HTML string with URLs converted to anchor tags
 */
export function linkifyText(text) {
  if (!text) return ''

  // First escape all HTML to prevent XSS
  const escaped = escapeHtml(text)

  // Then convert URLs to clickable links
  return escaped.replace(URL_REGEX, (url) => {
    // Ensure URL has protocol for href
    const href = url.startsWith('www.') ? 'https://' + url : url
    return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="chat-link">${url}</a>`
  })
}

/**
 * Convert URLs to clickable links AND highlight emails.
 * Used in ModTools chat review where both features are needed.
 *
 * @param {string} text - The raw text to process
 * @param {RegExp} emailRegex - The regex pattern for email matching
 * @returns {string} HTML string with URLs as links and emails highlighted
 */
export function linkifyAndHighlightEmails(text, emailRegex) {
  if (!text) return ''

  // First escape all HTML to prevent XSS
  const escaped = escapeHtml(text)

  // Convert URLs to clickable links
  let result = escaped.replace(URL_REGEX, (url) => {
    const href = url.startsWith('www.') ? 'https://' + url : url
    return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="chat-link">${url}</a>`
  })

  // Highlight emails if regex provided
  if (emailRegex) {
    result = result.replace(emailRegex, '<span class="highlight">$&</span>')
  }

  return result
}

/**
 * Composable for linkifying text in Vue components
 */
export function useLinkify() {
  return {
    linkifyText,
    linkifyAndHighlightEmails,
  }
}
