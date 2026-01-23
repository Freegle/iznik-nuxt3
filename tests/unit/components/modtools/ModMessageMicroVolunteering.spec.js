import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import ModMessageMicroVolunteering from '~/modtools/components/ModMessageMicroVolunteering.vue'

// Mock user store
const mockUserStore = {
  byId: vi.fn(),
  fetch: vi.fn(),
}

vi.mock('~/stores/user', () => ({
  useUserStore: () => mockUserStore,
}))

describe('ModMessageMicroVolunteering', () => {
  const createTestMessage = (overrides = {}) => ({
    id: 123,
    subject: 'Free sofa',
    ...overrides,
  })

  const createTestMicrovolunteering = (overrides = {}) => ({
    userid: 456,
    result: 'Reject',
    msgcategory: 'CouldBeBetter',
    comments: 'This post needs work',
    ...overrides,
  })

  function mountComponent(props = {}) {
    return mount(ModMessageMicroVolunteering, {
      props: {
        message: createTestMessage(),
        microvolunteering: createTestMicrovolunteering(),
        ...props,
      },
      global: {
        stubs: {
          'v-icon': {
            template: '<i :class="icon" />',
            props: ['icon', 'scale'],
          },
          'nuxt-link': {
            template: '<a :href="to"><slot /></a>',
            props: ['to'],
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockUserStore.byId.mockReturnValue({
      displayname: 'Test User',
      emails: [
        { email: 'test@example.com', ourdomain: false, preferred: true },
      ],
    })
    mockUserStore.fetch.mockResolvedValue({})
  })

  describe('rendering - Reject result', () => {
    it('renders the component with reject result', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('div').exists()).toBe(true)
    })

    it('displays warning border for reject', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.border-warning').exists()).toBe(true)
    })

    it('displays user id with hashtag and link', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('456')
      const link = wrapper.find('a')
      expect(link.attributes('href')).toBe('/members/approved/0/456')
    })

    it('displays user displayname when available', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Test User')
    })

    it('displays user email when available', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('test@example.com')
    })

    it('displays "thinks this post" text', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('thinks this post')
    })

    it('displays comments in quotes', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('"This post needs work"')
    })

    it('displays "No comment supplied" when no comments', () => {
      const wrapper = mountComponent({
        microvolunteering: createTestMicrovolunteering({ comments: null }),
      })
      expect(wrapper.text()).toContain('No comment supplied')
    })
  })

  describe('rendering - Approve result', () => {
    it('displays success border for approve', () => {
      const wrapper = mountComponent({
        microvolunteering: createTestMicrovolunteering({ result: 'Approve' }),
      })
      expect(wrapper.find('.border-success').exists()).toBe(true)
    })

    it('displays "thinks this post is ok" for approve', () => {
      const wrapper = mountComponent({
        microvolunteering: createTestMicrovolunteering({ result: 'Approve' }),
      })
      expect(wrapper.text()).toContain('thinks this post is ok')
    })

    it('displays user info for approve result', () => {
      const wrapper = mountComponent({
        microvolunteering: createTestMicrovolunteering({ result: 'Approve' }),
      })
      expect(wrapper.text()).toContain('Test User')
    })
  })

  describe('msgcategory display', () => {
    it('displays "Could be better" for CouldBeBetter category', () => {
      const wrapper = mountComponent({
        microvolunteering: createTestMicrovolunteering({
          msgcategory: 'CouldBeBetter',
        }),
      })
      expect(wrapper.text()).toContain('Could be better')
    })

    it('displays "shouldn\'t be here" for ShouldntBeHere category', () => {
      const wrapper = mountComponent({
        microvolunteering: createTestMicrovolunteering({
          msgcategory: 'ShouldntBeHere',
        }),
      })
      expect(wrapper.text()).toContain("shouldn't be here")
    })

    it('has text-warning for CouldBeBetter', () => {
      const wrapper = mountComponent({
        microvolunteering: createTestMicrovolunteering({
          msgcategory: 'CouldBeBetter',
        }),
      })
      expect(wrapper.find('strong.text-warning').exists()).toBe(true)
    })

    it('has text-danger for ShouldntBeHere', () => {
      const wrapper = mountComponent({
        microvolunteering: createTestMicrovolunteering({
          msgcategory: 'ShouldntBeHere',
        }),
      })
      expect(wrapper.find('strong.text-danger').exists()).toBe(true)
    })
  })

  describe('computed properties', () => {
    describe('user', () => {
      it('returns user from store based on microvolunteering userid', () => {
        mockUserStore.byId.mockReturnValue({
          id: 456,
          displayname: 'Store User',
        })
        const wrapper = mountComponent()
        expect(wrapper.vm.user).toEqual({ id: 456, displayname: 'Store User' })
        expect(mockUserStore.byId).toHaveBeenCalledWith(456)
      })

      it('returns undefined when user not in store', () => {
        mockUserStore.byId.mockReturnValue(undefined)
        const wrapper = mountComponent()
        expect(wrapper.vm.user).toBeUndefined()
      })
    })

    describe('email', () => {
      it('returns preferred non-ourdomain email', () => {
        mockUserStore.byId.mockReturnValue({
          displayname: 'Test',
          emails: [
            { email: 'our@ilovefreegle.org', ourdomain: true, preferred: true },
            { email: 'user@gmail.com', ourdomain: false, preferred: true },
          ],
        })
        const wrapper = mountComponent()
        expect(wrapper.vm.email).toBe('user@gmail.com')
      })

      it('returns first non-ourdomain email when none preferred', () => {
        mockUserStore.byId.mockReturnValue({
          displayname: 'Test',
          emails: [
            {
              email: 'our@ilovefreegle.org',
              ourdomain: true,
              preferred: false,
            },
            { email: 'user@gmail.com', ourdomain: false, preferred: false },
          ],
        })
        const wrapper = mountComponent()
        expect(wrapper.vm.email).toBe('user@gmail.com')
      })

      it('prefers preferred email over non-preferred', () => {
        mockUserStore.byId.mockReturnValue({
          displayname: 'Test',
          emails: [
            { email: 'first@gmail.com', ourdomain: false, preferred: false },
            { email: 'preferred@gmail.com', ourdomain: false, preferred: true },
          ],
        })
        const wrapper = mountComponent()
        expect(wrapper.vm.email).toBe('preferred@gmail.com')
      })

      it('returns null when user has no emails', () => {
        mockUserStore.byId.mockReturnValue({
          displayname: 'Test',
          emails: [],
        })
        const wrapper = mountComponent()
        expect(wrapper.vm.email).toBeNull()
      })

      it('returns null when user is null', () => {
        mockUserStore.byId.mockReturnValue(null)
        const wrapper = mountComponent()
        expect(wrapper.vm.email).toBeNull()
      })

      it('returns null when emails is undefined', () => {
        mockUserStore.byId.mockReturnValue({ displayname: 'Test' })
        const wrapper = mountComponent()
        expect(wrapper.vm.email).toBeNull()
      })

      it('skips ourdomain emails', () => {
        mockUserStore.byId.mockReturnValue({
          displayname: 'Test',
          emails: [
            {
              email: 'our1@ilovefreegle.org',
              ourdomain: true,
              preferred: true,
            },
            {
              email: 'our2@ilovefreegle.org',
              ourdomain: true,
              preferred: false,
            },
          ],
        })
        const wrapper = mountComponent()
        expect(wrapper.vm.email).toBeNull()
      })
    })
  })

  describe('onMounted', () => {
    it('fetches user data on mount', async () => {
      mountComponent({
        microvolunteering: createTestMicrovolunteering({ userid: 789 }),
      })
      await flushPromises()
      expect(mockUserStore.fetch).toHaveBeenCalledWith(789)
    })
  })

  describe('props', () => {
    it('accepts message prop', () => {
      const message = createTestMessage({ id: 888 })
      const wrapper = mountComponent({ message })
      expect(wrapper.props('message')).toEqual(message)
    })

    it('accepts microvolunteering prop', () => {
      const mv = createTestMicrovolunteering({ userid: 111 })
      const wrapper = mountComponent({ microvolunteering: mv })
      expect(wrapper.props('microvolunteering')).toEqual(mv)
    })
  })

  describe('conditional rendering', () => {
    it('shows reject section only when result is Reject', () => {
      const wrapper = mountComponent({
        microvolunteering: createTestMicrovolunteering({ result: 'Reject' }),
      })
      expect(wrapper.find('.border-warning').exists()).toBe(true)
      expect(wrapper.find('.border-success').exists()).toBe(false)
    })

    it('shows approve section only when result is Approve', () => {
      const wrapper = mountComponent({
        microvolunteering: createTestMicrovolunteering({ result: 'Approve' }),
      })
      expect(wrapper.find('.border-success').exists()).toBe(true)
      expect(wrapper.find('.border-warning').exists()).toBe(false)
    })

    it('shows nothing when result is neither Reject nor Approve', () => {
      const wrapper = mountComponent({
        microvolunteering: createTestMicrovolunteering({ result: 'Other' }),
      })
      expect(wrapper.find('.border-warning').exists()).toBe(false)
      expect(wrapper.find('.border-success').exists()).toBe(false)
    })

    it('shows user info only when user exists', () => {
      mockUserStore.byId.mockReturnValue(null)
      const wrapper = mountComponent()
      expect(wrapper.text()).not.toContain('Test User')
    })

    it('shows email only when email exists', () => {
      mockUserStore.byId.mockReturnValue({
        displayname: 'Test',
        emails: [],
      })
      const wrapper = mountComponent()
      expect(wrapper.text()).not.toContain('@example.com')
    })
  })

  describe('edge cases', () => {
    it('handles empty comments string', () => {
      const wrapper = mountComponent({
        microvolunteering: createTestMicrovolunteering({ comments: '' }),
      })
      expect(wrapper.text()).toContain('No comment supplied')
    })

    it('handles whitespace only comments', () => {
      const wrapper = mountComponent({
        microvolunteering: createTestMicrovolunteering({ comments: '   ' }),
      })
      // Whitespace is truthy in v-if
      expect(wrapper.text()).toContain('"   "')
    })

    it('displays comments with special characters', () => {
      const wrapper = mountComponent({
        microvolunteering: createTestMicrovolunteering({
          comments: 'Test <script>alert("xss")</script>',
        }),
      })
      // Vue escapes HTML by default
      expect(wrapper.text()).toContain('Test')
    })
  })
})
