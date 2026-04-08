import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { nextTick } from 'vue'

const mockFetch = vi.fn()

vi.mock('#imports', () => ({
  useNuxtApp: () => ({
    $api: {
      dashboard: {
        fetch: mockFetch,
      },
    },
  }),
}))

describe('useModDashboard', () => {
  let useModDashboard

  beforeEach(async () => {
    vi.clearAllMocks()
    mockFetch.mockResolvedValue({ TestComp: 'test-data' })
    const mod = await import('~/modtools/composables/useModDashboard')
    useModDashboard = mod.useModDashboard
  })

  afterEach(() => {
    vi.resetModules()
  })

  function createProps(overrides = {}) {
    return {
      groupid: 123,
      groupName: 'Test Group',
      start: new Date('2026-01-01'),
      end: new Date('2026-01-31'),
      ...overrides,
    }
  }

  it('initializes data properties to null', () => {
    const props = createProps()
    const result = useModDashboard(props, ['TestComp'])
    expect(result.TestComp.value).toBe(null)
  })

  it('fetches data on mount via onMounted hook', async () => {
    const props = createProps()
    useModDashboard(props, ['TestComp'])
    // onMounted runs synchronously during setup in test context
    await nextTick()
    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        components: ['TestComp'],
      })
    )
  })

  it('populates data from API response', async () => {
    mockFetch.mockResolvedValue({ TestComp: '{"key":"value"}' })
    const props = createProps()
    const result = useModDashboard(props, ['TestComp'])
    await nextTick() // onMounted
    await nextTick() // async fetchData resolves
    expect(result.TestComp.value).toBe('{"key":"value"}')
  })

  it('resets loading to false even when API throws', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))
    const props = createProps()
    const result = useModDashboard(props, ['TestComp'])
    await nextTick()
    await nextTick()
    expect(result.loading.value).toBe(false)
  })

  it('retries fetch when maybeFetch called while loading', async () => {
    let resolveFirst
    mockFetch.mockImplementationOnce(
      () => new Promise((resolve) => (resolveFirst = resolve))
    )
    mockFetch.mockResolvedValueOnce({ TestComp: 'second-data' })

    const props = createProps()
    const result = useModDashboard(props, ['TestComp'])
    await nextTick() // onMounted triggers first fetch

    // First fetch is in-flight. Call maybeFetch — should queue.
    result.maybeFetch()

    // Resolve first fetch
    resolveFirst({ TestComp: 'first-data' })
    await nextTick()
    await nextTick()
    await nextTick()

    // Second fetch should have been triggered
    expect(mockFetch).toHaveBeenCalledTimes(2)
  })

  it('does not fetch when grouprequired and no groupid', async () => {
    const props = createProps({ groupid: null })
    useModDashboard(props, ['TestComp'], true)
    await nextTick()
    expect(mockFetch).not.toHaveBeenCalled()
  })
})
