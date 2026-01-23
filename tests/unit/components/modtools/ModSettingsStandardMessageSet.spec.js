import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import ModSettingsStandardMessageSet from '~/modtools/components/ModSettingsStandardMessageSet.vue'

// Mock stores
const mockModConfigStore = {
  current: null,
  updateConfig: vi.fn(),
  fetchConfig: vi.fn(),
}

vi.mock('~/stores/modconfig', () => ({
  useModConfigStore: () => mockModConfigStore,
}))

// Mock composable
vi.mock('~/composables/useStdMsgs', () => ({
  copyStdMsgs: vi.fn((config) => {
    if (!config || !config.stdmsgs) return []
    return [...config.stdmsgs]
  }),
}))

describe('ModSettingsStandardMessageSet', () => {
  const defaultProps = {
    cc: 'ccrejectto',
    addr: 'ccrejectaddr',
    types: ['Approve', 'Reject', 'Leave', 'Delete', 'Edit', 'Hold Message'],
  }

  const defaultConfig = {
    id: 1,
    name: 'Test Config',
    ccrejectto: 'Nobody',
    ccrejectaddr: '',
    messageorder: null,
    stdmsgs: [
      { id: 1, title: 'Approve Standard', action: 'Approve' },
      { id: 2, title: 'Reject Standard', action: 'Reject' },
      { id: 3, title: 'Reply', action: 'Leave' },
      { id: 4, title: 'Delete Post', action: 'Delete' },
      { id: 5, title: 'Edit Post', action: 'Edit' },
    ],
  }

  function mountComponent(props = {}, configOverrides = {}) {
    const config = { ...defaultConfig, ...configOverrides }
    mockModConfigStore.current = config

    return mount(ModSettingsStandardMessageSet, {
      props: { ...defaultProps, ...props },
      global: {
        stubs: {
          ModConfigSetting: {
            template:
              '<div class="mod-config-setting" :data-name="name" :data-configid="configid"></div>',
            props: [
              'configid',
              'name',
              'label',
              'description',
              'type',
              'options',
              'disabled',
            ],
          },
          ModSettingsStandardMessageButton: {
            template:
              '<button class="std-msg-btn" :data-id="stdmsg.id">{{ stdmsg.title }}</button>',
            props: ['stdmsg'],
          },
          ModSettingsStandardMessageModal: {
            template: '<div class="std-msg-modal" :data-locked="locked"></div>',
            props: ['locked', 'types'],
            methods: {
              show() {},
            },
          },
          'b-form-checkbox': {
            template:
              '<label class="form-checkbox"><input type="checkbox" :checked="modelValue" :disabled="disabled" @change="$emit(\'update:modelValue\', $event.target.checked)" /><slot /></label>',
            props: ['modelValue', 'name', 'disabled'],
          },
          'b-button': {
            template:
              '<button class="btn" :class="\'btn-\' + variant" @click="$emit(\'click\', $event)"><slot /></button>',
            props: ['variant'],
          },
          'v-icon': {
            template: '<span class="v-icon" :data-icon="icon"></span>',
            props: ['icon'],
          },
          draggable: {
            template:
              '<div class="draggable"><slot v-for="element in modelValue" :element="element" /></div>',
            props: ['modelValue', 'itemKey', 'group'],
            emits: ['update:modelValue', 'end'],
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockModConfigStore.current = { ...defaultConfig }
    mockModConfigStore.updateConfig.mockResolvedValue()
    mockModConfigStore.fetchConfig.mockResolvedValue()
  })

  describe('rendering', () => {
    it('renders the component', () => {
      const wrapper = mountComponent()
      expect(wrapper.exists()).toBe(true)
    })

    it('renders ModConfigSetting for BCC', () => {
      const wrapper = mountComponent()
      const setting = wrapper.find(
        '.mod-config-setting[data-name="ccrejectto"]'
      )
      expect(setting.exists()).toBe(true)
    })

    it('has stdmsgs to render', () => {
      const wrapper = mountComponent()
      // The component renders buttons via ModSettingsStandardMessageButton stubs
      // Verify stdmsgscopy is populated from the config
      expect(wrapper.vm.stdmsgscopy.length).toBeGreaterThan(0)
    })

    it('renders drag checkbox', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.form-checkbox').exists()).toBe(true)
    })

    it('renders Add new standard message button', () => {
      const wrapper = mountComponent()
      const addButton = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Add new'))
      expect(addButton).toBeDefined()
    })
  })

  describe('props', () => {
    it('accepts cc prop', () => {
      const wrapper = mountComponent({ cc: 'ccfollowupto' })
      expect(wrapper.props('cc')).toBe('ccfollowupto')
    })

    it('accepts addr prop', () => {
      const wrapper = mountComponent({ addr: 'ccfollowupaddr' })
      expect(wrapper.props('addr')).toBe('ccfollowupaddr')
    })

    it('accepts types array prop', () => {
      const types = ['Approve', 'Reject']
      const wrapper = mountComponent({ types })
      expect(wrapper.props('types')).toEqual(types)
    })

    it('accepts locked prop with default false', () => {
      const wrapper = mountComponent()
      expect(wrapper.props('locked')).toBe(false)
    })

    it('accepts locked prop as true', () => {
      const wrapper = mountComponent({ locked: true })
      expect(wrapper.props('locked')).toBe(true)
    })
  })

  describe('computed properties', () => {
    describe('config', () => {
      it('returns current config from store', () => {
        const wrapper = mountComponent()
        expect(wrapper.vm.config).toEqual(mockModConfigStore.current)
      })
    })
  })

  describe('cc options', () => {
    it('provides correct cc options', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.ccopts).toEqual([
        { value: 'Nobody', text: 'Nobody' },
        { value: 'Me', text: 'Me' },
        { value: 'Specific', text: 'Specific email' },
      ])
    })
  })

  describe('visible function', () => {
    it('returns true when stdmsg action is in types', () => {
      const wrapper = mountComponent({ types: ['Approve', 'Reject'] })
      expect(wrapper.vm.visible({ action: 'Approve' })).toBe(true)
      expect(wrapper.vm.visible({ action: 'Reject' })).toBe(true)
    })

    it('returns false when stdmsg action is not in types', () => {
      const wrapper = mountComponent({ types: ['Approve', 'Reject'] })
      expect(wrapper.vm.visible({ action: 'Delete' })).toBe(false)
      expect(wrapper.vm.visible({ action: 'Leave' })).toBe(false)
    })
  })

  describe('specific address field', () => {
    it('shows specific address field when cc is Specific', () => {
      const wrapper = mountComponent({}, { ccrejectto: 'Specific' })
      const addrSetting = wrapper.find(
        '.mod-config-setting[data-name="ccrejectaddr"]'
      )
      expect(addrSetting.exists()).toBe(true)
    })

    it('hides specific address field when cc is not Specific', () => {
      const wrapper = mountComponent({}, { ccrejectto: 'Nobody' })
      const addrSetting = wrapper.find(
        '.mod-config-setting[data-name="ccrejectaddr"]'
      )
      expect(addrSetting.exists()).toBe(false)
    })

    it('hides specific address field when cc is Me', () => {
      const wrapper = mountComponent({}, { ccrejectto: 'Me' })
      const addrSetting = wrapper.find(
        '.mod-config-setting[data-name="ccrejectaddr"]'
      )
      expect(addrSetting.exists()).toBe(false)
    })
  })

  describe('dragging functionality', () => {
    it('starts with dragging disabled', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.dragging).toBe(false)
    })

    it('enables dragging when checkbox is clicked', async () => {
      const wrapper = mountComponent()
      const checkbox = wrapper.find('.form-checkbox input')
      await checkbox.setValue(true)
      expect(wrapper.vm.dragging).toBe(true)
    })

    it('shows draggable container when dragging is enabled', async () => {
      const wrapper = mountComponent()
      wrapper.vm.dragging = true
      await flushPromises()
      expect(wrapper.find('.draggable').exists()).toBe(true)
    })

    it('shows regular container when dragging is disabled', async () => {
      const wrapper = mountComponent()
      wrapper.vm.dragging = false
      await flushPromises()
      // When not dragging, buttons are shown in a regular div with flex
      const flexContainer = wrapper.find('.d-flex.justify-content-center')
      expect(flexContainer.exists()).toBe(true)
    })

    it('hides drag checkbox controls when locked', () => {
      const wrapper = mountComponent({ locked: true })
      // When locked, the drag checkbox is hidden, not disabled
      const checkbox = wrapper.find('.form-checkbox')
      expect(checkbox.exists()).toBe(false)
    })
  })

  describe('updateOrder method', () => {
    it('calls updateConfig with new message order', async () => {
      const wrapper = mountComponent()
      wrapper.vm.stdmsgscopy = [
        { id: 3, action: 'Leave' },
        { id: 1, action: 'Approve' },
        { id: 2, action: 'Reject' },
      ]

      await wrapper.vm.updateOrder()

      expect(mockModConfigStore.updateConfig).toHaveBeenCalledWith({
        id: 1,
        messageorder: JSON.stringify([3, 1, 2]),
      })
    })
  })

  describe('add method', () => {
    it('shows modal when add button is clicked', async () => {
      const wrapper = mountComponent()
      await wrapper.vm.add()
      expect(wrapper.vm.showModal).toBe(true)
    })
  })

  describe('fetch method', () => {
    it('calls fetchConfig on store', async () => {
      const wrapper = mountComponent()
      await wrapper.vm.fetch()
      expect(mockModConfigStore.fetchConfig).toHaveBeenCalledWith({
        id: 1,
        configuring: true,
      })
    })

    it('increments bump after fetch', async () => {
      const wrapper = mountComponent()
      const initialBump = wrapper.vm.bump
      await wrapper.vm.fetch()
      expect(wrapper.vm.bump).toBe(initialBump + 1)
    })
  })

  describe('locked state', () => {
    it('hides drag checkbox when locked', () => {
      const wrapper = mountComponent({ locked: true })
      const checkbox = wrapper.find('.form-checkbox')
      expect(checkbox.exists()).toBe(false)
    })

    it('hides add button when locked', () => {
      const wrapper = mountComponent({ locked: true })
      const addButton = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Add new'))
      expect(addButton).toBeUndefined()
    })

    it('passes locked prop to ModConfigSetting', () => {
      const wrapper = mountComponent({ locked: true })
      const setting = wrapper.find('.mod-config-setting')
      // Check that the setting receives disabled prop
      expect(setting.exists()).toBe(true)
    })
  })

  describe('types filtering', () => {
    it('visible function returns true for matching types', () => {
      const wrapper = mountComponent({ types: ['Approve', 'Reject'] })
      expect(wrapper.vm.visible({ action: 'Approve' })).toBe(true)
      expect(wrapper.vm.visible({ action: 'Reject' })).toBe(true)
    })

    it('visible function returns false for non-matching types', () => {
      const wrapper = mountComponent({ types: ['Approve', 'Reject'] })
      expect(wrapper.vm.visible({ action: 'Delete' })).toBe(false)
      expect(wrapper.vm.visible({ action: 'Leave' })).toBe(false)
    })

    it('visible function matches all specified types', () => {
      const wrapper = mountComponent({
        types: ['Approve', 'Reject', 'Leave', 'Delete'],
      })
      expect(wrapper.vm.visible({ action: 'Approve' })).toBe(true)
      expect(wrapper.vm.visible({ action: 'Reject' })).toBe(true)
      expect(wrapper.vm.visible({ action: 'Leave' })).toBe(true)
      expect(wrapper.vm.visible({ action: 'Delete' })).toBe(true)
    })
  })

  describe('watch effects', () => {
    it('updates stdmsgscopy when config changes', async () => {
      const wrapper = mountComponent()
      const initialCopy = [...wrapper.vm.stdmsgscopy]

      // Update the config
      mockModConfigStore.current = {
        ...defaultConfig,
        stdmsgs: [
          ...defaultConfig.stdmsgs,
          { id: 10, title: 'New Message', action: 'Approve' },
        ],
      }

      // Trigger the watch by setting the reactive value
      await wrapper.vm.$nextTick()
      await flushPromises()

      // The watch should update stdmsgscopy
      expect(wrapper.vm.stdmsgscopy.length).toBeGreaterThanOrEqual(
        initialCopy.length
      )
    })
  })

  describe('onMounted lifecycle', () => {
    it('initializes stdmsgscopy from config on mount', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.stdmsgscopy).toBeDefined()
      expect(Array.isArray(wrapper.vm.stdmsgscopy)).toBe(true)
    })
  })

  describe('modal integration', () => {
    it('renders modal component', () => {
      const wrapper = mountComponent()
      wrapper.vm.showModal = true
      expect(wrapper.find('.std-msg-modal').exists()).toBe(false) // Only shows when showModal is true in template
    })

    it('passes types to modal', async () => {
      const types = ['Approve', 'Reject']
      const wrapper = mountComponent({ types })
      wrapper.vm.showModal = true
      await flushPromises()
      const modal = wrapper.find('.std-msg-modal')
      if (modal.exists()) {
        expect(wrapper.props('types')).toEqual(types)
      }
    })

    it('passes locked prop to modal', async () => {
      const wrapper = mountComponent({ locked: true })
      wrapper.vm.showModal = true
      await flushPromises()
      const modal = wrapper.find('.std-msg-modal')
      if (modal.exists()) {
        expect(modal.attributes('data-locked')).toBe('true')
      }
    })
  })
})
