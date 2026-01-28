// Mock for letterparser package
// The extract function parses email content into text and html parts

export function extract(message) {
  if (!message) return null
  return {
    text: 'Extracted plain text',
    html: '<p>Extracted HTML</p>',
  }
}
