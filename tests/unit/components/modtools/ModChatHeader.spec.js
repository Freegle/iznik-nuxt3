import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref, reactive, defineComponent, h, Suspense, nextTick } from 'vue'

/*
 * We don't mock #imports. The vitest.config.mts alias provides the mock.
 * For router functionality, we'll mock it through the nuxt-app module.
 */

/* We need to spy on the router.push method */
import * as nuxtAppModule from '#imports'

import ModChatHeader from '~/modtools/components/ModChatHeader.vue'
const mockRouterPush = vi.fn()
vi.spyOn(nuxtAppModule, 'useRouter').mockReturnValue({
  push: mockRouterPush,
  replace: vi.fn(),
  currentRoute: { value: { path: '/' } },
})

/* Mock the composable - must be before component import */
const mockChat = ref(null)
const mockOtheruser = ref(null)
const mockUnseen = ref(0)
const mockMilesaway = ref(null)
const mockMilesstring = ref(null)

/* The composable is awaited, so it needs to return a Promise */
vi.mock('~/modtools/composables/useChatMT', () => ({
  setupChatMT: vi.fn(() =>
    Promise.resolve({
      chat: mockChat,
      otheruser: mockOtheruser,
      unseen: mockUnseen,
      milesaway: mockMilesaway,
      milesstring: mockMilesstring,
    })
  ),
}))

/* Mock chat store */
const mockChatStore = {
  hide: vi.fn().mockResolvedValue(),
  block: vi.fn().mockResolvedValue(),
  unhide: vi.fn().mockResolvedValue(),
  markRead: vi.fn().mockResolvedValue(),
  fetchChat: vi.fn().mockResolvedValue(),
  fetchMessages: vi.fn().mockResolvedValue(),
}

vi.mock('~/stores/chat', () => ({
  useChatStore: () => mockChatStore,
}))

/* Mock misc store - using reactive() for reactivity in computed properties */
const mockMiscVals = reactive({})
const mockMiscStore = {
  get: vi.fn((key) => mockMiscVals[key]),
  set: vi.fn(({ key, value }) => {
    mockMiscVals[key] = value
  }),
}

vi.mock('~/stores/misc', () => ({
  useMiscStore: () => mockMiscStore,
}))

/* Mock timeago from composable */
vi.mock('~/composables/useTimeFormat', () => ({
  timeago: (val) => `timeago:${val}`,
}))

/* Mock navigateTo */
const mockNavigateTo = vi.fn()
globalThis.navigateTo = mockNavigateTo

describe('ModChatHeader', () => {
  const defaultProps = {
    id: 123,
  }

  const createChat = (overrides = {}) => ({
    id: 123,
    name: 'Test Chat',
    chattype: 'User2User',
    otheruid: 456,
    status: 'Online',
    icon: '/chat-icon.png',
    group: { id: 789 },
    user1id: 456,
    ...overrides,
  })

  const createOtheruser = (overrides = {}) => ({
    id: 456,
    displayname: 'Other User',
    profile: { paththumb: '/profile.jpg' },
    info: { replytime: 3600 },
    lastaccess: '2024-01-15T10:00:00Z',
    aboutme: { text: 'Hello, I like reusing things!' },
    supporter: false,
    deleted: false,
    lat: 51.5,
    lng: -0.1,
    ...overrides,
  })

  const globalStubs = {
    'b-button': {
      template:
        '<button :class="variant" @click="$emit(\'click\')"><slot /></button>',
      props: ['variant', 'size'],
    },
    'b-badge': {
      template: '<span class="badge" :class="variant"><slot /></span>',
      props: ['variant'],
    },
    'b-img': {
      template: '<img :src="src" :alt="alt" :width="width" />',
      props: ['src', 'alt', 'width'],
    },
    'v-icon': {
      template: '<i :class="icon" :title="title" />',
      props: ['icon', 'title'],
    },
    ProfileImage: {
      template:
        '<img :src="image" :alt="name" class="profile-image" @click="$emit(\'click\')" />',
      props: ['image', 'name', 'isThumbnail', 'size', 'border'],
    },
    UserRatings: {
      template: '<div class="user-ratings" />',
      props: ['id', 'size'],
    },
    SupporterInfo: {
      template: '<span class="supporter-info" />',
    },
    ChatBlockModal: {
      template: '<div class="chat-block-modal" />',
      props: ['id', 'user'],
    },
    ChatReportModal: {
      template: '<div class="chat-report-modal" />',
      props: ['id', 'user', 'chatid'],
    },
    ChatHideModal: {
      template: '<div class="chat-hide-modal" />',
      props: ['id', 'user'],
    },
  }

  /* Helper to mount component with Suspense wrapper for async setup */
  async function mountComponent(props = {}) {
    const TestWrapper = defineComponent({
      components: { ModChatHeader },
      setup() {
        return () =>
          h(Suspense, null, {
            default: () => h(ModChatHeader, { ...defaultProps, ...props }),
            fallback: () => h('div', { class: 'fallback' }, 'Loading...'),
          })
      },
    })

    const wrapper = mount(TestWrapper, {
      global: {
        stubs: globalStubs,
        directives: {
          'b-tooltip': {
            mounted: () => {},
            updated: () => {},
          },
        },
      },
    })

    /* Wait for Suspense to resolve */
    await flushPromises()
    await nextTick()
    await flushPromises()

    return wrapper
  }

  /* Get the inner component */
  function getInner(wrapper) {
    return wrapper.findComponent(ModChatHeader)
  }

  beforeEach(() => {
    vi.clearAllMocks()
    /* Reset reactive refs */
    mockChat.value = createChat()
    mockOtheruser.value = createOtheruser()
    mockUnseen.value = 0
    mockMilesaway.value = 5
    mockMilesstring.value = '5 miles away'
    /* Reset misc store values */
    Object.keys(mockMiscVals).forEach((key) => delete mockMiscVals[key])
    mockMiscVals.chatinfoheader = false
  })

  describe('rendering', () => {
    it('renders component when chat exists and displays chat name', async () => {
      mockChat.value = createChat({ name: 'Custom Chat Name' })
      const wrapper = await mountComponent()
      expect(wrapper.find('.outer').exists()).toBe(true)
      expect(wrapper.text()).toContain('Custom Chat Name')
    })

    it.each([
      [null, null, 'User2User', true, 'chat is null'],
      [
        'User2User',
        { info: null },
        'User2User',
        true,
        'User2User chat has no otheruser info',
      ],
      [
        'User2Mod',
        null,
        'User2Mod',
        false,
        'non-User2User chat without otheruser info',
      ],
    ])(
      'loading state when %s',
      async (chattype, otheruser, _type, showsLoading, _desc) => {
        mockChat.value = chattype ? createChat({ chattype }) : null
        mockOtheruser.value = otheruser
        const wrapper = await mountComponent()
        expect(wrapper.find('.outer').exists()).toBe(!showsLoading)
        expect(wrapper.find('img[alt="Loading..."]').exists()).toBe(
          showsLoading
        )
      }
    )

    it('profile image uses otheruser profile or falls back to chat icon', async () => {
      /* Test with otheruser profile */
      mockChat.value = createChat()
      mockOtheruser.value = createOtheruser({
        profile: { paththumb: '/thumb.jpg' },
      })
      let wrapper = await mountComponent()
      expect(wrapper.find('.profile-image').exists()).toBe(true)

      /* Test fallback to chat icon */
      mockChat.value = createChat({ icon: '/chat-icon.png' })
      mockOtheruser.value = createOtheruser({ profile: null })
      wrapper = await mountComponent()
      const img = wrapper.find('.profile-image')
      expect(img.exists()).toBe(true)
      expect(img.attributes('src')).toBe('/chat-icon.png')
    })

    it('shows UserRatings when otheruser has info', async () => {
      mockChat.value = createChat()
      mockOtheruser.value = createOtheruser({ info: { replytime: 60 } })
      const wrapper = await mountComponent()
      expect(wrapper.find('.user-ratings').exists()).toBe(true)
    })

    it.each([
      [true, true],
      [false, false],
    ])(
      'SupporterInfo shows=%s when supporter=%s',
      async (supporter, shouldShow) => {
        mockChat.value = createChat()
        mockOtheruser.value = createOtheruser({ supporter })
        const wrapper = await mountComponent()
        expect(wrapper.find('.supporter-info').exists()).toBe(shouldShow)
      }
    )
  })

  describe('computed properties', () => {
    describe('collapsed', () => {
      it('gets/sets chatinfoheader value in miscStore', async () => {
        const wrapper = await mountComponent()
        const inner = getInner(wrapper)

        /* Test getter - set value in store and verify computed returns it */
        mockMiscVals.chatinfoheader = true
        await nextTick()
        expect(inner.vm.collapsed).toBe(true)

        /* Test setter - setting computed should call store.set */
        vi.clearAllMocks()
        inner.vm.collapsed = false
        expect(mockMiscStore.set).toHaveBeenCalledWith({
          key: 'chatinfoheader',
          value: false,
        })
      })
    })

    describe('replytime', () => {
      it.each([
        [1, '1 second'],
        [30, '30 seconds'],
        [60, '1 minute'],
        [300, '5 minutes'],
        [3600, '1 hour'],
        [7200, '2 hours'],
        [86400, '1 day'],
        [172800, '2 days'],
      ])('formats %i seconds as "%s"', async (seconds, expected) => {
        mockOtheruser.value = createOtheruser({
          info: { replytime: seconds },
        })
        const wrapper = await mountComponent()
        const inner = getInner(wrapper)
        expect(inner.vm.replytime).toBe(expected)
      })

      it.each([
        [{ info: { replytime: null } }, 'no replytime value'],
        [{ info: null }, 'no otheruser info'],
      ])('returns null when %s', async (overrides) => {
        mockOtheruser.value = createOtheruser(overrides)
        const wrapper = await mountComponent()
        const inner = getInner(wrapper)
        expect(inner.vm.replytime).toBe(null)
      })
    })

    describe('aboutthem', () => {
      it('returns aboutme text or null based on availability', async () => {
        /* Test with aboutme text */
        mockOtheruser.value = createOtheruser({
          aboutme: { text: 'I love freegling!' },
        })
        let wrapper = await mountComponent()
        let inner = getInner(wrapper)
        expect(inner.vm.aboutthem).toBe('I love freegling!')

        /* Test with null aboutme */
        mockOtheruser.value = createOtheruser({ aboutme: null })
        wrapper = await mountComponent()
        inner = getInner(wrapper)
        expect(inner.vm.aboutthem).toBe(null)
      })
    })

    describe('otheraccess', () => {
      it('returns timeago formatted lastaccess', async () => {
        mockOtheruser.value = createOtheruser({
          lastaccess: '2024-01-15T10:00:00Z',
        })
        const wrapper = await mountComponent()
        const inner = getInner(wrapper)
        expect(inner.vm.otheraccess).toBe('timeago:2024-01-15T10:00:00Z')
      })
    })
  })

  describe('methods', () => {
    it('collapse sets collapsed value and is exposed for external access', async () => {
      const wrapper = await mountComponent()
      const inner = getInner(wrapper)
      expect(typeof inner.vm.collapse).toBe('function')
      inner.vm.collapse(true)
      expect(mockMiscStore.set).toHaveBeenCalledWith({
        key: 'chatinfoheader',
        value: true,
      })
    })

    it.each([
      ['hide', 'hide', true],
      ['block', 'block', true],
      ['unhide', 'unhide', false],
    ])(
      '%s calls chatStore.%s and navigates accordingly',
      async (method, storeMethod, navigates) => {
        const wrapper = await mountComponent()
        const inner = getInner(wrapper)
        await inner.vm[method]()
        expect(mockChatStore[storeMethod]).toHaveBeenCalledWith(123)
        if (navigates) {
          expect(mockRouterPush).toHaveBeenCalledWith('/chats')
        }
      }
    )

    it.each([
      ['showhide', 'showChatHide'],
      ['showblock', 'showChatBlock'],
      ['report', 'showChatReport'],
    ])('%s sets %s to true', async (method, stateProp) => {
      const wrapper = await mountComponent()
      const inner = getInner(wrapper)
      expect(inner.vm[stateProp]).toBe(false)
      inner.vm[method]()
      expect(inner.vm[stateProp]).toBe(true)
    })

    it('showInfo navigates to member page', async () => {
      mockChat.value = createChat({
        group: { id: 789 },
        user1id: 456,
      })
      const wrapper = await mountComponent()
      const inner = getInner(wrapper)
      inner.vm.showInfo()
      expect(mockNavigateTo).toHaveBeenCalledWith('/members/approved/789/456')
    })

    it('markRead calls chatStore.markRead and fetchChat', async () => {
      const wrapper = await mountComponent()
      const inner = getInner(wrapper)
      await inner.vm.markRead()
      expect(mockChatStore.markRead).toHaveBeenCalledWith(123)
      expect(mockChatStore.fetchChat).toHaveBeenCalledWith(123)
    })
  })

  describe('collapsed state', () => {
    it.each([
      ['.profile-image', false, true, 'profile image'],
      ['.collapsedbutton', true, false, 'expand button'],
      ['.actions', false, true, 'actions'],
    ])(
      '%s visibility toggles with collapsed state (collapsed=%s, expanded=%s)',
      async (selector, visibleWhenCollapsed, visibleWhenExpanded, _name) => {
        const wrapper = await mountComponent()
        const inner = getInner(wrapper)

        /* Test expanded state (component starts expanded) */
        expect(wrapper.find(selector).exists()).toBe(visibleWhenExpanded)

        /* Test collapsed state */
        inner.vm.collapsed = true
        await nextTick()
        expect(wrapper.find(selector).exists()).toBe(visibleWhenCollapsed)
      }
    )
  })

  describe('unseen messages', () => {
    it('shows/hides Mark read button and badge based on unseen count', async () => {
      /* Test with unseen messages */
      mockUnseen.value = 5
      let wrapper = await mountComponent()
      expect(wrapper.text()).toContain('Mark read')
      expect(wrapper.text()).toContain('5')

      /* Test with no unseen messages */
      mockUnseen.value = 0
      wrapper = await mountComponent()
      expect(wrapper.text()).not.toContain('Mark read')
    })
  })

  describe('chat status buttons', () => {
    it.each([
      ['Closed', 'Unhide', 'Hide'],
      ['Online', 'Hide', 'Unhide'],
    ])(
      'shows %s button when chat status is %s',
      async (status, expectedText, notExpectedText) => {
        mockChat.value = createChat({ status })
        const wrapper = await mountComponent()
        expect(wrapper.text()).toContain(expectedText)
        expect(wrapper.text()).not.toContain(notExpectedText)
      }
    )

    it.each([
      ['User2User', 'Blocked', 'Unblock', true],
      ['User2User', 'Online', 'Block', true],
      ['User2Mod', 'Online', 'Block', false],
    ])(
      'for %s chat with status %s, Block/Unblock button shows=%s',
      async (chattype, status, buttonText, shouldShow) => {
        mockChat.value = createChat({ chattype, status })
        mockOtheruser.value = createOtheruser()
        const wrapper = await mountComponent()
        if (shouldShow) {
          expect(wrapper.text()).toContain(buttonText)
        } else {
          expect(wrapper.text()).not.toContain(buttonText)
        }
      }
    )

    it.each([
      ['User2User', false, true],
      ['User2User', true, false],
      ['User2Mod', false, false],
    ])(
      'for %s chat with deleted=%s, Report button shows=%s',
      async (chattype, deleted, shouldShow) => {
        mockChat.value = createChat({ chattype })
        mockOtheruser.value = createOtheruser({ deleted })
        const wrapper = await mountComponent()
        if (shouldShow) {
          expect(wrapper.text()).toContain('Report')
        } else {
          expect(wrapper.text()).not.toContain('Report')
        }
      }
    )
  })

  describe('view profile button', () => {
    it.each([
      [
        { info: { replytime: 60 }, deleted: false },
        true,
        'has info and not deleted',
      ],
      [{ deleted: true }, false, 'user is deleted'],
      [{ info: null }, false, 'user has no info'],
    ])(
      'View profile button shows=%s when %s',
      async (overrides, shouldShow) => {
        mockChat.value = createChat()
        mockOtheruser.value = createOtheruser(overrides)
        const wrapper = await mountComponent()
        if (shouldShow) {
          expect(wrapper.text()).toContain('View profile')
        } else {
          expect(wrapper.text()).not.toContain('View profile')
        }
      }
    )
  })

  describe('aboutthem blockquote', () => {
    it('shows/hides aboutthem based on collapsed state', async () => {
      mockMiscVals.chatinfoheader = false
      mockOtheruser.value = createOtheruser({
        aboutme: { text: 'Love recycling!' },
      })
      const wrapper = await mountComponent()

      /* Verify aboutthem is shown when expanded */
      expect(wrapper.text()).toContain('Love recycling!')
      expect(wrapper.find('.aboutthem').exists()).toBe(true)

      /* Collapse and verify it's hidden */
      mockMiscVals.chatinfoheader = true
      await nextTick()
      expect(wrapper.find('.aboutthem').exists()).toBe(false)
    })
  })

  describe('userinfo display', () => {
    it('shows last seen time and replytime when available', async () => {
      mockOtheruser.value = createOtheruser({
        lastaccess: '2024-01-15T10:00:00Z',
        info: { replytime: 3600 },
      })
      const wrapper = await mountComponent()
      expect(wrapper.text()).toContain('Last seen')
      expect(wrapper.text()).toContain('Typically replies in')
    })

    it.each([
      [false, true, 'shows distance when user not deleted'],
      [true, false, 'hides distance when user is deleted'],
    ])('deleted=%s: distance visible=%s', async (deleted, shouldShow) => {
      mockMilesaway.value = 10
      mockMilesstring.value = '10 miles away'
      mockOtheruser.value = createOtheruser({ deleted })
      const wrapper = await mountComponent()
      if (shouldShow) {
        expect(wrapper.text()).toContain('About')
        expect(wrapper.text()).toContain('10 miles away')
      } else {
        expect(wrapper.text()).not.toContain('10 miles away')
      }
    })
  })

  describe('modals', () => {
    it.each([
      ['User2User', 'showChatBlock', '.chat-block-modal', true],
      ['User2User', 'showChatReport', '.chat-report-modal', true],
      ['User2User', 'showChatHide', '.chat-hide-modal', true],
      ['User2Mod', 'showChatHide', '.chat-hide-modal', true],
      ['User2Mod', 'showChatBlock', '.chat-block-modal', false],
    ])(
      '%s chat: %s renders modal=%s',
      async (chattype, stateProp, selector, shouldRender) => {
        mockChat.value = createChat({ chattype })
        mockOtheruser.value = createOtheruser()
        const wrapper = await mountComponent()
        const inner = getInner(wrapper)
        inner.vm[stateProp] = true
        await nextTick()
        expect(wrapper.find(selector).exists()).toBe(shouldRender)
      }
    )
  })

  describe('button interactions', () => {
    it('Mark read button calls markRead', async () => {
      mockUnseen.value = 5
      const wrapper = await mountComponent()
      const markReadBtn = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Mark read'))
      expect(markReadBtn).toBeDefined()
      await markReadBtn.trigger('click')
      expect(mockChatStore.markRead).toHaveBeenCalledWith(123)
    })

    it('View profile button calls showInfo', async () => {
      mockChat.value = createChat({
        group: { id: 789 },
        user1id: 456,
      })
      mockOtheruser.value = createOtheruser({
        info: { replytime: 60 },
        deleted: false,
      })
      const wrapper = await mountComponent()
      const viewProfileBtn = wrapper
        .findAll('button')
        .find((b) => b.text().includes('View profile'))
      expect(viewProfileBtn).toBeDefined()
      await viewProfileBtn.trigger('click')
      expect(mockNavigateTo).toHaveBeenCalledWith('/members/approved/789/456')
    })

    it('Hide/Unhide buttons trigger appropriate actions', async () => {
      /* Test Hide button */
      mockChat.value = createChat({ chattype: 'User2User', status: 'Online' })
      let wrapper = await mountComponent()
      const inner = getInner(wrapper)
      const hideBtn = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Hide'))
      expect(hideBtn).toBeDefined()
      await hideBtn.trigger('click')
      expect(inner.vm.showChatHide).toBe(true)

      /* Test Unhide button */
      mockChat.value = createChat({ chattype: 'User2User', status: 'Closed' })
      wrapper = await mountComponent()
      const unhideBtn = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Unhide'))
      expect(unhideBtn).toBeDefined()
      await unhideBtn.trigger('click')
      expect(mockChatStore.unhide).toHaveBeenCalledWith(123)
    })

    it('Block and Report buttons set appropriate modal states', async () => {
      mockChat.value = createChat({ chattype: 'User2User', status: 'Online' })
      mockOtheruser.value = createOtheruser({ deleted: false })
      const wrapper = await mountComponent()
      const inner = getInner(wrapper)

      /* Test Block button */
      const blockBtn = wrapper
        .findAll('button')
        .find((b) => b.text() === 'Block')
      expect(blockBtn).toBeDefined()
      await blockBtn.trigger('click')
      expect(inner.vm.showChatBlock).toBe(true)

      /* Reset and test Report button */
      inner.vm.showChatBlock = false
      const reportBtn = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Report'))
      expect(reportBtn).toBeDefined()
      await reportBtn.trigger('click')
      expect(inner.vm.showChatReport).toBe(true)
    })
  })

  describe('initialization', () => {
    it('sets initial collapsed state to false on mount', async () => {
      await mountComponent()
      expect(mockMiscStore.set).toHaveBeenCalledWith({
        key: 'chatinfoheader',
        value: false,
      })
    })
  })

  describe('watch behavior', () => {
    it('fetches messages when unseen changes', async () => {
      await mountComponent()
      vi.clearAllMocks()
      mockUnseen.value = 5
      await nextTick()
      /* The watch is async so we need to wait */
      await flushPromises()
      expect(mockChatStore.fetchMessages).toHaveBeenCalledWith(123)
    })
  })
})
