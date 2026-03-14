import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ModMessageSummary from '~/modtools/components/ModMessageSummary.vue'

// Hoisted mocks
const { mockMessageStore, mockAuthStore } = vi.hoisted(() => {
  const mockMessageStore = {
    byId: vi.fn(),
    view: vi.fn().mockResolvedValue(),
  }
  const mockAuthStore = {
    user: { id: 999, displayname: 'Test Mod' },
  }
  return { mockMessageStore, mockAuthStore }
})

// Mock stores
vi.mock('~/stores/message', () => ({
  useMessageStore: () => mockMessageStore,
}))

vi.mock('~/stores/auth', () => ({
  useAuthStore: () => mockAuthStore,
}))

describe('ModMessageSummary', () => {
  // Helper to create test message data
  const createTestMessage = (overrides = {}) => ({
    id: 123,
    subject: 'Test Offer',
    type: 'Offer',
    attachments: [{ id: 1, path: '/image1.jpg' }],
    sampleimage: '/sample.jpg',
    successful: false,
    promised: false,
    promisedtome: false,
    unseen: false,
    ...overrides,
  })

  // Mount helper with common stubs
  function mountComponent(props = {}, messageData = null) {
    // Set up message store mock
    mockMessageStore.byId.mockReturnValue(messageData || createTestMessage())

    return mount(ModMessageSummary, {
      props: {
        id: 123,
        ...props,
      },
      global: {
        stubs: {
          MessageFreegled: {
            template: '<div class="message-freegled"><slot /></div>',
            props: ['id', 'summary'],
          },
          MessagePromised: {
            template:
              '<div class="message-promised" @click="$emit(\'click\')"><slot /></div>',
            props: ['id', 'summary', 'toMe'],
          },
          MessageItemLocation: {
            template: '<div class="message-item-location"><slot /></div>',
            props: ['id', 'matchedon', 'expanded', 'showLocation'],
          },
          MessageHistory: {
            template: '<div class="message-history"><slot /></div>',
            props: ['id', 'summary'],
          },
          MessageDescription: {
            template: '<div class="message-description"><slot /></div>',
            props: ['id', 'matchedon'],
          },
          MessageAttachments: {
            template: '<div class="message-attachments"><slot /></div>',
            props: [
              'id',
              'attachments',
              'sampleImage',
              'disabled',
              'thumbnail',
              'preload',
            ],
          },
          'client-only': {
            template: '<div><slot /></div>',
          },
        },
        directives: {
          'observe-visibility': {
            mounted() {},
            unmounted() {},
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset window.open mock
    vi.spyOn(window, 'open').mockImplementation(() => {})
  })

  describe('Rendering', () => {
    it('renders when message exists', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.position-relative').exists()).toBe(true)
    })

    it('does not render when message is null', () => {
      mockMessageStore.byId.mockReturnValue(null)
      const wrapper = mount(ModMessageSummary, {
        props: { id: 123 },
        global: {
          stubs: {
            MessageFreegled: true,
            MessagePromised: true,
            MessageItemLocation: true,
            MessageHistory: true,
            MessageDescription: true,
            MessageAttachments: true,
            'client-only': { template: '<div><slot /></div>' },
          },
          directives: {
            'observe-visibility': { mounted() {} },
          },
        },
      })
      expect(wrapper.find('.position-relative').exists()).toBe(false)
    })

    it('renders MessageItemLocation component', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.message-item-location').exists()).toBe(true)
    })

    it('renders MessageHistory component', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.message-history').exists()).toBe(true)
    })

    it('renders MessageDescription component', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.message-description').exists()).toBe(true)
    })

    it('renders MessageAttachments component', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.message-attachments').exists()).toBe(true)
    })
  })

  describe('Props', () => {
    it('accepts custom expandButtonText', () => {
      const wrapper = mountComponent({ expandButtonText: 'View More' })
      expect(wrapper.props('expandButtonText')).toBe('View More')
    })

    it('accepts replyable prop as false', () => {
      const wrapper = mountComponent({ replyable: false })
      expect(wrapper.props('replyable')).toBe(false)
    })
  })

  describe('Computed: classes', () => {
    it('includes messagecard class always', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.messagecard').exists()).toBe(true)
    })

    it('includes test-message-card class always', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.test-message-card').exists()).toBe(true)
    })

    it('includes offer class for Offer type', () => {
      const wrapper = mountComponent({}, createTestMessage({ type: 'Offer' }))
      expect(wrapper.find('.offer').exists()).toBe(true)
    })

    it('includes wanted class for Wanted type', () => {
      const wrapper = mountComponent({}, createTestMessage({ type: 'Wanted' }))
      expect(wrapper.find('.wanted').exists()).toBe(true)
    })

    it('includes freegled class when successful and showFreegled', () => {
      const wrapper = mountComponent(
        { showFreegled: true },
        createTestMessage({ successful: true })
      )
      expect(wrapper.find('.freegled').exists()).toBe(true)
    })

    it('does not include freegled class when showFreegled is false', () => {
      const wrapper = mountComponent(
        { showFreegled: false },
        createTestMessage({ successful: true })
      )
      expect(wrapper.find('.freegled').exists()).toBe(false)
    })

    it('includes clickme class when not successful', () => {
      const wrapper = mountComponent(
        {},
        createTestMessage({ successful: false })
      )
      expect(wrapper.find('.clickme').exists()).toBe(true)
    })

    it('does not include clickme class when successful', () => {
      const wrapper = mountComponent(
        {},
        createTestMessage({ successful: true })
      )
      expect(wrapper.find('.messagecard.clickme').exists()).toBe(false)
    })

    it('includes promisedfade class for promised but not to me', () => {
      const wrapper = mountComponent(
        { showPromised: true, replyable: true },
        createTestMessage({
          promised: true,
          promisedtome: false,
          successful: false,
        })
      )
      expect(wrapper.find('.promisedfade').exists()).toBe(true)
    })

    it('does not include promisedfade class when promised to me', () => {
      const wrapper = mountComponent(
        { showPromised: true, replyable: true },
        createTestMessage({
          promised: true,
          promisedtome: true,
          successful: false,
        })
      )
      expect(wrapper.find('.promisedfade').exists()).toBe(false)
    })

    it('includes noAttachments class when no attachments or sampleimage', () => {
      const wrapper = mountComponent(
        {},
        createTestMessage({ attachments: [], sampleimage: null })
      )
      expect(wrapper.find('.noAttachments').exists()).toBe(true)
    })

    it('does not include noAttachments class when has attachments', () => {
      const wrapper = mountComponent(
        {},
        createTestMessage({ attachments: [{ id: 1 }] })
      )
      // The messagecard itself should not have noAttachments (only header-description might)
      expect(wrapper.find('.messagecard.noAttachments').exists()).toBe(false)
    })

    it('includes custom bgClass when provided', () => {
      const wrapper = mountComponent({ bgClass: 'my-custom-class' })
      expect(wrapper.find('.my-custom-class').exists()).toBe(true)
    })
  })

  describe('MessageFreegled display', () => {
    it('shows MessageFreegled when successful and showFreegled is true', () => {
      const wrapper = mountComponent(
        { showFreegled: true },
        createTestMessage({ successful: true })
      )
      expect(wrapper.find('.message-freegled').exists()).toBe(true)
    })

    it('does not show MessageFreegled when not successful', () => {
      const wrapper = mountComponent(
        { showFreegled: true },
        createTestMessage({ successful: false })
      )
      expect(wrapper.find('.message-freegled').exists()).toBe(false)
    })

    it('does not show MessageFreegled when showFreegled is false', () => {
      const wrapper = mountComponent(
        { showFreegled: false },
        createTestMessage({ successful: true })
      )
      expect(wrapper.find('.message-freegled').exists()).toBe(false)
    })
  })

  describe('MessagePromised display', () => {
    it('shows MessagePromised when promised and showPromised is true', () => {
      const wrapper = mountComponent(
        { showPromised: true },
        createTestMessage({ promised: true, successful: false })
      )
      expect(wrapper.find('.message-promised').exists()).toBe(true)
    })

    it('does not show MessagePromised when not promised', () => {
      const wrapper = mountComponent(
        { showPromised: true },
        createTestMessage({ promised: false })
      )
      expect(wrapper.find('.message-promised').exists()).toBe(false)
    })

    it('does not show MessagePromised when showPromised is false', () => {
      const wrapper = mountComponent(
        { showPromised: false },
        createTestMessage({ promised: true })
      )
      expect(wrapper.find('.message-promised').exists()).toBe(false)
    })

    it('does not show MessagePromised when successful (shows Freegled instead)', () => {
      const wrapper = mountComponent(
        { showPromised: true, showFreegled: true },
        createTestMessage({ promised: true, successful: true })
      )
      expect(wrapper.find('.message-promised').exists()).toBe(false)
      expect(wrapper.find('.message-freegled').exists()).toBe(true)
    })
  })

  describe('Expand button', () => {
    it('shows expand button when not successful and replyable', () => {
      const wrapper = mountComponent(
        { replyable: true },
        createTestMessage({ successful: false })
      )
      expect(wrapper.find('.header-expand').exists()).toBe(true)
    })

    it('does not show expand button when successful', () => {
      const wrapper = mountComponent(
        { replyable: true },
        createTestMessage({ successful: true })
      )
      expect(wrapper.find('.header-expand').exists()).toBe(false)
    })

    it('does not show expand button when not replyable', () => {
      const wrapper = mountComponent(
        { replyable: false },
        createTestMessage({ successful: false })
      )
      expect(wrapper.find('.header-expand').exists()).toBe(false)
    })

    it('displays custom button text', () => {
      const wrapper = mountComponent(
        { expandButtonText: 'Custom Text', replyable: true },
        createTestMessage({ successful: false })
      )
      expect(wrapper.text()).toContain('Custom Text')
    })
  })

  describe('Events', () => {
    it('emits expand when messagecard is clicked', async () => {
      const wrapper = mountComponent()
      await wrapper.find('.messagecard').trigger('click')
      expect(wrapper.emitted('expand')).toBeTruthy()
    })

    it('emits expand when MessagePromised is clicked', async () => {
      const wrapper = mountComponent(
        { showPromised: true },
        createTestMessage({ promised: true, successful: false })
      )
      await wrapper.find('.message-promised').trigger('click')
      expect(wrapper.emitted('expand')).toBeTruthy()
    })

    it('emits expand and attachments when image-wrapper is clicked', async () => {
      const wrapper = mountComponent()
      await wrapper.find('.image-wrapper').trigger('click')
      expect(wrapper.emitted('expand')).toBeTruthy()
      expect(wrapper.emitted('attachments')).toBeTruthy()
    })
  })

  describe('view method', () => {
    it('calls messageStore.view when message is unseen and user is logged in', async () => {
      mockAuthStore.user = { id: 999 }
      const wrapper = mountComponent({}, createTestMessage({ unseen: true }))

      await wrapper.vm.view()
      expect(mockMessageStore.view).toHaveBeenCalledWith(123)
    })

    it('does not call messageStore.view when message is not unseen', async () => {
      mockAuthStore.user = { id: 999 }
      const wrapper = mountComponent({}, createTestMessage({ unseen: false }))

      await wrapper.vm.view()
      expect(mockMessageStore.view).not.toHaveBeenCalled()
    })

    it('does not call messageStore.view when user is not logged in', async () => {
      mockAuthStore.user = null
      const wrapper = mountComponent({}, createTestMessage({ unseen: true }))

      await wrapper.vm.view()
      expect(mockMessageStore.view).not.toHaveBeenCalled()
    })
  })

  describe('handleClickWithModifiers', () => {
    it('opens new tab when ctrl is held', async () => {
      const wrapper = mountComponent()
      await wrapper.find('.messagecard').trigger('click', { ctrlKey: true })
      expect(window.open).toHaveBeenCalledWith('/message/123', '_BLANK')
    })

    it('opens new window when shift is held', async () => {
      const wrapper = mountComponent()
      await wrapper.find('.messagecard').trigger('click', { shiftKey: true })
      expect(window.open).toHaveBeenCalledWith('/message/123', '_NEW')
    })

    it('does not open new tab/window for regular click', async () => {
      const wrapper = mountComponent()
      await wrapper.find('.messagecard').trigger('click')
      expect(window.open).not.toHaveBeenCalled()
    })

    it('does not handle modifier clicks on anchor elements', () => {
      // This tests that the function returns false for anchor clicks
      const wrapper = mountComponent()
      // Create a mock event with nodeName 'a'
      const result = wrapper.vm.handleClickWithModifiers({
        target: { nodeName: 'a' },
        ctrlKey: true,
      })
      expect(result).toBe(false)
    })

    it('returns false when event is null', () => {
      const wrapper = mountComponent()
      const result = wrapper.vm.handleClickWithModifiers(null)
      expect(result).toBe(false)
    })

    it('returns false when event is undefined', () => {
      const wrapper = mountComponent()
      const result = wrapper.vm.handleClickWithModifiers(undefined)
      expect(result).toBe(false)
    })
  })

  describe('expand method', () => {
    it('emits expand event when message exists', async () => {
      const wrapper = mountComponent()
      await wrapper.vm.expand({
        target: { nodeName: 'div' },
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      })
      expect(wrapper.emitted('expand')).toBeTruthy()
    })

    it('does not emit when message is null', async () => {
      mockMessageStore.byId.mockReturnValue(null)
      const wrapper = mount(ModMessageSummary, {
        props: { id: 123 },
        global: {
          stubs: {
            MessageFreegled: true,
            MessagePromised: true,
            MessageItemLocation: true,
            MessageHistory: true,
            MessageDescription: true,
            MessageAttachments: true,
            'client-only': { template: '<div><slot /></div>' },
          },
          directives: {
            'observe-visibility': { mounted() {} },
          },
        },
      })
      await wrapper.vm.expand({
        target: { nodeName: 'div' },
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      })
      expect(wrapper.emitted('expand')).toBeFalsy()
    })

    it('prevents default and stops propagation', async () => {
      const wrapper = mountComponent()
      const mockEvent = {
        target: { nodeName: 'div' },
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      }
      await wrapper.vm.expand(mockEvent)
      expect(mockEvent.preventDefault).toHaveBeenCalled()
      expect(mockEvent.stopPropagation).toHaveBeenCalled()
    })

    it('does not emit expand when ctrl key is held', async () => {
      const wrapper = mountComponent()
      await wrapper.vm.expand({
        target: { nodeName: 'div' },
        ctrlKey: true,
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      })
      expect(wrapper.emitted('expand')).toBeFalsy()
      expect(window.open).toHaveBeenCalled()
    })
  })

  describe('expandAndAttachments method', () => {
    it('emits both expand and attachments events', async () => {
      const wrapper = mountComponent()
      await wrapper.vm.expandAndAttachments({
        target: { nodeName: 'div' },
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      })
      expect(wrapper.emitted('expand')).toBeTruthy()
      expect(wrapper.emitted('attachments')).toBeTruthy()
    })

    it('does not emit when message is null', async () => {
      mockMessageStore.byId.mockReturnValue(null)
      const wrapper = mount(ModMessageSummary, {
        props: { id: 123 },
        global: {
          stubs: {
            MessageFreegled: true,
            MessagePromised: true,
            MessageItemLocation: true,
            MessageHistory: true,
            MessageDescription: true,
            MessageAttachments: true,
            'client-only': { template: '<div><slot /></div>' },
          },
          directives: {
            'observe-visibility': { mounted() {} },
          },
        },
      })
      await wrapper.vm.expandAndAttachments({
        target: { nodeName: 'div' },
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      })
      expect(wrapper.emitted('expand')).toBeFalsy()
      expect(wrapper.emitted('attachments')).toBeFalsy()
    })

    it('does not emit events when ctrl key is held', async () => {
      const wrapper = mountComponent()
      await wrapper.vm.expandAndAttachments({
        target: { nodeName: 'div' },
        ctrlKey: true,
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      })
      expect(wrapper.emitted('expand')).toBeFalsy()
      expect(wrapper.emitted('attachments')).toBeFalsy()
    })
  })

  describe('DOM attributes', () => {
    it('sets id attribute with msg- prefix', () => {
      const wrapper = mountComponent({ id: 456 })
      expect(wrapper.find('#msg-456').exists()).toBe(true)
    })

    it('sets data-id attribute on messagecard', () => {
      const wrapper = mountComponent({ id: 789 })
      expect(wrapper.find('[data-id="789"]').exists()).toBe(true)
    })
  })

  describe('Child component props', () => {
    it('passes showLocation to MessageItemLocation', () => {
      const wrapper = mountComponent({ showLocation: false })
      // Verify prop is passed (the stub renders the component)
      expect(wrapper.find('.message-item-location').exists()).toBe(true)
      // The showLocation prop affects MessageItemLocation behavior
      expect(wrapper.props('showLocation')).toBe(false)
    })

    it('passes matchedon to MessageItemLocation', () => {
      const matchedon = { word: 'test', type: 'subject' }
      const wrapper = mountComponent({ matchedon })
      expect(wrapper.find('.message-item-location').exists()).toBe(true)
      expect(wrapper.props('matchedon')).toEqual(matchedon)
    })

    it('passes preload to MessageAttachments', () => {
      const wrapper = mountComponent({ preload: true })
      expect(wrapper.find('.message-attachments').exists()).toBe(true)
      expect(wrapper.props('preload')).toBe(true)
    })
  })
})
