import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

const mockFetch = vi.fn()
const mockTypeahead = vi.fn()
const mockLatlng = vi.fn()
const mockFetchv2 = vi.fn()
const mockDel = vi.fn()
const mockAdd = vi.fn()
const mockUpdate = vi.fn()
const mockConvertKML = vi.fn()

vi.mock('~/api', () => ({
  default: () => ({
    location: {
      fetch: mockFetch,
      typeahead: mockTypeahead,
      latlng: mockLatlng,
      fetchv2: mockFetchv2,
      del: mockDel,
      add: mockAdd,
      update: mockUpdate,
      convertKML: mockConvertKML,
    },
  }),
}))

describe('location store', () => {
  let useLocationStore

  beforeEach(async () => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    const mod = await import('~/stores/location')
    useLocationStore = mod.useLocationStore
  })

  describe('initial state', () => {
    it('starts with empty list', () => {
      const store = useLocationStore()
      expect(store.list).toEqual({})
    })
  })

  describe('fetch', () => {
    it('returns full response when locations array present', async () => {
      const store = useLocationStore()
      store.init({ public: {} })
      const response = { locations: [{ id: 1 }, { id: 2 }] }
      mockFetch.mockResolvedValue(response)

      const result = await store.fetch({ id: 1 })
      expect(result).toEqual(response)
    })

    it('returns single location when response has location property', async () => {
      const store = useLocationStore()
      store.init({ public: {} })
      mockFetch.mockResolvedValue({ location: { id: 1, name: 'Test' } })

      const result = await store.fetch({ id: 1 })
      expect(result).toEqual({ id: 1, name: 'Test' })
    })

    it('returns locations property when no locations array and no single location', async () => {
      const store = useLocationStore()
      store.init({ public: {} })
      mockFetch.mockResolvedValue({ other: 'data' })

      const result = await store.fetch({ id: 1 })
      expect(result).toBeUndefined()
    })
  })

  describe('typeahead', () => {
    it('returns typeahead results', async () => {
      const store = useLocationStore()
      store.init({ public: {} })
      mockTypeahead.mockResolvedValue([{ id: 1, name: 'London' }])

      const result = await store.typeahead('Lon')
      expect(result).toEqual([{ id: 1, name: 'London' }])
    })
  })

  describe('fetchByLatLng', () => {
    it('fetches location by coordinates', async () => {
      const store = useLocationStore()
      store.init({ public: {} })
      mockLatlng.mockResolvedValue({ id: 1, name: 'Nearby' })

      const result = await store.fetchByLatLng(51.5, -0.1)
      expect(result).toEqual({ id: 1, name: 'Nearby' })
      expect(mockLatlng).toHaveBeenCalledWith(51.5, -0.1)
    })
  })

  describe('fetchv2', () => {
    it('fetches and caches location', async () => {
      const store = useLocationStore()
      store.init({ public: {} })
      mockFetchv2.mockResolvedValue({ id: 1, name: 'Test' })

      const result = await store.fetchv2(1)
      expect(result).toEqual({ id: 1, name: 'Test' })
      expect(store.list[1]).toEqual({ id: 1, name: 'Test' })
    })

    it('handles null response', async () => {
      const store = useLocationStore()
      store.init({ public: {} })
      mockFetchv2.mockResolvedValue(null)

      const result = await store.fetchv2(1)
      expect(result).toBeNull()
      expect(store.list[1]).toBeUndefined()
    })
  })

  describe('delete', () => {
    it('deletes location and removes from list', async () => {
      const store = useLocationStore()
      store.init({ public: {} })
      store.list[1] = { id: 1, name: 'Test' }
      mockDel.mockResolvedValue({})

      await store.delete({ id: 1, groupid: 5 })
      expect(mockDel).toHaveBeenCalledWith(1, 5)
      expect(store.list[1]).toBeUndefined()
    })
  })

  describe('add', () => {
    it('adds location and returns id', async () => {
      const store = useLocationStore()
      store.init({ public: {} })
      mockAdd.mockResolvedValue({ id: 42 })

      const id = await store.add({ name: 'New', groupid: 5 })
      expect(id).toBe(42)
    })
  })

  describe('update', () => {
    it('calls API update', async () => {
      const store = useLocationStore()
      store.init({ public: {} })
      mockUpdate.mockResolvedValue({})

      await store.update({ id: 1, name: 'Updated' })
      expect(mockUpdate).toHaveBeenCalledWith({ id: 1, name: 'Updated' })
    })
  })

  describe('convertKML', () => {
    it('converts KML to WKT', async () => {
      const store = useLocationStore()
      store.init({ public: {} })
      mockConvertKML.mockResolvedValue({ wkt: 'POLYGON(...)' })

      const result = await store.convertKML('<kml>...</kml>')
      expect(result).toBe('POLYGON(...)')
    })
  })

  describe('byId getter', () => {
    it('returns location by id', () => {
      const store = useLocationStore()
      store.list[1] = { id: 1, name: 'Test' }
      expect(store.byId(1)).toEqual({ id: 1, name: 'Test' })
    })

    it('returns undefined for unknown id', () => {
      const store = useLocationStore()
      expect(store.byId(999)).toBeUndefined()
    })
  })
})
