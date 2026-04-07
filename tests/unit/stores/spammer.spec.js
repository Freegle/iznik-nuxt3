import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// Mock dependent stores
const mockUserStore = {
  list: {},
  fetchMultiple: vi.fn().mockResolvedValue(undefined),
}

const mockMemberStore = {
  list: {},
}

vi.mock('~/stores/user', () => ({
  useUserStore: () => mockUserStore,
}))

vi.mock('~/stores/member', () => ({
  useMemberStore: () => mockMemberStore,
}))

const mockPatch = vi.fn().mockResolvedValue({})
const mockAdd = vi.fn().mockResolvedValue({})
const mockDel = vi.fn().mockResolvedValue({})

vi.mock('~/api', () => ({
  default: () => ({
    spammers: {
      fetch: vi.fn().mockResolvedValue({ spammers: [], context: null }),
      patch: mockPatch,
      add: mockAdd,
      del: mockDel,
    },
  }),
}))

vi.mock('~/composables/useMe', () => ({
  fetchMe: vi.fn().mockResolvedValue(undefined),
}))

describe('spammer store', () => {
  let spammerStore

  beforeEach(async () => {
    setActivePinia(createPinia())
    mockUserStore.list = {}
    mockMemberStore.list = {}
    mockPatch.mockClear()
    mockAdd.mockClear()
    mockDel.mockClear()

    // Import fresh store after mocks are set
    const { useSpammerStore } = await import('~/stores/spammer')
    spammerStore = useSpammerStore()
  })

  describe('addAll', () => {
    it('includes spam_users.id in member.spammer so PATCH calls send correct id', () => {
      // Simulate a spammer row returned by GET /spammers.
      // item.id is the spam_users.id — required by PATCH /modtools/spammers.
      const spammerItem = {
        id: 42, // spam_users.id — this is what PATCH needs
        userid: 100,
        collection: 'PendingAdd',
        reason: 'Sent spam',
        added: '2026-04-04T00:00:00Z',
        byuserid: null,
        heldby: null,
        heldat: null,
      }

      // Simulate userStore having fetched the user.
      mockUserStore.list[100] = {
        id: 100,
        displayname: 'Test User',
        email: 'test@example.com',
      }

      spammerStore.addAll([spammerItem])

      // The assembled member in memberStore must have spammer.id set to
      // spam_users.id (42), not undefined. Without this, PATCH /modtools/spammers
      // receives id=0 and returns 400 "Missing id".
      expect(mockMemberStore.list[100].spammer.id).toBe(42)
      expect(spammerStore.list[0].user.spammer.id).toBe(42)
    })

    it('includes spam_users.id in spammer object for fallback (user not in store)', () => {
      // When userStore doesn't have the user, fallback path is used.
      const spammerItem = {
        id: 99,
        userid: 200,
        collection: 'PendingAdd',
        reason: 'Suspected spam',
        added: '2026-04-04T00:00:00Z',
        byuserid: null,
      }

      // No user in userStore — triggers fallback branch
      mockUserStore.list = {}

      spammerStore.addAll([spammerItem])

      expect(mockMemberStore.list[200].spammer.id).toBe(99)
      expect(spammerStore.list[0].user.spammer.id).toBe(99)
    })

    it('propagates heldby into member object so Hold button hides after hold', () => {
      // Bug: addAll() was not setting item.heldby on the member object.
      // Template uses !member.heldby to show/hide Hold/Confirm/Reject buttons.
      // Without this fix, held entries always show Hold button again after re-fetch.
      const spammerItem = {
        id: 42,
        userid: 100,
        collection: 'PendingAdd',
        reason: 'Sent spam',
        added: '2026-04-04T00:00:00Z',
        byuserid: null,
        heldby: 999, // held by moderator with id 999
        heldat: '2026-04-07T10:00:00Z',
      }

      mockUserStore.list[100] = {
        id: 100,
        displayname: 'Test User',
        email: 'test@example.com',
      }

      spammerStore.addAll([spammerItem])

      const member = mockMemberStore.list[100]
      // member.heldby must be set so template's !member.heldby is falsy
      // and Hold/Confirm/Reject buttons are hidden.
      expect(member.heldby).toBe(999)
      expect(member.spammer.heldby).toBe(999)
      expect(member.spammer.heldat).toBe('2026-04-07T10:00:00Z')
    })

    it('sets heldby to null when entry is not held', () => {
      const spammerItem = {
        id: 42,
        userid: 100,
        collection: 'PendingAdd',
        reason: 'Sent spam',
        added: '2026-04-04T00:00:00Z',
        byuserid: null,
        heldby: null,
        heldat: null,
      }

      mockUserStore.list[100] = {
        id: 100,
        displayname: 'Test User',
        email: 'test@example.com',
      }

      spammerStore.addAll([spammerItem])

      const member = mockMemberStore.list[100]
      expect(member.heldby).toBeNull()
      expect(member.spammer.heldby).toBeNull()
    })
  })

  describe('confirm', () => {
    it('sends the spam_users.id to PATCH so the Go API does not return 400', async () => {
      // Set up the store with a spammer (as if fetched from API).
      mockUserStore.list[100] = {
        id: 100,
        displayname: 'Test User',
        email: 'test@example.com',
      }
      spammerStore.addAll([
        {
          id: 42,
          userid: 100,
          collection: 'PendingAdd',
          reason: 'Sent spam',
          added: '2026-04-04T00:00:00Z',
          byuserid: null,
        },
      ])

      await spammerStore.confirm({ id: 42, userid: 100 })

      // The PATCH must receive id=42 (spam_users.id), not 0 or undefined.
      // id=0 causes Go API to return 400 "Missing id".
      expect(mockPatch).toHaveBeenCalledWith(
        expect.objectContaining({ id: 42 })
      )
    })

    it('does not call PATCH when id is missing (guard prevents 400)', async () => {
      await spammerStore.confirm({ id: null, userid: 100 })
      expect(mockPatch).not.toHaveBeenCalled()
    })
  })
})
