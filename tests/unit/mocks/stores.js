/**
 * Store mock factories for unit tests
 *
 * These provide consistent mock implementations of Pinia stores
 * that can be used with vi.mock() or mockNuxtImport()
 */
import { vi } from 'vitest'

/**
 * Create a mock member store with configurable behavior
 */
export function createMockMemberStore(overrides = {}) {
  return {
    // State
    members: [],

    // Actions (as vi.fn() for assertion)
    add: vi.fn().mockResolvedValue({}),
    update: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue({}),
    fetch: vi.fn().mockResolvedValue({}),
    fetchMembers: vi.fn().mockResolvedValue([]),
    approve: vi.fn().mockResolvedValue({}),
    reviewHold: vi.fn().mockResolvedValue({}),
    reviewRelease: vi.fn().mockResolvedValue({}),
    ban: vi.fn().mockResolvedValue({}),

    // Getters
    byId: vi.fn().mockReturnValue(null),

    // Allow overrides
    ...overrides,
  }
}

/**
 * Create a mock user store
 */
export function createMockUserStore(overrides = {}) {
  return {
    user: null,
    add: vi.fn().mockResolvedValue(123), // Returns user ID
    fetch: vi.fn().mockResolvedValue({}),
    fetchMT: vi.fn().mockResolvedValue({}),
    updateUser: vi.fn().mockResolvedValue({}),
    byId: vi.fn().mockReturnValue(null),
    ...overrides,
  }
}

/**
 * Create a mock admins store
 */
export function createMockAdminsStore(overrides = {}) {
  return {
    get: vi.fn().mockReturnValue({
      id: 1,
      subject: 'Test Admin',
      text: 'Test body',
      created: '2024-01-01',
      groupid: 1,
      pending: true,
    }),
    edit: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue({}),
    hold: vi.fn().mockResolvedValue({}),
    release: vi.fn().mockResolvedValue({}),
    approve: vi.fn().mockResolvedValue({}),
    ...overrides,
  }
}

/**
 * Create a mock group store
 */
export function createMockGroupStore(overrides = {}) {
  return {
    get: vi.fn().mockReturnValue({
      id: 1,
      namedisplay: 'Test Group',
    }),
    fetch: vi.fn().mockResolvedValue({}),
    ...overrides,
  }
}

/**
 * Create a mock message store
 */
export function createMockMessageStore(overrides = {}) {
  return {
    messages: [],
    fetch: vi.fn().mockResolvedValue({}),
    patch: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue({}),
    approve: vi.fn().mockResolvedValue({}),
    reject: vi.fn().mockResolvedValue({}),
    ...overrides,
  }
}

/**
 * Create a mock spammer store
 */
export function createMockSpammerStore(overrides = {}) {
  return {
    report: vi.fn().mockResolvedValue({}),
    confirm: vi.fn().mockResolvedValue({}),
    requestremove: vi.fn().mockResolvedValue({}),
    remove: vi.fn().mockResolvedValue({}),
    safelist: vi.fn().mockResolvedValue({}),
    hold: vi.fn().mockResolvedValue({}),
    release: vi.fn().mockResolvedValue({}),
    ...overrides,
  }
}

/**
 * Create a mock auth store
 */
export function createMockAuthStore(overrides = {}) {
  return {
    user: null,
    saveAndGet: vi.fn().mockResolvedValue({}),
    unbounceMT: vi.fn().mockResolvedValue({}),
    ...overrides,
  }
}

/**
 * Create a mock stdmsg store
 */
export function createMockStdmsgStore(overrides = {}) {
  return {
    stdmsgs: [],
    fetch: vi.fn().mockResolvedValue({}),
    ...overrides,
  }
}

/**
 * Create a mock modconfig store
 */
export function createMockModConfigStore(overrides = {}) {
  return {
    config: {},
    fetch: vi.fn().mockResolvedValue({}),
    ...overrides,
  }
}

/**
 * Create a mock alert store
 */
export function createMockAlertStore(overrides = {}) {
  return {
    get: vi.fn().mockReturnValue({
      id: 1,
      subject: 'Test Alert',
      text: 'Alert text content',
      html: '<p>Alert HTML content</p>',
    }),
    fetch: vi.fn().mockResolvedValue({}),
    ...overrides,
  }
}
