import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import GlobalMessage from '~/components/GlobalMessage.vue'

// Mock misc store
const mockMiscStore = {
  get: vi.fn(),
  set: vi.fn(),
}

vi.mock('~/stores/misc', () => ({
  useMiscStore: () => mockMiscStore,
}))

// Mock auth store
let mockGroups = []

vi.mock('~/stores/auth', () => ({
  useAuthStore: () => ({
    get groups() {
      return mockGroups
    },
  }),
}))

describe('GlobalMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockMiscStore.get.mockReturnValue(false)
    mockGroups = []
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-06-01'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  function createWrapper() {
    return mount(GlobalMessage, {
      global: {
        stubs: {
          PrivacyUpdate: {
            template: '<div class="privacy-update"></div>',
          },
          'b-card': {
            template: '<div class="b-card"><slot /></div>',
          },
          'b-button': {
            template:
              '<button :class="variant" :href="href" :target="target" @click="$emit(\'click\', $event)"><slot /></button>',
            props: ['variant', 'size', 'href', 'target'],
          },
        },
      },
    })
  }

  it('always renders PrivacyUpdate component', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('.privacy-update').exists()).toBe(true)
  })

  it('shows banner only for users in relevant groups who joined after cutoff', () => {
    // No relevant groups - no banner
    mockGroups = [{ groupid: 999, added: '2024-10-01' }]
    let wrapper = createWrapper()
    expect(wrapper.find('.b-card').exists()).toBe(false)

    // Relevant group but joined before cutoff - no banner
    mockGroups = [{ groupid: 126719, added: '2024-08-01' }]
    wrapper = createWrapper()
    expect(wrapper.find('.b-card').exists()).toBe(false)

    // Relevant group joined after cutoff - shows banner with survey link
    mockGroups = [{ groupid: 126719, added: '2024-10-01' }]
    wrapper = createWrapper()
    expect(wrapper.find('.b-card').exists()).toBe(true)
    const surveyButton = wrapper
      .findAll('button')
      .find((b) => b.text().includes('Click to open survey'))
    expect(surveyButton.attributes('href')).toBe(
      'https://ilovefreegle.org/shortlink/WandsworthSurvey'
    )
    expect(surveyButton.attributes('target')).toBe('_blank')
  })

  it('hides banner after active date expires', () => {
    mockGroups = [{ groupid: 126719, added: '2024-10-01' }]

    // Before expiry - shows banner
    vi.setSystemTime(new Date('2025-06-21'))
    let wrapper = createWrapper()
    expect(wrapper.find('.b-card').exists()).toBe(true)

    // After expiry - no banner
    vi.setSystemTime(new Date('2025-06-23'))
    wrapper = createWrapper()
    expect(wrapper.find('.b-card').exists()).toBe(false)
  })

  it('hide functionality stores preference and shows restore link', async () => {
    mockGroups = [{ groupid: 126719, added: '2024-10-01' }]

    // Initially visible
    const wrapper = createWrapper()
    expect(wrapper.find('.b-card').exists()).toBe(true)

    // Click hide - stores preference
    const hideButton = wrapper
      .findAll('button')
      .find((b) => b.text() === 'Hide')
    await hideButton.trigger('click')
    expect(mockMiscStore.set).toHaveBeenCalledWith({
      key: 'hideglobalwarning20250530',
      value: true,
    })
  })

  it('when hidden shows restore link that unhides banner', async () => {
    mockGroups = [{ groupid: 126719, added: '2024-10-01' }]
    mockMiscStore.get.mockReturnValue(true)

    const wrapper = createWrapper()

    // Card hidden, show link visible
    expect(wrapper.find('.b-card').exists()).toBe(false)
    expect(wrapper.text()).toContain('Show notice')

    // Click restore - clears preference
    const showLink = wrapper.find('.text-danger')
    await showLink.trigger('click')
    expect(mockMiscStore.set).toHaveBeenCalledWith({
      key: 'hideglobalwarning20250530',
      value: false,
    })
  })
})
