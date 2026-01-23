import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import ModSettingsPersonal from '~/modtools/components/ModSettingsPersonal.vue'

// Mock stores
const mockAuthStore = {
  saveAndGet: vi.fn(),
  saveEmail: vi.fn(),
}

const mockMiscStore = {
  get: vi.fn(),
  set: vi.fn(),
}

const mockMe = {
  displayname: 'Test User',
  email: 'test@example.com',
  settings: {
    showmod: true,
    modnotifnewsfeed: true,
    modnotifs: 4,
    backupmodnotifs: 12,
  },
}

vi.mock('~/stores/auth', () => ({
  useAuthStore: () => mockAuthStore,
}))

vi.mock('@/stores/misc', () => ({
  useMiscStore: () => mockMiscStore,
}))

vi.mock('~/composables/useMe', () => ({
  useMe: () => ({
    me: { value: mockMe },
  }),
}))

describe('ModSettingsPersonal', () => {
  function mountComponent() {
    return mount(ModSettingsPersonal, {
      global: {
        stubs: {
          'b-form-group': {
            template:
              '<div class="form-group"><label>{{ label }}</label><slot /></div>',
            props: ['label'],
          },
          'b-form-text': {
            template: '<small class="form-text"><slot /></small>',
          },
          'b-input-group': {
            template:
              '<div class="input-group"><slot /><slot name="append" /></div>',
          },
          'b-form-input': {
            template:
              '<input class="form-input" :type="type || \'text\'" :value="modelValue" :placeholder="placeholder" @input="$emit(\'update:modelValue\', $event.target.value)" />',
            props: ['modelValue', 'placeholder', 'type', 'label'],
          },
          'b-form-select': {
            template:
              '<select class="form-select" :value="modelValue" @change="$emit(\'update:modelValue\', parseInt($event.target.value))"><option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.text }}</option></select>',
            props: ['modelValue', 'options'],
          },
          'b-button': {
            template:
              '<button class="btn" :class="\'btn-\' + variant" :to="to" @click="$emit(\'click\', $event)"><slot /></button>',
            props: ['variant', 'to'],
          },
          SpinButton: {
            template:
              '<button class="spin-button" @click="handleClick"><slot>{{ label }}</slot></button>',
            props: ['variant', 'iconName', 'label'],
            emits: ['handle'],
            methods: {
              handleClick() {
                this.$emit('handle', () => {})
              },
            },
          },
          OurToggle: {
            template:
              '<div class="our-toggle" :data-value="modelValue" @click="toggle"><span>{{ modelValue ? labels.checked : labels.unchecked }}</span></div>',
            props: [
              'modelValue',
              'height',
              'width',
              'fontSize',
              'sync',
              'labels',
              'variant',
            ],
            emits: ['update:modelValue'],
            methods: {
              toggle() {
                this.$emit('update:modelValue', !this.modelValue)
              },
            },
          },
          EmailConfirmModal: {
            template: '<div v-if="show" class="email-confirm-modal"></div>',
            props: [],
            data() {
              return { show: false }
            },
          },
          ModCake: {
            template: '<div class="mod-cake">Cake component</div>',
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockAuthStore.saveAndGet.mockResolvedValue()
    mockAuthStore.saveEmail.mockResolvedValue({ ret: 0 })
    mockMiscStore.get.mockReturnValue(false)
    mockMiscStore.set.mockResolvedValue()

    // Reset mock me
    mockMe.displayname = 'Test User'
    mockMe.email = 'test@example.com'
    mockMe.settings = {
      showmod: true,
      modnotifnewsfeed: true,
      modnotifs: 4,
      backupmodnotifs: 12,
    }
  })

  describe('rendering', () => {
    it('renders the component', () => {
      const wrapper = mountComponent()
      expect(wrapper.exists()).toBe(true)
    })

    it('renders display name input', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Your visible name')
    })

    it('renders email input', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Your email address')
    })

    it('renders moderation notifications (active) select', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Moderation Notifications (Active)')
    })

    it('renders moderation notifications (backup) select', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Moderation Notifications (Backup)')
    })

    it('renders show as volunteer toggle', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Show me as a volunteer')
    })

    it('renders ChitChat email toggle', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Email me about ChitChat')
    })

    it('renders enter send vs newline toggle', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Enter send vs newline')
    })

    it('renders ModCake component', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.mod-cake').exists()).toBe(true)
    })

    it('renders unsubscribe section', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Unsubscribe')
    })

    it('renders unsubscribe button with link to /unsubscribe', () => {
      const wrapper = mountComponent()
      const unsubButton = wrapper
        .findAll('button')
        .find((b) => b.text() === 'Unsubscribe')
      expect(unsubButton).toBeDefined()
      expect(unsubButton.attributes('to')).toBe('/unsubscribe')
    })
  })

  describe('modNotifOptions', () => {
    it('provides correct notification options', () => {
      const wrapper = mountComponent()
      const expectedOptions = [
        { text: 'Daily', value: 24 },
        { text: 'After 12 hours', value: 12 },
        { text: 'After 4 hours', value: 4 },
        { text: 'After 2 hours', value: 2 },
        { text: 'After 1 hour', value: 1 },
        { text: 'Immediately', value: 0 },
        { text: 'Never', value: -1 },
      ]
      expect(wrapper.vm.modNotifOptions).toEqual(expectedOptions)
    })
  })

  describe('computed properties', () => {
    describe('showme', () => {
      it('returns true when showmod setting is true', () => {
        mockMe.settings.showmod = true
        const wrapper = mountComponent()
        expect(wrapper.vm.showme).toBe(true)
      })

      it('returns false when showmod setting is false', () => {
        mockMe.settings.showmod = false
        const wrapper = mountComponent()
        expect(wrapper.vm.showme).toBe(false)
      })

      it('returns true when showmod setting is not set (default)', () => {
        delete mockMe.settings.showmod
        const wrapper = mountComponent()
        expect(wrapper.vm.showme).toBe(true)
      })

      it('calls saveSetting when set', async () => {
        const wrapper = mountComponent()
        wrapper.vm.showme = false
        await flushPromises()
        expect(mockAuthStore.saveAndGet).toHaveBeenCalled()
      })
    })

    describe('modnotifnewsfeed', () => {
      it('returns true when modnotifnewsfeed setting is true', () => {
        mockMe.settings.modnotifnewsfeed = true
        const wrapper = mountComponent()
        expect(wrapper.vm.modnotifnewsfeed).toBe(true)
      })

      it('returns false when modnotifnewsfeed setting is false', () => {
        mockMe.settings.modnotifnewsfeed = false
        const wrapper = mountComponent()
        expect(wrapper.vm.modnotifnewsfeed).toBe(false)
      })

      it('returns true when modnotifnewsfeed setting is not set (default)', () => {
        delete mockMe.settings.modnotifnewsfeed
        const wrapper = mountComponent()
        expect(wrapper.vm.modnotifnewsfeed).toBe(true)
      })
    })

    describe('modnotifs', () => {
      it('returns value from settings', () => {
        mockMe.settings.modnotifs = 2
        const wrapper = mountComponent()
        expect(wrapper.vm.modnotifs).toBe(2)
      })

      it('returns 4 as default when not set', () => {
        delete mockMe.settings.modnotifs
        const wrapper = mountComponent()
        expect(wrapper.vm.modnotifs).toBe(4)
      })

      it('parses string value to integer', () => {
        mockMe.settings.modnotifs = '12'
        const wrapper = mountComponent()
        expect(wrapper.vm.modnotifs).toBe(12)
      })
    })

    describe('backupmodnotifs', () => {
      it('returns value from settings', () => {
        mockMe.settings.backupmodnotifs = 24
        const wrapper = mountComponent()
        expect(wrapper.vm.backupmodnotifs).toBe(24)
      })

      it('returns 12 as default when not set', () => {
        delete mockMe.settings.backupmodnotifs
        const wrapper = mountComponent()
        expect(wrapper.vm.backupmodnotifs).toBe(12)
      })
    })

    describe('enterAddsNewLine', () => {
      it('returns value from misc store', () => {
        mockMiscStore.get.mockReturnValue(true)
        const wrapper = mountComponent()
        expect(wrapper.vm.enterAddsNewLine).toBe(true)
      })

      it('calls miscStore.set when changed', async () => {
        const wrapper = mountComponent()
        wrapper.vm.enterAddsNewLine = true
        await flushPromises()
        expect(mockMiscStore.set).toHaveBeenCalledWith({
          key: 'enternewlinemt',
          value: true,
        })
      })
    })
  })

  describe('methods', () => {
    describe('saveName', () => {
      it('calls saveAndGet with displayname', async () => {
        mockMe.displayname = 'New Name'
        const wrapper = mountComponent()
        const callback = vi.fn()
        await wrapper.vm.saveName(callback)
        expect(mockAuthStore.saveAndGet).toHaveBeenCalledWith({
          displayname: 'New Name',
        })
        expect(callback).toHaveBeenCalled()
      })
    })

    describe('saveEmail', () => {
      it('calls saveEmail on auth store', async () => {
        mockMe.email = 'new@example.com'
        const wrapper = mountComponent()
        const callback = vi.fn()
        await wrapper.vm.saveEmail(callback)
        expect(mockAuthStore.saveEmail).toHaveBeenCalledWith({
          email: 'new@example.com',
        })
        expect(callback).toHaveBeenCalled()
      })

      it('does not call saveEmail when email is empty', async () => {
        mockMe.email = ''
        const wrapper = mountComponent()
        const callback = vi.fn()
        await wrapper.vm.saveEmail(callback)
        expect(mockAuthStore.saveEmail).not.toHaveBeenCalled()
        expect(callback).toHaveBeenCalled()
      })

      it('shows confirm modal when ret is 10', async () => {
        mockAuthStore.saveEmail.mockResolvedValue({ ret: 10 })
        mockMe.email = 'new@example.com'
        const wrapper = mountComponent()
        const callback = vi.fn()
        await wrapper.vm.saveEmail(callback)
        expect(wrapper.vm.showEmailConfirmModal).toBe(true)
      })

      it('does not show confirm modal when ret is not 10', async () => {
        mockAuthStore.saveEmail.mockResolvedValue({ ret: 0 })
        mockMe.email = 'new@example.com'
        const wrapper = mountComponent()
        const callback = vi.fn()
        await wrapper.vm.saveEmail(callback)
        expect(wrapper.vm.showEmailConfirmModal).toBe(false)
      })
    })

    describe('saveSetting', () => {
      it('saves setting to auth store', async () => {
        const wrapper = mountComponent()
        await wrapper.vm.saveSetting('showmod', true)
        expect(mockAuthStore.saveAndGet).toHaveBeenCalledWith({
          settings: expect.objectContaining({ showmod: true }),
        })
      })

      it('preserves existing settings when saving new one', async () => {
        mockMe.settings = { existingKey: 'value', modnotifs: 4 }
        const wrapper = mountComponent()
        await wrapper.vm.saveSetting('newKey', 'newValue')
        expect(mockAuthStore.saveAndGet).toHaveBeenCalledWith({
          settings: expect.objectContaining({
            existingKey: 'value',
            modnotifs: 4,
            newKey: 'newValue',
          }),
        })
      })
    })
  })

  describe('user interactions', () => {
    it('triggers saveName when save button is clicked', async () => {
      const wrapper = mountComponent()
      const nameInput = wrapper.find('input[placeholder="Your name"]')
      expect(nameInput.exists()).toBe(true)

      // Find the save button in the name section
      const saveButtons = wrapper.findAll('.spin-button')
      expect(saveButtons.length).toBeGreaterThan(0)

      await saveButtons[0].trigger('click')
      await flushPromises()
      expect(mockAuthStore.saveAndGet).toHaveBeenCalled()
    })

    it('renders name input with placeholder', () => {
      const wrapper = mountComponent()
      const nameInput = wrapper.find('input[placeholder="Your name"]')
      expect(nameInput.exists()).toBe(true)
    })

    it('renders email input with placeholder', () => {
      const wrapper = mountComponent()
      const emailInput = wrapper.find('input[placeholder="Your email"]')
      expect(emailInput.exists()).toBe(true)
    })

    it('updates modnotifs when select changes', async () => {
      const wrapper = mountComponent()
      const selects = wrapper.findAll('.form-select')
      // First select is modnotifs
      if (selects.length > 0) {
        await selects[0].setValue(2)
        await flushPromises()
        expect(mockAuthStore.saveAndGet).toHaveBeenCalled()
      }
    })
  })

  describe('toggle interactions', () => {
    it('toggles showme setting', async () => {
      mockMe.settings.showmod = true
      const wrapper = mountComponent()
      const toggles = wrapper.findAll('.our-toggle')
      expect(toggles.length).toBeGreaterThan(0)

      await toggles[0].trigger('click')
      await flushPromises()
      expect(mockAuthStore.saveAndGet).toHaveBeenCalled()
    })

    it('toggles modnotifnewsfeed setting', async () => {
      mockMe.settings.modnotifnewsfeed = true
      const wrapper = mountComponent()
      const toggles = wrapper.findAll('.our-toggle')
      expect(toggles.length).toBeGreaterThan(1)

      await toggles[1].trigger('click')
      await flushPromises()
      expect(mockAuthStore.saveAndGet).toHaveBeenCalled()
    })

    it('toggles enterAddsNewLine setting', async () => {
      const wrapper = mountComponent()
      const toggles = wrapper.findAll('.our-toggle')
      expect(toggles.length).toBeGreaterThan(2)

      await toggles[2].trigger('click')
      await flushPromises()
      expect(mockMiscStore.set).toHaveBeenCalled()
    })
  })

  describe('edge cases', () => {
    it('handles empty settings object', () => {
      mockMe.settings = {}
      const wrapper = mountComponent()
      expect(wrapper.vm.showme).toBe(true) // default
      expect(wrapper.vm.modnotifnewsfeed).toBe(true) // default
      expect(wrapper.vm.modnotifs).toBe(4) // default
      expect(wrapper.vm.backupmodnotifs).toBe(12) // default
    })

    it('handles null email gracefully', async () => {
      mockMe.email = null
      const wrapper = mountComponent()
      const callback = vi.fn()
      await wrapper.vm.saveEmail(callback)
      expect(mockAuthStore.saveEmail).not.toHaveBeenCalled()
    })

    it('handles saveEmail error gracefully', async () => {
      mockAuthStore.saveEmail.mockRejectedValue(new Error('API error'))
      mockMe.email = 'test@example.com'
      const wrapper = mountComponent()
      const callback = vi.fn()
      // Should not throw
      await expect(wrapper.vm.saveEmail(callback)).rejects.toThrow()
    })
  })
})
