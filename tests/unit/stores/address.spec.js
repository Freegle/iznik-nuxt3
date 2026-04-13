import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

const mockFetchByIdv2 = vi.fn()
const mockFetchv2 = vi.fn()
const mockDel = vi.fn()
const mockFetchAddresses = vi.fn()
const mockUpdate = vi.fn()
const mockAddAddr = vi.fn()

vi.mock('~/api', () => ({
  default: () => ({
    address: {
      fetchByIdv2: mockFetchByIdv2,
      fetchv2: mockFetchv2,
      del: mockDel,
      update: mockUpdate,
      add: mockAddAddr,
    },
    location: {
      fetchAddresses: mockFetchAddresses,
    },
  }),
}))

vi.mock('postman-paf', () => ({
  convertStructuredToUnstructured: vi.fn((input) => ({
    line1: input.buildingNumber + ' ' + input.thoroughfareName,
    line2: input.dependentLocality || '',
    line3: '',
    line4: '',
    line5: '',
  })),
}))

describe('address store', () => {
  let useAddressStore

  beforeEach(async () => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    const mod = await import('~/stores/address')
    useAddressStore = mod.useAddressStore
  })

  describe('initial state', () => {
    it('starts with empty list, listById, and properties', () => {
      const store = useAddressStore()
      expect(store.list).toEqual([])
      expect(store.listById).toEqual({})
      expect(store.properties).toEqual({})
      expect(store.fetching).toBeNull()
    })
  })

  describe('init', () => {
    it('sets config', () => {
      const store = useAddressStore()
      store.init({ public: {} })
      expect(store.config).toEqual({ public: {} })
    })
  })

  describe('fetch', () => {
    let store

    beforeEach(() => {
      store = useAddressStore()
      store.init({ public: {} })
    })

    it('fetches specific address by ID', async () => {
      mockFetchByIdv2.mockResolvedValue({
        id: 42,
        singleline: '1 Test St',
      })

      const result = await store.fetch(42)
      expect(result).toEqual({ id: 42, singleline: '1 Test St' })
      expect(store.listById[42]).toEqual({ id: 42, singleline: '1 Test St' })
    })

    it('returns cached address by ID without refetching', async () => {
      store.listById[42] = { id: 42, singleline: 'Cached' }

      const result = await store.fetch(42)
      expect(result).toEqual({ id: 42, singleline: 'Cached' })
      expect(mockFetchByIdv2).not.toHaveBeenCalled()
    })

    it('refetches address by ID when force=true', async () => {
      store.listById[42] = { id: 42, singleline: 'Old' }
      mockFetchByIdv2.mockResolvedValue({ id: 42, singleline: 'New' })

      const result = await store.fetch(42, true)
      expect(result.singleline).toBe('New')
    })

    it('returns null on fetch error for specific ID', async () => {
      mockFetchByIdv2.mockRejectedValue(new Error('Not found'))

      const result = await store.fetch(42)
      expect(result).toBeNull()
    })

    it('fetches all addresses when no ID given', async () => {
      mockFetchv2.mockResolvedValue([
        { id: 1, singleline: 'Addr 1' },
        { id: 2, singleline: 'Addr 2' },
      ])

      await store.fetch()
      expect(store.list).toHaveLength(2)
      expect(store.listById[1]).toEqual({ id: 1, singleline: 'Addr 1' })
      expect(store.listById[2]).toEqual({ id: 2, singleline: 'Addr 2' })
    })

    it('handles null response for all addresses', async () => {
      mockFetchv2.mockResolvedValue(null)

      await store.fetch()
      expect(store.list).toEqual([])
    })

    it('deduplicates concurrent fetch-all calls', async () => {
      let resolveFirst
      const firstPromise = new Promise((r) => {
        resolveFirst = r
      })
      mockFetchv2.mockReturnValueOnce(firstPromise)

      const fetch1 = store.fetch()
      const fetch2 = store.fetch()

      resolveFirst([{ id: 1, singleline: 'Addr' }])
      await fetch1
      await fetch2

      expect(mockFetchv2).toHaveBeenCalledTimes(1)
    })
  })

  describe('delete', () => {
    it('calls API, removes from listById, and refetches', async () => {
      const store = useAddressStore()
      store.init({ public: {} })
      store.listById[42] = { id: 42 }
      mockDel.mockResolvedValue({})
      mockFetchv2.mockResolvedValue([])

      await store.delete(42)
      expect(mockDel).toHaveBeenCalledWith(42)
      expect(store.listById[42]).toBeUndefined()
    })
  })

  describe('fetchProperties', () => {
    it('fetches addresses and adds singleline property', async () => {
      const store = useAddressStore()
      store.init({ public: {} })
      mockFetchAddresses.mockResolvedValue([
        {
          id: 1,
          postcode: 'AB1 2CD',
          buildingnumber: '42',
          thoroughfaredescriptor: 'High Street',
          dependentlocality: '',
          buildingname: '',
          subbuildingname: '',
          departmentname: '',
          doubledependentlocality: '',
          dependentthoroughfaredescriptor: '',
          organisationname: '',
          suorganisationindicator: '',
          deliverypointsuffix: '',
          udprn: '',
          posttown: 'London',
          postcodetype: '',
          pobox: '',
        },
      ])

      await store.fetchProperties(100)

      expect(mockFetchAddresses).toHaveBeenCalledWith(100)
      expect(store.properties[1]).toBeDefined()
      expect(store.properties[1].singleline).toContain('AB1 2CD')
    })

    it('handles empty address list', async () => {
      const store = useAddressStore()
      store.init({ public: {} })
      mockFetchAddresses.mockResolvedValue([])

      await store.fetchProperties(100)

      expect(Object.keys(store.properties)).toHaveLength(0)
    })
  })

  describe('update', () => {
    it('calls API and refetches the address', async () => {
      const store = useAddressStore()
      store.init({ public: {} })
      mockUpdate.mockResolvedValue({})
      mockFetchByIdv2.mockResolvedValue({ id: 42, singleline: 'Updated' })

      await store.update({ id: 42, instructions: 'Leave at door' })
      expect(mockUpdate).toHaveBeenCalledWith({
        id: 42,
        instructions: 'Leave at door',
      })
    })
  })

  describe('add', () => {
    it('calls API, refetches list, and returns new ID', async () => {
      const store = useAddressStore()
      store.init({ public: {} })
      mockAddAddr.mockResolvedValue({ id: 99 })
      mockFetchv2.mockResolvedValue([{ id: 99, singleline: 'New Addr' }])

      const id = await store.add({ postcodeid: 100, propertyid: 200 })
      expect(id).toBe(99)
      expect(mockAddAddr).toHaveBeenCalledWith({
        postcodeid: 100,
        propertyid: 200,
      })
    })
  })
})
