/**
 * Mock implementation of ~/stores/chat for unit tests.
 *
 * Tests can override the returned data by setting globalThis.__mockChatStore
 * in beforeEach. Defaults to an empty store state.
 */
export const useChatStore = () => {
  return (
    globalThis.__mockChatStore || {
      list: [],
      listMT: [],
      listByChatId: {},
      messageById: () => null,
      byChatId: () => null,
      fetchMessages: async () => {},
      fetchMT: async () => {},
      approveChat: async () => {},
      approveAllFutureChat: async () => {},
      rejectChat: async () => {},
      holdChat: async () => {},
      releaseChat: async () => {},
      redactChat: async () => {},
      send: async () => {},
    }
  )
}
