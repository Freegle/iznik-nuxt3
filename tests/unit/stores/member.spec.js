import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

const mockReviewIgnore = vi.fn().mockResolvedValue()
const mockFetchMembers = vi.fn()

vi.mock('~/api', () => ({
  default: () => ({
    memberships: {
      reviewIgnore: mockReviewIgnore,
      fetchMembers: mockFetchMembers,
    },
  }),
}))

vi.mock('~/stores/auth', () => ({
  useAuthStore: () => ({
    user: { id: 999 },
  }),
}))

describe('member store', () => {
  let useMemberStore

  beforeEach(async () => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    const mod = await import('~/modtools/stores/member')
    useMemberStore = mod.useMemberStore
  })

  describe('spamignore', () => {
    it('removes only the acted-on membership, keeps entry for other groups', async () => {
      const store = useMemberStore()
      store.config = {}

      // Simulate a member in review on two groups.
      store.list[123] = {
        id: 123,
        userid: 456,
        memberships: [
          { id: 111, groupid: 789, membershipid: 111 },
          { id: 222, groupid: 999, membershipid: 222 },
        ],
      }

      // Ignore on group 789 only.
      await store.spamignore({ userid: 456, groupid: 789 })

      expect(mockReviewIgnore).toHaveBeenCalledWith(456, 789)
      // Entry should still exist with the remaining membership.
      expect(store.list[123]).toBeTruthy()
      expect(store.list[123].memberships).toHaveLength(1)
      expect(store.list[123].memberships[0].groupid).toBe(999)
    })

    it('removes entire entry when last membership is ignored', async () => {
      const store = useMemberStore()
      store.config = {}

      store.list[123] = {
        id: 123,
        userid: 456,
        memberships: [{ id: 111, groupid: 789, membershipid: 111 }],
      }

      await store.spamignore({ userid: 456, groupid: 789 })

      expect(store.list[123]).toBeUndefined()
    })
  })

  describe('fetchMembers - Related collection', () => {
    it('stores pairs and creates synthetic member entries', async () => {
      mockFetchMembers.mockResolvedValue({
        members: [
          { id: 10, user1: 100, user2: 200 },
          { id: 11, user1: 300, user2: 400 },
        ],
        context: null,
        ratings: [],
      })

      const store = useMemberStore()
      store.config = {}

      await store.fetchMembers({ collection: 'Related' })

      // Pair entries stored by pair id.
      expect(store.list[10]).toMatchObject({
        id: 10,
        user1: 100,
        user2: 200,
        collection: 'Related',
      })
      expect(store.list[11]).toMatchObject({
        id: 11,
        user1: 300,
        user2: 400,
        collection: 'Related',
      })

      // Synthetic member entries for each user.
      expect(store.list[100]).toMatchObject({
        id: 100,
        userid: 100,
        _syntheticRelated: true,
      })
      expect(store.list[200]).toMatchObject({
        id: 200,
        userid: 200,
        _syntheticRelated: true,
      })
      expect(store.list[300]).toMatchObject({
        id: 300,
        userid: 300,
        _syntheticRelated: true,
      })
      expect(store.list[400]).toMatchObject({
        id: 400,
        userid: 400,
        _syntheticRelated: true,
      })
    })

    it('does not overwrite existing entries with synthetic ones', async () => {
      const store = useMemberStore()
      store.config = {}

      // Pre-existing entry for user 100.
      store.list[100] = { id: 100, userid: 100, displayname: 'Existing' }

      mockFetchMembers.mockResolvedValue({
        members: [{ id: 10, user1: 100, user2: 200 }],
        context: null,
        ratings: [],
      })

      await store.fetchMembers({ collection: 'Related' })

      // Existing entry should not be overwritten.
      expect(store.list[100].displayname).toBe('Existing')
      // New synthetic entry for user 200 should exist.
      expect(store.list[200]._syntheticRelated).toBe(true)
    })
  })
})
