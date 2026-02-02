/**
 * Mock implementation of useOurModal composable for unit tests.
 *
 * The key insight: the component uses `ref="modal"` to bind to the b-modal element,
 * and the composable returns a ref that Vue will populate with the modal instance.
 * In tests, we need to return a proper Vue ref so Vue doesn't warn about binding
 * to a non-ref value.
 */
import { ref } from 'vue'

// Create mock functions that tests can spy on
export const mockShow = () => {}
export const mockHide = () => {}

/**
 * Creates a fresh useOurModal mock with a proper Vue ref.
 * Call this in tests that need to customize the mock behavior.
 */
export function createUseOurModalMock(overrides = {}) {
  // Create a proper Vue ref - this is what Vue's template ref system expects
  const modal = ref(null)

  return {
    modal,
    show: overrides.show || mockShow,
    hide: overrides.hide || mockHide,
    ...overrides,
  }
}

/**
 * Default useOurModal mock for automatic mocking via vi.mock.
 * Returns a function that creates fresh state for each test.
 */
export function useOurModal() {
  return createUseOurModalMock()
}
