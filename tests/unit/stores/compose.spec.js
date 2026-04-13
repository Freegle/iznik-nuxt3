import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

const mockMessagePut = vi.fn()
const mockJoinAndPost = vi.fn()
const mockImagePost = vi.fn()

vi.mock('~/api', () => ({
  default: () => ({
    message: {
      put: mockMessagePut,
      joinAndPost: mockJoinAndPost,
    },
    image: {
      post: mockImagePost,
    },
  }),
}))

const mockMessageFetch = vi.fn()
const mockMessageUpdate = vi.fn()
const mockMessagePatch = vi.fn()
vi.mock('~/stores/message', () => ({
  useMessageStore: () => ({
    fetch: mockMessageFetch,
    update: mockMessageUpdate,
    patch: mockMessagePatch,
  }),
}))

const mockSetAuth = vi.fn()
let mockAuthUser = null
vi.mock('~/stores/auth', () => ({
  useAuthStore: () => ({
    setAuth: mockSetAuth,
    user: mockAuthUser,
    loggedInEver: false,
  }),
}))

describe('compose store', () => {
  let useComposeStore

  beforeEach(async () => {
    vi.clearAllMocks()
    mockAuthUser = null
    setActivePinia(createPinia())
    const mod = await import('~/stores/compose')
    useComposeStore = mod.useComposeStore
  })

  describe('initial state', () => {
    it('starts with correct defaults', () => {
      const store = useComposeStore()
      expect(store.email).toBeNull()
      expect(store.postcode).toBeNull()
      expect(store.group).toBeNull()
      expect(store.messages).toEqual([])
      expect(store.attachmentBump).toBe(1)
      expect(store._progress).toBe(1)
      expect(store.max).toBe(4)
      expect(store.uploading).toBe(false)
      expect(store.lastSubmitted).toBe(0)
    })
  })

  describe('init', () => {
    it('sets config and api', () => {
      const store = useComposeStore()
      store.init({ public: {} })
      expect(store.config).toEqual({ public: {} })
      expect(store.$api).toBeDefined()
    })
  })

  describe('setEmail', () => {
    it('sets email and timestamp', () => {
      const store = useComposeStore()
      store.setEmail('test@example.com')
      expect(store.email).toBe('test@example.com')
      expect(store.emailAt).toBeGreaterThan(0)
    })
  })

  describe('setPostcode', () => {
    it('strips groupsnear to minimal fields', () => {
      const store = useComposeStore()
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      store.setPostcode({
        id: 1,
        name: 'SW1A 1AA',
        groupsnear: [
          {
            id: 10,
            nameshort: 'Westminster',
            namedisplay: 'Westminster Freegle',
            settings: { closed: false, someOther: true },
            extraField: 'removed',
          },
        ],
      })

      expect(store.postcode.name).toBe('SW1A 1AA')
      expect(store.postcode.groupsnear[0]).toEqual({
        id: 10,
        nameshort: 'Westminster',
        namedisplay: 'Westminster Freegle',
        settings: { closed: false },
      })
      expect(store.postcode.groupsnear[0].extraField).toBeUndefined()
      logSpy.mockRestore()
    })

    it('does nothing when postcode has no groupsnear', () => {
      const store = useComposeStore()
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      store.setPostcode({ id: 1, name: 'SW1A' })
      expect(store.postcode).toBeNull()
      logSpy.mockRestore()
    })
  })

  describe('add / ensureMessage', () => {
    it('adds a new message and returns its id', () => {
      const store = useComposeStore()
      const id = store.add()
      expect(id).toBe(0)
      expect(store.messages[0]).toEqual({ id: 0 })
    })

    it('adds multiple messages with sequential ids', () => {
      const store = useComposeStore()
      store.add()
      const id2 = store.add()
      expect(id2).toBe(1)
      expect(store.messages).toHaveLength(2)
    })

    it('ensureMessage does not overwrite existing', () => {
      const store = useComposeStore()
      store.messages[0] = { id: 0, type: 'Offer', item: 'Sofa' }
      store.ensureMessage(0)
      expect(store.messages[0].item).toBe('Sofa')
    })
  })

  describe('setMessage', () => {
    it('stores message with savedAt and savedBy', () => {
      const store = useComposeStore()
      store.add()
      store.setMessage(0, { id: 0, type: 'Offer' }, { id: 42 })
      expect(store.messages[0].savedAt).toBeGreaterThan(0)
      expect(store.messages[0].savedBy).toBe(42)
    })

    it('tracks lastSubmitted for submitted messages', () => {
      const store = useComposeStore()
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      store.add()
      store.setMessage(0, { id: 100, submitted: true }, null)
      expect(store.lastSubmitted).toBe(100)
      logSpy.mockRestore()
    })

    it('keeps max lastSubmitted', () => {
      const store = useComposeStore()
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      store.add()
      store.add()
      store.setMessage(0, { id: 200, submitted: true }, null)
      store.setMessage(1, { id: 100, submitted: true }, null)
      expect(store.lastSubmitted).toBe(200)
      logSpy.mockRestore()
    })
  })

  describe('field setters', () => {
    let store

    beforeEach(() => {
      store = useComposeStore()
      store.add()
    })

    it('setType sets type and savedAt', () => {
      store.setType({ id: 0, type: 'Wanted' })
      expect(store.messages[0].type).toBe('Wanted')
      expect(store.messages[0].savedAt).toBeGreaterThan(0)
    })

    it('setItem sets item and savedAt', () => {
      store.setItem({ id: 0, item: 'Sofa' })
      expect(store.messages[0].item).toBe('Sofa')
    })

    it('setAvailableNow sets availablenow', () => {
      store.setAvailableNow(0, 1)
      expect(store.messages[0].availablenow).toBe(1)
    })

    it('setDeliveryPossible sets deliveryPossible', () => {
      store.setDeliveryPossible(0, true)
      expect(store.messages[0].deliveryPossible).toBe(true)
    })

    it('setDeadline sets deadline', () => {
      store.setDeadline(0, '2026-05-01')
      expect(store.messages[0].deadline).toBe('2026-05-01')
    })

    it('setAiDeclined sets aiDeclined', () => {
      store.setAiDeclined(0, true)
      expect(store.messages[0].aiDeclined).toBe(true)
    })

    it('setDescription sets description', () => {
      store.setDescription({ id: 0, description: 'Good condition' })
      expect(store.messages[0].description).toBe('Good condition')
    })
  })

  describe('attachment management', () => {
    let store

    beforeEach(() => {
      store = useComposeStore()
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      store.add()
      logSpy.mockRestore()
    })

    it('addAttachment appends to message', () => {
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      store.addAttachment({ id: 0, attachment: { id: 10, path: 'img.jpg' } })
      expect(store.messages[0].attachments).toHaveLength(1)
      expect(store.attachmentBump).toBe(2)
      logSpy.mockRestore()
    })

    it('addAttachment initializes attachments array if missing', () => {
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      store.messages[0].attachments = undefined
      store.addAttachment({ id: 0, attachment: { id: 10 } })
      expect(store.messages[0].attachments).toHaveLength(1)
      logSpy.mockRestore()
    })

    it('setAttachmentsForMessage replaces all attachments', () => {
      store.setAttachmentsForMessage(0, [{ id: 1 }, { id: 2 }])
      expect(store.messages[0].attachments).toHaveLength(2)
    })

    it('removeAttachment filters by photoid', () => {
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      store.messages[0].attachments = [{ id: 10 }, { id: 20 }, { id: 30 }]
      store.removeAttachment({ id: 0, photoid: 20 })
      expect(store.messages[0].attachments).toHaveLength(2)
      expect(store.messages[0].attachments.map((a) => a.id)).toEqual([10, 30])
      logSpy.mockRestore()
    })
  })

  describe('deleteMessage', () => {
    it('removes message by id', () => {
      const store = useComposeStore()
      store.messages = [
        { id: 0, type: 'Offer' },
        { id: 1, type: 'Wanted' },
      ]
      store.deleteMessage(0)
      expect(store.messages).toHaveLength(1)
      expect(store.messages[0].id).toBe(1)
    })
  })

  describe('clearMessages', () => {
    it('resets messages to empty array', () => {
      const store = useComposeStore()
      store.messages = [{ id: 0 }, { id: 1 }]
      store.clearMessages()
      expect(store.messages).toEqual([])
    })
  })

  describe('calculateSteps', () => {
    it('counts 2 steps per new draft (id < 0)', () => {
      const store = useComposeStore()
      store.messages = [{ id: -1, type: 'Offer', submitted: false }]
      store.calculateSteps('Offer')
      // 2 steps + 2 extra = 4
      expect(store.max).toBe(4)
      expect(store._progress).toBe(1)
    })

    it('counts 3 steps per repost (id >= 0)', () => {
      const store = useComposeStore()
      store.messages = [{ id: 5, type: 'Offer', submitted: false }]
      store.calculateSteps('Offer')
      // 3 steps + 2 extra = 5
      expect(store.max).toBe(5)
    })

    it('skips submitted messages', () => {
      const store = useComposeStore()
      store.messages = [{ id: -1, type: 'Offer', submitted: true }]
      store.calculateSteps('Offer')
      // 0 steps + 2 extra = 2
      expect(store.max).toBe(2)
    })

    it('skips messages of different type', () => {
      const store = useComposeStore()
      store.messages = [{ id: -1, type: 'Wanted', submitted: false }]
      store.calculateSteps('Offer')
      expect(store.max).toBe(2)
    })
  })

  describe('prune', () => {
    it('converts non-array messages to empty array', () => {
      const store = useComposeStore()
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      store.messages = { bad: 'data' }
      store.prune()
      expect(store.messages).toEqual([])
      logSpy.mockRestore()
    })

    it('removes null/falsy entries', () => {
      const store = useComposeStore()
      store.messages = [null, { id: 1, savedAt: Date.now() }, undefined]
      store.prune()
      expect(store.messages).toHaveLength(1)
    })

    it('removes messages older than 7 days', () => {
      const store = useComposeStore()
      const oldTime = Date.now() - 8 * 24 * 60 * 60 * 1000
      store.messages = [{ id: 0, savedAt: oldTime }]
      store.prune()
      expect(store.messages).toHaveLength(0)
    })

    it('sets savedAt for messages without it', () => {
      const store = useComposeStore()
      store.messages = [{ id: 0 }]
      store.prune()
      expect(store.messages[0].savedAt).toBeGreaterThan(0)
    })

    it('removes messages saved by a different user', () => {
      const store = useComposeStore()
      mockAuthUser = { id: 42 }
      store.messages = [{ id: 0, savedAt: Date.now(), savedBy: 99 }]
      store.prune()
      expect(store.messages).toHaveLength(0)
    })

    it('keeps messages saved by current user', () => {
      const store = useComposeStore()
      mockAuthUser = { id: 42 }
      store.messages = [{ id: 0, savedAt: Date.now(), savedBy: 42 }]
      store.prune()
      expect(store.messages).toHaveLength(1)
    })
  })

  describe('markSubmitted', () => {
    it('marks message as submitted and clears attachments', () => {
      const store = useComposeStore()
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      store.add()
      store.markSubmitted(0, { id: 42 })
      expect(store.messages[0].submitted).toBe(true)
      expect(store.messages[0].item).toBeNull()
      expect(store.messages[0].description).toBeNull()
      expect(store.messages[0].attachments).toEqual([])
      logSpy.mockRestore()
    })
  })

  describe('createDraft', () => {
    it('throws when not initialized', async () => {
      const store = useComposeStore()
      await expect(
        store.createDraft({ type: 'Offer', item: 'Test' }, 'a@b.com')
      ).rejects.toThrow('not initialized')
    })

    it('throws when no postcode set', async () => {
      const store = useComposeStore()
      store.init({ public: {} })
      await expect(
        store.createDraft({ type: 'Offer', item: 'Test' }, 'a@b.com')
      ).rejects.toThrow('No postcode')
    })

    it('creates draft with regular attachments', async () => {
      const store = useComposeStore()
      store.init({ public: {} })
      store.postcode = { id: 123 }
      store.group = 10
      mockMessagePut.mockResolvedValue({ id: 99 })

      const id = await store.createDraft(
        {
          type: 'Offer',
          item: 'Sofa',
          description: 'Good condition',
          availablenow: 1,
          attachments: [{ id: 5 }, { id: 6 }],
        },
        'test@example.com'
      )

      expect(id).toBe(99)
      expect(mockMessagePut).toHaveBeenCalledWith(
        expect.objectContaining({
          collection: 'Draft',
          locationid: 123,
          messagetype: 'Offer',
          item: 'Sofa',
          attachments: [5, 6],
          groupid: 10,
          email: 'test@example.com',
        })
      )
    })

    it('handles AI illustration attachments', async () => {
      const store = useComposeStore()
      store.init({ public: {} })
      store.postcode = { id: 123 }
      mockImagePost.mockResolvedValue({ id: 77 })
      mockMessagePut.mockResolvedValue({ id: 99 })

      await store.createDraft(
        {
          type: 'Offer',
          item: 'Test',
          attachments: [
            { ouruid: 'abc123', externalmods: { ai: true } },
            { id: 5 },
          ],
        },
        'test@example.com'
      )

      expect(mockImagePost).toHaveBeenCalledWith({
        externaluid: 'abc123',
        externalmods: { ai: true },
      })
      expect(mockMessagePut).toHaveBeenCalledWith(
        expect.objectContaining({ attachments: [77, 5] })
      )
    })

    it('stores auth tokens when returned', async () => {
      const store = useComposeStore()
      store.init({ public: {} })
      store.postcode = { id: 123 }
      mockMessagePut.mockResolvedValue({
        id: 99,
        jwt: 'token123',
        persistent: 'persist456',
      })

      await store.createDraft({ type: 'Offer', item: 'Test' }, 'test@a.com')
      expect(mockSetAuth).toHaveBeenCalledWith('token123', 'persist456')
    })
  })

  describe('submitDraft', () => {
    it('calls joinAndPost and fetches message', async () => {
      const store = useComposeStore()
      store.init({ public: {} })
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      mockJoinAndPost.mockResolvedValue({ groupid: 10 })

      const result = await store.submitDraft(99, 'test@a.com', {
        deadline: '2026-05-01',
      })

      expect(mockJoinAndPost).toHaveBeenCalledWith(
        99,
        'test@a.com',
        expect.objectContaining({ deadline: '2026-05-01' })
      )
      expect(mockMessageFetch).toHaveBeenCalledWith(99, true)
      expect(result).toEqual({ groupid: 10 })
      logSpy.mockRestore()
    })
  })

  describe('backToDraft', () => {
    it('calls RejectToDraft and increments progress', async () => {
      const store = useComposeStore()
      store.init({ public: {} })
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      mockMessageUpdate.mockResolvedValue({})

      const initialProgress = store._progress
      await store.backToDraft(42)

      expect(mockMessageUpdate).toHaveBeenCalledWith({
        id: 42,
        action: 'RejectToDraft',
      })
      expect(store._progress).toBe(initialProgress + 1)
      logSpy.mockRestore()
    })
  })

  describe('updateIt', () => {
    it('patches message and increments progress', async () => {
      const store = useComposeStore()
      store.init({ public: {} })
      mockMessagePatch.mockResolvedValue({})

      const initialProgress = store._progress
      await store.updateIt(1, 100, 'Offer', 'Sofa', 'Good', [5], 1, 10)

      expect(mockMessagePatch).toHaveBeenCalledWith({
        id: 1,
        locationid: 100,
        messagetype: 'Offer',
        item: 'Sofa',
        textbody: 'Good',
        attachments: [5],
        groupid: 10,
        availablenow: 1,
      })
      expect(store._progress).toBe(initialProgress + 1)
    })
  })

  describe('message getter', () => {
    it('returns message by index with id set', () => {
      const store = useComposeStore()
      store.messages = [{ type: 'Offer', item: 'Sofa' }]
      const m = store.message(0)
      expect(m.item).toBe('Sofa')
      expect(m.id).toBe(0)
    })

    it('returns undefined for missing index', () => {
      const store = useComposeStore()
      expect(store.message(5)).toBeUndefined()
    })
  })

  describe('all getter', () => {
    it('returns all messages with default Offer and Wanted', () => {
      const store = useComposeStore()
      const all = store.all
      expect(all).toHaveLength(2)
      expect(all[0].type).toBe('Offer')
      expect(all[1].type).toBe('Wanted')
    })

    it('does not add default Offer when one exists', () => {
      const store = useComposeStore()
      store.messages = [{ id: 0, type: 'Offer', item: 'Sofa' }]
      const all = store.all
      const offers = all.filter((m) => m.type === 'Offer')
      expect(offers).toHaveLength(1)
      expect(offers[0].item).toBe('Sofa')
    })

    it('adds missing Wanted when only Offer exists', () => {
      const store = useComposeStore()
      store.messages = [{ id: 0, type: 'Offer' }]
      const all = store.all
      const wanteds = all.filter((m) => m.type === 'Wanted')
      expect(wanteds).toHaveLength(1)
    })

    it('skips null entries', () => {
      const store = useComposeStore()
      store.messages = [null, { id: 1, type: 'Offer' }]
      const all = store.all
      const offers = all.filter((m) => m.type === 'Offer')
      expect(offers).toHaveLength(1)
    })
  })

  describe('attachments getter', () => {
    it('returns attachments for message', () => {
      const store = useComposeStore()
      store.messages = [{ id: 0, attachments: [{ id: 10 }] }]
      expect(store.attachments(0)).toHaveLength(1)
    })

    it('returns empty array when no attachments', () => {
      const store = useComposeStore()
      store.messages = [{ id: 0 }]
      expect(store.attachments(0)).toEqual([])
    })
  })

  describe('progress getter', () => {
    it('returns percentage progress', () => {
      const store = useComposeStore()
      store._progress = 2
      store.max = 4
      // min(2, 3) * 100 / 4 = 50
      expect(store.progress).toBe(50)
    })

    it('caps at max - 1', () => {
      const store = useComposeStore()
      store._progress = 10
      store.max = 4
      // min(10, 3) * 100 / 4 = 75
      expect(store.progress).toBe(75)
    })
  })

  describe('messageValid getter', () => {
    it('returns true when message has item and description', () => {
      const store = useComposeStore()
      store.messages = [
        { type: 'Offer', item: 'Sofa', description: 'Good condition' },
      ]
      expect(store.messageValid({ value: 'Offer' })).toBe(true)
    })

    it('returns true when message has item and real photos', () => {
      const store = useComposeStore()
      store.messages = [
        { type: 'Offer', item: 'Sofa', attachments: [{ id: 1 }] },
      ]
      expect(store.messageValid({ value: 'Offer' })).toBe(true)
    })

    it('returns false when item is missing', () => {
      const store = useComposeStore()
      store.messages = [
        { type: 'Offer', item: '', description: 'Good condition' },
      ]
      expect(store.messageValid({ value: 'Offer' })).toBe(false)
    })

    it('returns false when only AI photos and no description', () => {
      const store = useComposeStore()
      store.messages = [
        {
          type: 'Offer',
          item: 'Sofa',
          attachments: [{ id: 1, externalmods: { ai: true } }],
        },
      ]
      expect(store.messageValid({ value: 'Offer' })).toBe(false)
    })

    it('returns false when no messages', () => {
      const store = useComposeStore()
      expect(store.messageValid({ value: 'Offer' })).toBe(false)
    })
  })

  describe('postcodeValid getter', () => {
    it('returns name when postcode set', () => {
      const store = useComposeStore()
      store.postcode = { name: 'SW1A 1AA' }
      expect(store.postcodeValid).toBe('SW1A 1AA')
    })

    it('returns falsy when no postcode', () => {
      const store = useComposeStore()
      expect(store.postcodeValid).toBeFalsy()
    })
  })

  describe('noGroups getter', () => {
    it('returns true when no groupsnear', () => {
      const store = useComposeStore()
      store.postcode = { name: 'AB1' }
      expect(store.noGroups).toBe(true)
    })

    it('returns false when groups exist', () => {
      const store = useComposeStore()
      store.postcode = { name: 'AB1', groupsnear: [{ id: 1 }] }
      expect(store.noGroups).toBe(false)
    })

    it('returns true when no postcode', () => {
      const store = useComposeStore()
      expect(store.noGroups).toBe(true)
    })
  })
})
