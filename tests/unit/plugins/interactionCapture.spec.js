import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('~/stores/loggingContext', () => ({
  useLoggingContextStore: () => ({
    pushModal: vi.fn(),
    popModal: vi.fn(),
    getContext: () => ({}),
    getHeaders: () => ({}),
  }),
}))

vi.mock('~/composables/useClientLog', () => ({
  action: vi.fn(),
}))

let extractElementInfo

describe('interactionCapture - extractElementInfo', () => {
  beforeEach(async () => {
    vi.resetModules()
    const mod = await import('~/plugins/interactionCapture.client.js')
    extractElementInfo = mod.extractElementInfo
  })

  it('returns null when element has no closest method (old browser compat)', () => {
    // Simulate an Element that passes instanceof check but has no closest() method.
    // This occurs in old mobile browsers (pre-Firefox 49, old Android WebView) where
    // certain Element subtypes don't implement closest() on their prototype.
    const el = document.createElement('div')
    Object.defineProperty(el, 'closest', {
      value: undefined,
      writable: true,
      configurable: true,
    })

    // Should return null gracefully, not throw "closest is not a function"
    expect(extractElementInfo(el)).toBeNull()
  })

  it('returns element info for a normal button element', () => {
    const btn = document.createElement('button')
    btn.textContent = 'Click me'

    const result = extractElementInfo(btn)
    expect(result).not.toBeNull()
    expect(result.tag).toBe('button')
    expect(result.label).toBe('Click me')
  })

  it('returns null for document.body', () => {
    expect(extractElementInfo(document.body)).toBeNull()
  })

  it('walks up to parent element for non-Element nodes', () => {
    const div = document.createElement('div')
    const text = document.createTextNode('hello')
    div.appendChild(text)

    // Text node walks up to div parent — returns info for the div, not null
    const result = extractElementInfo(text)
    expect(result).not.toBeNull()
    expect(result.tag).toBe('div')
  })
})
