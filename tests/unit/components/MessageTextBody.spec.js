import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import MessageTextBody from '~/components/MessageTextBody.vue'

// Mock message store
const mockByIdFn = vi.fn()

vi.mock('~/stores/message', () => ({
  useMessageStore: () => ({
    byId: mockByIdFn,
  }),
}))

// Mock twem composable
vi.mock('~/composables/useTwem', () => ({
  twem: (text) => text,
}))

describe('MessageTextBody', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function createWrapper(props = {}) {
    return mount(MessageTextBody, {
      props: { id: 123, ...props },
    })
  }

  it('renders plain text when no search match', () => {
    mockByIdFn.mockReturnValue({
      id: 123,
      textbody: 'This is a test message',
      matchedon: null,
    })
    const wrapper = createWrapper()

    // Should render the forcebreak span (not Highlighter)
    expect(wrapper.find('.prewrap.forcebreak').exists()).toBe(true)
    expect(wrapper.find('mark.highlight').exists()).toBe(false)
  })

  it('highlights matched word when matchedon exists', () => {
    mockByIdFn.mockReturnValue({
      id: 123,
      textbody: 'Looking for a bicycle',
      matchedon: { word: 'bicycle' },
    })
    const wrapper = createWrapper()

    // Should use Highlighter (no forcebreak class) with highlighted mark
    expect(wrapper.find('.prewrap.forcebreak').exists()).toBe(false)
    const highlight = wrapper.find('mark.highlight')
    expect(highlight.exists()).toBe(true)
    expect(highlight.text()).toBe('bicycle')
  })
})
