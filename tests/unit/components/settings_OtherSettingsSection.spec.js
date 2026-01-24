import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import OtherSettingsSection from '~/components/settings/OtherSettingsSection.vue'

const { mockMe } = vi.hoisted(() => {
  const { ref } = require('vue')
  return {
    mockMe: ref({
      settings: {
        enterNewLine: false,
        autorepostsdisable: false,
      },
    }),
  }
})

const mockSaveAndGet = vi.fn()
const mockSetMarketingConsent = vi.fn()

vi.mock('~/composables/useMe', () => ({
  useMe: () => ({
    me: mockMe,
  }),
}))

vi.mock('~/stores/auth', () => ({
  useAuthStore: () => ({
    saveAndGet: mockSaveAndGet,
  }),
}))

vi.mock('~/stores/misc', () => ({
  useMiscStore: () => ({
    marketingConsent: true,
    setMarketingConsent: mockSetMarketingConsent,
  }),
}))

describe('OtherSettingsSection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockMe.value = {
      settings: {
        enterNewLine: false,
        autorepostsdisable: false,
      },
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
          OurToggle: {
            template:
              '<div class="our-toggle" :data-checked="modelValue" @click="$emit(\'change\', !modelValue)"><slot /></div>',
            props: ['modelValue', 'width', 'sync', 'labels', 'color'],
          },
          'nuxt-link': {
            template: '<a :href="to"><slot /></a>',
            props: ['to', 'noPrefetch'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders settings section container', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.settings-section').exists()).toBe(true)
    })

    it('renders section header', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.section-header').exists()).toBe(true)
    })

    it('displays Other Settings title', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('h2').text()).toBe('Other Settings')
    })

    it('renders cog icon', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.v-icon[data-icon="cog"]').exists()).toBe(true)
    })

    it('renders section content', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.section-content').exists()).toBe(true)
    })
  })

  describe('enter key option', () => {
    it('renders enter key option row', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Enter key in chat')
    })

    it('renders enter key description', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Send message or add new line')
    })

    it('renders enter key toggle', () => {
      const wrapper = createWrapper()
      const toggles = wrapper.findAll('.our-toggle')
      expect(toggles.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('auto-repost option', () => {
    it('renders auto-repost option row', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Auto-repost')
    })

    it('renders auto-repost description', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Bump posts until marked as done')
    })

    it('renders My Posts link in description', () => {
      const wrapper = createWrapper()
      const link = wrapper.find('a[href="/myposts"]')
      expect(link.exists()).toBe(true)
      expect(link.text()).toBe('My Posts')
    })
  })

  describe('marketing consent option', () => {
    it('renders marketing consent option row', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Freegle updates')
    })

    it('renders marketing consent description', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('News and ways to support Freegle')
    })
  })

  describe('option rows', () => {
    it('renders three option rows', () => {
      const wrapper = createWrapper()
      const rows = wrapper.findAll('.option-row')
      expect(rows.length).toBe(3)
    })

    it('renders option info for each row', () => {
      const wrapper = createWrapper()
      const infos = wrapper.findAll('.option-info')
      expect(infos.length).toBe(3)
    })

    it('renders option labels', () => {
      const wrapper = createWrapper()
      const labels = wrapper.findAll('.option-label')
      expect(labels.length).toBe(3)
    })

    it('renders option descriptions', () => {
      const wrapper = createWrapper()
      const descs = wrapper.findAll('.option-desc')
      expect(descs.length).toBe(3)
    })
  })

  describe('reactive state', () => {
    it('initializes autorepostsLocal as true when not disabled', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.autorepostsLocal).toBe(true)
    })

    it('initializes autorepostsLocal as false when disabled', async () => {
      mockMe.value = {
        settings: {
          autorepostsdisable: true,
        },
      }
      const wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.autorepostsLocal).toBe(false)
    })

    it('initializes enterNewLineLocal from settings', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.enterNewLineLocal).toBe(false)
    })

    it('initializes enterNewLineLocal as true when set', async () => {
      mockMe.value = {
        settings: {
          enterNewLine: true,
        },
      }
      const wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.enterNewLineLocal).toBe(true)
    })

    it('initializes marketingConsentLocal', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.marketingConsentLocal).toBe(true)
    })
  })

  describe('methods', () => {
    describe('changeNewLine', () => {
      it('calls authStore.saveAndGet with settings', async () => {
        const wrapper = createWrapper()
        await wrapper.vm.changeNewLine(true)
        expect(mockSaveAndGet).toHaveBeenCalled()
        const call = mockSaveAndGet.mock.calls[0][0]
        expect(call.settings.enterNewLine).toBe(true)
      })

      it('updates enterNewLineLocal', async () => {
        const wrapper = createWrapper()
        await wrapper.vm.changeNewLine(true)
        expect(wrapper.vm.enterNewLineLocal).toBe(true)
      })

      it('emits update event', async () => {
        const wrapper = createWrapper()
        await wrapper.vm.changeNewLine(true)
        expect(wrapper.emitted('update')).toBeTruthy()
      })
    })

    describe('changeAutorepost', () => {
      it('calls authStore.saveAndGet with settings', async () => {
        const wrapper = createWrapper()
        await wrapper.vm.changeAutorepost(false)
        expect(mockSaveAndGet).toHaveBeenCalled()
        const call = mockSaveAndGet.mock.calls[0][0]
        expect(call.settings.autorepostsdisable).toBe(true)
      })

      it('inverts the value for autorepostsdisable', async () => {
        const wrapper = createWrapper()
        await wrapper.vm.changeAutorepost(true)
        const call = mockSaveAndGet.mock.calls[0][0]
        expect(call.settings.autorepostsdisable).toBe(false)
      })

      it('emits update event', async () => {
        const wrapper = createWrapper()
        await wrapper.vm.changeAutorepost(true)
        expect(wrapper.emitted('update')).toBeTruthy()
      })
    })

    describe('changeMarketingConsent', () => {
      it('calls miscStore.setMarketingConsent', () => {
        const wrapper = createWrapper()
        wrapper.vm.changeMarketingConsent(true)
        expect(mockSetMarketingConsent).toHaveBeenCalledWith(true)
      })

      it('passes false to setMarketingConsent', () => {
        const wrapper = createWrapper()
        wrapper.vm.changeMarketingConsent(false)
        expect(mockSetMarketingConsent).toHaveBeenCalledWith(false)
      })
    })
  })

  describe('watch', () => {
    it('updates autorepostsLocal when me changes', async () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.autorepostsLocal).toBe(true)

      mockMe.value = {
        settings: {
          autorepostsdisable: true,
        },
      }
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.autorepostsLocal).toBe(false)
    })

    it('updates enterNewLineLocal when me changes', async () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.enterNewLineLocal).toBe(false)

      mockMe.value = {
        settings: {
          enterNewLine: true,
        },
      }
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.enterNewLineLocal).toBe(true)
    })
  })
})
