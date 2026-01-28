/**
 * Helper to create data-test selectors
 * Usage: wrapper.find(testId('my-element'))
 */
export function testId(id: string): string {
  return `[data-test="${id}"]`
}
