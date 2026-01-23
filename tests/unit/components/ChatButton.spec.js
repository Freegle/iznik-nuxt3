import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import ChatButton from '~/components/ChatButton.vue'

// Mock stores
const mockChatStore = {
  openChatToMods: vi.fn().mockResolvedValue(123),
  openChatToUser: vi.fn().mockResolvedValue(456),
  send: vi.fn().mockResolvedValue({}),
  fetchMessages: vi.fn().mockResolvedValue([]),
  showContactDetailsAskModal: false,
}
vi.mock('~/stores/chat', () => ({
  useChatStore: () => mockChatStore,
}))

const mockMessageStore = {
  fetch: vi.fn().mockResolvedValue({}),
}
vi.mock('~/stores/message', () => ({
  useMessageStore: () => mockMessageStore,
}))

const mockMiscStore = {
  modtools: false,
}
vi.mock('~/stores/misc', () => ({
  useMiscStore: () => mockMiscStore,
}))

// Mock router
const mockPush = vi.fn()
vi.mock('#imports', async () => {
  const actual = await vi.importActual('#imports')
  return {
    ...actual,
    useRouter: () => ({
      push: mockPush,
    }),
  }
})

// Mock useMe
const mockMe = ref({ settings: { mylocation: true } })
const mockMyid = ref(1)
vi.mock('~/composables/useMe', () => ({
  useMe: () => ({
    me: mockMe,
    myid: mockMyid,
  }),
}))

// Mock client log
vi.mock('~/composables/useClientLog', () => ({
  action: vi.fn(),
}))

describe('ChatButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockMyid.value = 1
    mockMiscStore.modtools = false
  })

  function createWrapper(props = {}) {
    return mount(ChatButton, {
      props: {
        userid: 2,
        ...props,
      },
      global: {
        stubs: {
          'b-button': {
            template:
              '<button :class="btnClass" @click="$emit(\'click\')"><slot /></button>',
            props: ['size', 'variant', 'btnClass'],
          },
          'v-icon': {
            template: '<i :class="icon" />',
            props: ['icon'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('mounts successfully', () => {
      const wrapper = createWrapper()
      expect(wrapper.exists()).toBe(true)
    })

    it('does not render when userid equals myid', () => {
      mockMyid.value = 2
      const wrapper = createWrapper({ userid: 2 })
      expect(wrapper.find('button').exists()).toBe(false)
    })

    it('renders when userid is different from myid', () => {
      const wrapper = createWrapper({ userid: 2 })
      expect(wrapper.find('button').exists()).toBe(true)
    })

    it('shows icon by default', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('i.comments').exists()).toBe(true)
    })

    it('hides icon when showIcon is false', () => {
      const wrapper = createWrapper({ showIcon: false })
      expect(wrapper.find('i.comments').exists()).toBe(false)
    })

    it('displays title when provided', () => {
      const wrapper = createWrapper({ title: 'Send Message' })
      expect(wrapper.text()).toContain('Send Message')
    })

    it('does not display title text when not provided', () => {
      const wrapper = createWrapper()
      // Only icon should be rendered, no text
      expect(wrapper.find('span').exists()).toBe(false)
    })
  })

  describe('props', () => {
    it('defaults size to null', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('size')).toBe(null)
    })

    it('defaults title to null', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('title')).toBe(null)
    })

    it('defaults variant to primary', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('variant')).toBe('primary')
    })

    it('defaults groupid to null', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('groupid')).toBe(null)
    })

    it('defaults chattype to null', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('chattype')).toBe(null)
    })

    it('defaults showIcon to true', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('showIcon')).toBe(true)
    })

    it('defaults btnClass to null', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('btnClass')).toBe(null)
    })

    it('defaults titleClass to ml-1', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('titleClass')).toBe('ml-1')
    })

    it('accepts custom variant', () => {
      const wrapper = createWrapper({ variant: 'success' })
      expect(wrapper.props('variant')).toBe('success')
    })

    it('accepts custom size', () => {
      const wrapper = createWrapper({ size: 'lg' })
      expect(wrapper.props('size')).toBe('lg')
    })
  })

  describe('exposed methods', () => {
    it('exposes openChat method', () => {
      const wrapper = createWrapper()
      expect(typeof wrapper.vm.openChat).toBe('function')
    })
  })

  describe('slot content', () => {
    it('uses slot content when provided', () => {
      const wrapper = mount(ChatButton, {
        props: { userid: 2 },
        slots: {
          default: '<span class="custom-slot">Custom Button</span>',
        },
        global: {
          stubs: {
            'b-button': {
              template: '<button><slot /></button>',
            },
            'v-icon': true,
          },
        },
      })
      expect(wrapper.find('.custom-slot').exists()).toBe(true)
      expect(wrapper.text()).toContain('Custom Button')
    })
  })

  describe('responsive design', () => {
    it('has button hidden on small screens (d-none d-sm-inline)', () => {
      const wrapper = createWrapper()
      const buttons = wrapper.findAll('button')
      // There should be two buttons - one for large screens, one for small
      expect(buttons.length).toBe(2)
    })
  })

  describe('emits', () => {
    it('emits click when button is clicked', async () => {
      const wrapper = createWrapper()
      const button = wrapper.find('button')
      await button.trigger('click')
      expect(wrapper.emitted('click')).toBeTruthy()
    })
  })
})
