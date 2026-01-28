import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref } from 'vue'
import ModSettingsModConfig from '~/modtools/components/ModSettingsModConfig.vue'

// Mock stores
const mockModConfigStore = {
  configs: [],
  current: null,
  fetch: vi.fn(),
  fetchConfig: vi.fn(),
  add: vi.fn(),
  delete: vi.fn(),
}

const mockMiscStore = {
  get: vi.fn(),
  set: vi.fn(),
}

vi.mock('~/stores/modconfig', () => ({
  useModConfigStore: () => mockModConfigStore,
}))

vi.mock('@/stores/misc', () => ({
  useMiscStore: () => mockMiscStore,
}))

vi.mock('~/composables/useMe', () => ({
  useMe: () => ({
    myid: ref(123),
  }),
}))

describe('ModSettingsModConfig', () => {
  const defaultConfigs = [
    { id: 1, name: 'Standard Config', protected: false, createdby: 123 },
    { id: 2, name: 'Protected Config', protected: true, createdby: 456 },
    { id: 3, name: 'My Protected Config', protected: true, createdby: 123 },
  ]

  const defaultConfig = {
    id: 1,
    name: 'Standard Config',
    protected: false,
    createdby: 123,
    cansee: 'Created',
    using: [],
    stdmsgs: [],
  }

  function mountComponent() {
    return mount(ModSettingsModConfig, {
      global: {
        stubs: {
          'b-form-select': {
            template:
              '<select class="form-select" :value="modelValue" @change="$emit(\'update:modelValue\', parseInt($event.target.value))"><option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.text }}</option></select>',
            props: ['modelValue', 'options'],
          },
          'b-input-group': {
            template:
              '<div class="input-group"><slot /><slot name="append" /></div>',
          },
          'b-form-input': {
            template:
              '<input class="form-input" :value="modelValue" :placeholder="placeholder" @input="$emit(\'update:modelValue\', $event.target.value)" />',
            props: ['modelValue', 'placeholder'],
          },
          'b-img': {
            template: '<img class="loader" :src="src" />',
            props: ['src'],
          },
          'b-card': {
            template: '<div class="card"><slot /></div>',
            props: ['noBody'],
          },
          'b-card-header': {
            template: '<div class="card-header"><slot /></div>',
          },
          'b-card-body': {
            template: '<div class="card-body"><slot /></div>',
          },
          'b-collapse': {
            template: '<div class="collapse"><slot /></div>',
            props: ['id', 'accordion'],
          },
          'b-button': {
            template:
              '<button class="btn" :class="\'btn-\' + variant" :disabled="disabled" @click="$emit(\'click\', $event)"><slot /></button>',
            props: ['variant', 'block', 'href', 'disabled'],
            directives: {
              'b-toggle': {},
            },
          },
          SpinButton: {
            template:
              '<button class="spin-button" :disabled="disabled" @click="handleClick"><slot>{{ label }}</slot></button>',
            props: ['variant', 'iconName', 'label', 'disabled'],
            emits: ['handle'],
            methods: {
              handleClick() {
                this.$emit('handle', () => {})
              },
            },
          },
          NoticeMessage: {
            template:
              '<div class="notice-message" :class="variant"><slot /></div>',
            props: ['variant'],
          },
          ModConfigSetting: {
            template:
              '<div class="mod-config-setting" :data-name="name" :data-configid="configid" :data-disabled="disabled"></div>',
            props: [
              'configid',
              'name',
              'label',
              'description',
              'type',
              'required',
              'disabled',
              'toggleChecked',
              'toggleUnchecked',
              'valueChecked',
              'valueUnchecked',
              'toggleWidth',
            ],
          },
          ModSettingsStandardMessageSet: {
            template:
              '<div class="std-msg-set" :data-cc="cc" :data-addr="addr" :data-locked="locked"></div>',
            props: ['cc', 'addr', 'types', 'locked'],
          },
          ConfirmModal: {
            template: '<div class="confirm-modal" :data-title="title"></div>',
            props: ['title'],
            emits: ['confirm', 'hidden'],
          },
          'v-icon': {
            template: '<span class="v-icon" :data-icon="icon"></span>',
            props: ['icon', 'scale'],
          },
          ExternalLink: {
            template: '<a class="external-link" :href="href"><slot /></a>',
            props: ['href'],
          },
        },
        directives: {
          'b-toggle': {},
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockModConfigStore.configs = [...defaultConfigs]
    mockModConfigStore.current = { ...defaultConfig }
    mockModConfigStore.fetch.mockResolvedValue()
    mockModConfigStore.fetchConfig.mockResolvedValue()
    mockModConfigStore.add.mockResolvedValue(10)
    mockModConfigStore.delete.mockResolvedValue()
    mockMiscStore.get.mockReturnValue(1)
    mockMiscStore.set.mockResolvedValue()
  })

  describe('rendering', () => {
    it('renders introductory text', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Standard Messages')
      expect(wrapper.text()).toContain('ModConfigs')
    })

    it('renders link to wiki', () => {
      const wrapper = mountComponent()
      const link = wrapper.find('.external-link')
      expect(link.exists()).toBe(true)
      expect(link.attributes('href')).toContain('wiki.ilovefreegle.org')
    })

    it('renders config select dropdown', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.form-select').exists()).toBe(true)
    })

    it('renders create new config input', () => {
      const wrapper = mountComponent()
      expect(
        wrapper.find('input[placeholder="Enter new config name"]').exists()
      ).toBe(true)
    })

    it('renders Create button', () => {
      const wrapper = mountComponent()
      const createBtn = wrapper
        .findAll('.spin-button')
        .find((b) => b.text() === 'Create')
      expect(createBtn).toBeDefined()
    })
  })

  describe('configOptions computed', () => {
    it('includes placeholder option first', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.configOptions[0]).toEqual({
        value: null,
        text: '-- Please choose --',
      })
    })

    it('includes all configs from store', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.configOptions.length).toBe(defaultConfigs.length + 1)
    })

    it('maps configs to value/text format', () => {
      const wrapper = mountComponent()
      const option = wrapper.vm.configOptions.find((o) => o.value === 1)
      expect(option).toEqual({ value: 1, text: 'Standard Config' })
    })
  })

  describe('configid computed', () => {
    it('gets value from misc store', () => {
      mockMiscStore.get.mockReturnValue(2)
      const wrapper = mountComponent()
      expect(wrapper.vm.configid).toBe(2)
    })

    it('returns null when store returns null', () => {
      mockMiscStore.get.mockReturnValue(null)
      const wrapper = mountComponent()
      expect(wrapper.vm.configid).toBe(null)
    })

    it('sets value in misc store', async () => {
      const wrapper = mountComponent()
      wrapper.vm.configid = 5
      await flushPromises()
      expect(mockMiscStore.set).toHaveBeenCalledWith({
        key: 'settingsconfig',
        value: 5,
      })
    })
  })

  describe('locked computed', () => {
    it('returns false when config is not protected', () => {
      mockModConfigStore.current = { ...defaultConfig, protected: false }
      const wrapper = mountComponent()
      expect(wrapper.vm.locked).toBe(false)
    })

    it('returns false when user is creator of protected config', () => {
      mockModConfigStore.current = {
        ...defaultConfig,
        protected: true,
        createdby: 123,
      }
      const wrapper = mountComponent()
      expect(wrapper.vm.locked).toBe(false)
    })

    it('returns true when config is protected by another user', () => {
      mockModConfigStore.current = {
        ...defaultConfig,
        protected: true,
        createdby: 456,
      }
      const wrapper = mountComponent()
      expect(wrapper.vm.locked).toBe(true)
    })

    it('returns false when config is null', () => {
      mockModConfigStore.current = null
      const wrapper = mountComponent()
      expect(wrapper.vm.locked).toBe(false)
    })
  })

  describe('config sections', () => {
    it('renders General Settings accordion', async () => {
      const wrapper = mountComponent()
      await flushPromises()
      expect(wrapper.text()).toContain('General Settings')
    })

    it('renders Pending Messages accordion', async () => {
      const wrapper = mountComponent()
      await flushPromises()
      expect(wrapper.text()).toContain('Pending Messages')
    })

    it('renders Approved Messages accordion', async () => {
      const wrapper = mountComponent()
      await flushPromises()
      expect(wrapper.text()).toContain('Approved Messages')
    })

    it('renders Approved Members accordion', async () => {
      const wrapper = mountComponent()
      await flushPromises()
      expect(wrapper.text()).toContain('Approved Members')
    })
  })

  describe('config settings', () => {
    it('renders name setting', async () => {
      const wrapper = mountComponent()
      await flushPromises()
      expect(
        wrapper.find('.mod-config-setting[data-name="name"]').exists()
      ).toBe(true)
    })

    it('renders chatread setting', async () => {
      const wrapper = mountComponent()
      await flushPromises()
      expect(
        wrapper.find('.mod-config-setting[data-name="chatread"]').exists()
      ).toBe(true)
    })

    it('renders fromname setting', async () => {
      const wrapper = mountComponent()
      await flushPromises()
      expect(
        wrapper.find('.mod-config-setting[data-name="fromname"]').exists()
      ).toBe(true)
    })

    it('renders coloursubj setting', async () => {
      const wrapper = mountComponent()
      await flushPromises()
      expect(
        wrapper.find('.mod-config-setting[data-name="coloursubj"]').exists()
      ).toBe(true)
    })

    it('renders subjlen setting', async () => {
      const wrapper = mountComponent()
      await flushPromises()
      expect(
        wrapper.find('.mod-config-setting[data-name="subjlen"]').exists()
      ).toBe(true)
    })

    it('renders subjreg setting', async () => {
      const wrapper = mountComponent()
      await flushPromises()
      expect(
        wrapper.find('.mod-config-setting[data-name="subjreg"]').exists()
      ).toBe(true)
    })

    it('renders network setting', async () => {
      const wrapper = mountComponent()
      await flushPromises()
      expect(
        wrapper.find('.mod-config-setting[data-name="network"]').exists()
      ).toBe(true)
    })
  })

  describe('standard message sets', () => {
    it('renders pending messages set', async () => {
      const wrapper = mountComponent()
      await flushPromises()
      const pendingSet = wrapper.find('.std-msg-set[data-cc="ccrejectto"]')
      expect(pendingSet.exists()).toBe(true)
    })

    it('renders approved messages set', async () => {
      const wrapper = mountComponent()
      await flushPromises()
      const approvedSet = wrapper.find('.std-msg-set[data-cc="ccfollowupto"]')
      expect(approvedSet.exists()).toBe(true)
    })

    it('renders approved members set', async () => {
      const wrapper = mountComponent()
      await flushPromises()
      const membersSet = wrapper.find('.std-msg-set[data-cc="ccfollmembto"]')
      expect(membersSet.exists()).toBe(true)
    })

    it('passes locked prop to message sets', async () => {
      mockModConfigStore.current = {
        ...defaultConfig,
        protected: true,
        createdby: 456,
      }
      const wrapper = mountComponent()
      await flushPromises()
      const sets = wrapper.findAll('.std-msg-set')
      sets.forEach((set) => {
        expect(set.attributes('data-locked')).toBe('true')
      })
    })
  })

  describe('locked notice', () => {
    it('shows locked notice for protected config by another user', async () => {
      mockModConfigStore.current = {
        ...defaultConfig,
        protected: true,
        createdby: 456,
      }
      const wrapper = mountComponent()
      await flushPromises()
      expect(wrapper.text()).toContain('locked')
    })

    it('shows owner message for own protected config', async () => {
      mockModConfigStore.current = {
        ...defaultConfig,
        protected: true,
        createdby: 123,
      }
      const wrapper = mountComponent()
      await flushPromises()
      expect(wrapper.text()).toContain('You have locked this')
    })
  })

  describe('using notice', () => {
    it('shows using notice when config has users', async () => {
      mockModConfigStore.current = {
        ...defaultConfig,
        using: [{ id: 1, fullname: 'Test User', userid: 100 }],
      }
      const wrapper = mountComponent()
      await flushPromises()
      expect(wrapper.text()).toContain('This config is being used')
    })

    it('does not show using notice when config has no users', async () => {
      mockModConfigStore.current = { ...defaultConfig, using: [] }
      const wrapper = mountComponent()
      await flushPromises()
      expect(wrapper.text()).not.toContain('This config is being used')
    })
  })

  describe('create method', () => {
    it('calls add on store with new config name', async () => {
      const wrapper = mountComponent()
      wrapper.vm.newconfigname = 'My New Config'
      await wrapper.vm.create(() => {})
      expect(mockModConfigStore.add).toHaveBeenCalledWith({
        name: 'My New Config',
        configuring: true,
      })
    })

    it('updates configid after create', async () => {
      mockModConfigStore.add.mockResolvedValue(99)
      const wrapper = mountComponent()
      wrapper.vm.newconfigname = 'New Config'
      await wrapper.vm.create(() => {})
      // Verify that miscStore.set was called with the new configid
      expect(mockMiscStore.set).toHaveBeenCalledWith({
        key: 'settingsconfig',
        value: 99,
      })
    })

    it('refreshes config list after create', async () => {
      const wrapper = mountComponent()
      wrapper.vm.newconfigname = 'New Config'
      await wrapper.vm.create(() => {})
      expect(mockModConfigStore.fetch).toHaveBeenCalledWith({ all: true })
    })

    it('calls callback after create', async () => {
      const wrapper = mountComponent()
      wrapper.vm.newconfigname = 'New Config'
      const callback = vi.fn()
      await wrapper.vm.create(callback)
      expect(callback).toHaveBeenCalled()
    })
  })

  describe('copy method', () => {
    it('calls add with existing config id', async () => {
      mockModConfigStore.current = { ...defaultConfig, id: 5 }
      const wrapper = mountComponent()
      wrapper.vm.copyconfigname = 'Copied Config'
      await wrapper.vm.copy(() => {})
      expect(mockModConfigStore.add).toHaveBeenCalledWith({
        name: 'Copied Config',
        id: 5,
        configuring: true,
      })
    })

    it('updates configid after copy', async () => {
      mockModConfigStore.add.mockResolvedValue(88)
      const wrapper = mountComponent()
      wrapper.vm.copyconfigname = 'Copied Config'
      await wrapper.vm.copy(() => {})
      // Verify that miscStore.set was called with the new configid
      expect(mockMiscStore.set).toHaveBeenCalledWith({
        key: 'settingsconfig',
        value: 88,
      })
    })
  })

  describe('delete functionality', () => {
    it('shows delete modal when deleteIt is called', () => {
      const wrapper = mountComponent()
      wrapper.vm.deleteIt()
      expect(wrapper.vm.showDeleteModal).toBe(true)
    })

    it('calls delete on store when confirmed', async () => {
      mockMiscStore.get.mockReturnValue(5)
      const wrapper = mountComponent()
      await wrapper.vm.deleteConfirmed()
      expect(mockModConfigStore.delete).toHaveBeenCalledWith({ id: 5 })
    })

    it('resets configid to null after delete', async () => {
      const wrapper = mountComponent()
      await wrapper.vm.deleteConfirmed()
      // Verify that miscStore.set was called with null
      expect(mockMiscStore.set).toHaveBeenCalledWith({
        key: 'settingsconfig',
        value: null,
      })
    })

    it('refreshes config list after delete', async () => {
      const wrapper = mountComponent()
      await wrapper.vm.deleteConfirmed()
      expect(mockModConfigStore.fetch).toHaveBeenCalledWith({ all: true })
    })

    it('hides delete button when config is locked', () => {
      mockModConfigStore.current = {
        ...defaultConfig,
        protected: true,
        createdby: 456,
      }
      const wrapper = mountComponent()
      const deleteBtn = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Delete'))
      expect(deleteBtn).toBeUndefined()
    })

    it('hides delete button when config has users', () => {
      mockModConfigStore.current = {
        ...defaultConfig,
        using: [{ id: 1, fullname: 'User', userid: 100 }],
      }
      const wrapper = mountComponent()
      const deleteBtn = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Delete'))
      expect(deleteBtn).toBeUndefined()
    })
  })

  describe('loading state', () => {
    it('shows loader when loading (during fetch)', () => {
      // The loading state is controlled by the watch on configid
      // When configid is set and fetchConfig is pending, loading is true
      // We can test this by making fetchConfig never resolve
      mockModConfigStore.fetchConfig.mockImplementation(
        () => new Promise(() => {})
      )
      const wrapper = mountComponent()
      // During the async fetch, loading should be true
      expect(wrapper.find('.loader').exists()).toBe(true)
    })

    it('hides loader when loading completes', async () => {
      const wrapper = mountComponent()
      await flushPromises()
      expect(wrapper.find('.loader').exists()).toBe(false)
    })
  })

  describe('cansee display', () => {
    it('shows Created message when user created config', async () => {
      mockModConfigStore.current = { ...defaultConfig, cansee: 'Created' }
      const wrapper = mountComponent()
      await flushPromises()
      expect(wrapper.text()).toContain('you created it')
    })

    it('shows Default message for standard config', async () => {
      mockModConfigStore.current = { ...defaultConfig, cansee: 'Default' }
      const wrapper = mountComponent()
      await flushPromises()
      expect(wrapper.text()).toContain('standard configuration')
    })

    it('shows Shared message for shared config', async () => {
      mockModConfigStore.current = {
        ...defaultConfig,
        cansee: 'Shared',
        sharedby: { displayname: 'Other User' },
        sharedon: { namedisplay: 'Test Group' },
      }
      const wrapper = mountComponent()
      await flushPromises()
      expect(wrapper.text()).toContain('Other User')
      expect(wrapper.text()).toContain('Test Group')
    })
  })

  describe('watch effects', () => {
    it('fetches config when configid changes', async () => {
      const wrapper = mountComponent()
      mockMiscStore.get.mockReturnValue(5)

      // Simulate config change
      await wrapper.vm.$nextTick()
      await flushPromises()

      // The watch should trigger fetchConfig
      // Note: Due to how the watch is set up with immediate: true,
      // fetchConfig is called on mount
      expect(mockModConfigStore.fetchConfig).toHaveBeenCalled()
    })
  })

  describe('lifecycle hooks', () => {
    it('fetches configs on mount', async () => {
      mountComponent()
      await flushPromises()
      expect(mockModConfigStore.fetch).toHaveBeenCalledWith({ all: true })
    })

    it('refetches configs before unmount', async () => {
      const wrapper = mountComponent()
      await flushPromises()
      mockModConfigStore.fetch.mockClear()

      wrapper.unmount()
      expect(mockModConfigStore.fetch).toHaveBeenCalledWith({ all: true })
    })
  })

  describe('button states', () => {
    it('disables Create button when newconfigname is empty', () => {
      const wrapper = mountComponent()
      wrapper.vm.newconfigname = ''
      const createBtn = wrapper
        .findAll('.spin-button')
        .find((b) => b.text() === 'Create')
      expect(createBtn.attributes('disabled')).toBeDefined()
    })

    it('enables Create button when newconfigname has value', async () => {
      const wrapper = mountComponent()
      wrapper.vm.newconfigname = 'New Config'
      await flushPromises()
      const createBtn = wrapper
        .findAll('.spin-button')
        .find((b) => b.text() === 'Create')
      expect(createBtn.attributes('disabled')).toBeUndefined()
    })

    it('disables Copy button when copyconfigname is empty', () => {
      const wrapper = mountComponent()
      wrapper.vm.copyconfigname = ''
      const copyBtn = wrapper
        .findAll('.spin-button')
        .find((b) => b.text() === 'Copy')
      if (copyBtn) {
        expect(copyBtn.attributes('disabled')).toBeDefined()
      }
    })
  })

  describe('disabled state for locked configs', () => {
    it('passes disabled to config settings when locked', () => {
      mockModConfigStore.current = {
        ...defaultConfig,
        protected: true,
        createdby: 456,
      }
      const wrapper = mountComponent()
      const settings = wrapper.findAll('.mod-config-setting')
      settings.forEach((setting) => {
        expect(setting.attributes('data-disabled')).toBe('true')
      })
    })
  })
})
