/**
 * Mock implementation of ~/stores/auth for unit tests.
 *
 * Tests can override the returned data by setting globalThis.__mockAuthStore
 * in beforeEach. Defaults to an empty store state.
 */
export function useAuthStore() {
  return (
    globalThis.__mockAuthStore || {
      groups: [],
      work: {},
      discourse: {},
      user: null,
      auth: { jwt: null, persistent: null },
      loginStateKnown: false,
      forceLogin: false,
      loggedInEver: false,
      userlist: [],
      loginType: null,
      loginCount: 0,
    }
  )
}
