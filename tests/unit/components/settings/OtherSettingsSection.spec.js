import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import OtherSettingsSection from '~/components/settings/OtherSettingsSection.vue'

const { mockMe } = vi.hoisted(() => {
  return {
    mockMe: {
      id: 1,
      settings: {
        enterNewLine: false,
        autorepostsdisable: false,
      },
    },
  }
})

const mockAuthStore = {
  saveAndGet: vi.fn().mockResolvedValue({}),
}

const mockMiscStore = {
  marketingConsent: true,
  setMarketingConsent: vi.fn(),
}

vi.mock('~/stores/auth', () => ({
  useAuthStore: () => mockAuthStore,
}))

vi.mock('~/stores/misc', () => ({
  useMiscStore: () => mockMiscStore,
}))

vi.mock('~/composables/useMe', () => ({
  useMe: () => ({
    me: { value: mockMe },
  }),
}))

describe('OtherSettingsSection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockMe.settings = {
      enterNewLine: false,
      autorepostsdisable: false,
    }
  })

  function createWrapper() {
    return mount(OtherSettingsSection, {
      global: {
        stubs: {
          'v-icon': {
            template: '<span class="v-icon" :data-icon="icon" />',
            props: ['icon'],
          },
          'nuxt-link': {
            template: '<a :href="to"><slot /></a>',
            props: ['to', 'noPrefetch'],
          },
          OurToggle: {
            template:
              '<button class="our-toggle" :data-checked="modelValue" @click="$emit(\'change\', !modelValue)"><slot /></button>',
            props: ['modelValue', 'width', 'sync', 'labels', 'color'],
            emits: ['change', 'update:modelValue'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders settings section', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.settings-section').exists()).toBe(true)
    })

    it('shows section header with Other Settings title', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Other Settings')
    })

    it('shows cog icon', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('[data-icon="cog"]').exists()).toBe(true)
    })
  })

  describe('enter key setting', () => {
    it('shows enter key option label', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Enter key in chat')
    })

    it('shows enter key description', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Send message or add new line')
    })

    it('has toggle for enter key', () => {
      const wrapper = createWrapper()
      const toggles = wrapper.findAll('.our-toggle')
      expect(toggles.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('auto-repost setting', () => {
    it('shows auto-repost option label', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Auto-repost')
    })

    it('shows auto-repost description', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Bump posts until marked as done')
    })

    it('links to My Posts', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('a[href="/myposts"]').exists()).toBe(true)
    })
  })

  describe('marketing consent setting', () => {
    it('shows freegle updates option label', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Freegle updates')
    })

    it('shows freegle updates description', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('News and ways to support Freegle')
    })
  })

  describe('toggle interactions', () => {
    it('has three toggles', () => {
      const wrapper = createWrapper()
      const toggles = wrapper.findAll('.our-toggle')
      expect(toggles.length).toBe(3)
    })

    it('emits update on toggle change', async () => {
      const wrapper = createWrapper()
      const toggles = wrapper.findAll('.our-toggle')
      await toggles[0].trigger('click')
      await flushPromises()
      expect(wrapper.emitted('update')).toBeTruthy()
    })

    it('saves settings on enter key toggle', async () => {
      const wrapper = createWrapper()
      const toggles = wrapper.findAll('.our-toggle')
      await toggles[0].trigger('click')
      await flushPromises()
      expect(mockAuthStore.saveAndGet).toHaveBeenCalled()
    })

    it('saves settings on auto-repost toggle', async () => {
      const wrapper = createWrapper()
      const toggles = wrapper.findAll('.our-toggle')
      await toggles[1].trigger('click')
      await flushPromises()
      expect(mockAuthStore.saveAndGet).toHaveBeenCalled()
    })

    it('sets marketing consent on toggle', async () => {
      const wrapper = createWrapper()
      const toggles = wrapper.findAll('.our-toggle')
      await toggles[2].trigger('click')
      await flushPromises()
      expect(mockMiscStore.setMarketingConsent).toHaveBeenCalled()
    })
  })
})
