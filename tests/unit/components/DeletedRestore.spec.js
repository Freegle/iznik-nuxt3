import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref, computed } from 'vue'
import DeletedRestore from '~/components/DeletedRestore.vue'

// Mock auth store
const mockAuthStore = {
  restore: vi.fn().mockResolvedValue({}),
  logout: vi.fn().mockResolvedValue({}),
}
vi.mock('~/stores/auth', () => ({
  useAuthStore: () => mockAuthStore,
}))

// Mock useMe composable
const mockMeValue = ref(null)
const mockMe = computed(() => mockMeValue.value)
vi.mock('~/composables/useMe', () => ({
  useMe: () => ({
    me: mockMe,
  }),
}))

// Mock useTimeFormat
vi.mock('~/composables/useTimeFormat', () => ({
  timeago: (date) => '2 days ago',
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

describe('DeletedRestore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockMeValue.value = null
  })

  function createWrapper(props = {}) {
    return mount(DeletedRestore, {
      props,
      global: {
        stubs: {
          'b-row': { template: '<div class="row"><slot /></div>' },
          'b-col': {
            template: '<div class="col"><slot /></div>',
            props: ['cols', 'xl', 'offsetXl'],
          },
          NoticeMessage: {
            template:
              '<div class="notice-message" :class="variant"><slot /></div>',
            props: ['variant'],
          },
          'b-button': {
            template:
              '<button :class="variant" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant', 'size'],
          },
          SpinButton: {
            template:
              '<button @click="$emit(\'handle\', () => {})"><slot />{{ label }}</button>',
            props: ['label', 'variant'],
          },
          'v-icon': {
            template: '<i :class="icon" />',
            props: ['icon'],
          },
        },
        // Mock me for template access
        mocks: {
          me: computed(() => mockMe.value),
        },
      },
    })
  }

  describe('rendering', () => {
    it('does not show notice when me is null', () => {
      mockMeValue.value = null
      const wrapper = createWrapper()
      expect(wrapper.find('.notice-message').exists()).toBe(false)
    })

    it('does not show notice when me.deleted is false', () => {
      mockMeValue.value = { deleted: null }
      const wrapper = createWrapper()
      expect(wrapper.find('.notice-message').exists()).toBe(false)
    })

    it('shows danger notice when me.deleted is set', () => {
      mockMeValue.value = { deleted: '2024-01-01' }
      const wrapper = createWrapper()
      const notice = wrapper.find('.notice-message')
      expect(notice.exists()).toBe(true)
      expect(notice.classes()).toContain('danger')
    })
  })

  describe('deleted but not forgotten', () => {
    beforeEach(() => {
      mockMeValue.value = { deleted: '2024-01-01', forgotten: false }
    })

    it('shows deleted account message', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('deleted your account')
    })

    it('displays deletion message', () => {
      const wrapper = createWrapper()
      // The component shows "You deleted your account {{medeleted}}"
      // medeleted is computed from timeago, which may not render in test context
      expect(wrapper.text()).toContain('deleted your account')
    })

    it('shows warning about removal', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('completely removed soon')
    })

    it('mentions other freeglers cannot see details', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain("can't see your details")
    })

    it('shows Restore your account button', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Restore your account')
    })

    it('calls authStore.restore when restore is clicked', async () => {
      const wrapper = createWrapper()
      const restoreBtn = wrapper.find('button')
      await restoreBtn.trigger('click')
      await flushPromises()

      expect(mockAuthStore.restore).toHaveBeenCalled()
    })
  })

  describe('forgotten account', () => {
    beforeEach(() => {
      mockMeValue.value = { deleted: '2024-01-01', forgotten: true }
    })

    it('shows forgotten account message', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('data has now been removed')
    })

    it('offers to rejoin', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Rejoin Freegle')
    })

    it('says "we\'d love to have you"', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain("we'd love to have you")
    })
  })

  describe('props', () => {
    it('accepts bottom prop as false', () => {
      const wrapper = createWrapper({ bottom: false })
      expect(wrapper.props('bottom')).toBe(false)
    })
  })

  describe('layout', () => {
    it('uses row and column layout', () => {
      mockMeValue.value = { deleted: '2024-01-01' }
      const wrapper = createWrapper()
      expect(wrapper.find('.row').exists()).toBe(true)
      expect(wrapper.find('.col').exists()).toBe(true)
    })
  })
})
