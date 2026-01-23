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
    it('renders the component when chat exists', async () => {
      const wrapper = await mountComponent()
      expect(wrapper.find('.outer').exists()).toBe(true)
    })

    it('shows loading when chat is null', async () => {
      mockChat.value = null
      const wrapper = await mountComponent()
      expect(wrapper.find('.outer').exists()).toBe(false)
      expect(wrapper.find('img[alt="Loading..."]').exists()).toBe(true)
    })

    it('shows loading when User2User chat has no otheruser info', async () => {
      mockChat.value = createChat({ chattype: 'User2User' })
      mockOtheruser.value = { info: null }
      const wrapper = await mountComponent()
      expect(wrapper.find('.outer').exists()).toBe(false)
      expect(wrapper.find('img[alt="Loading..."]').exists()).toBe(true)
    })

    it('renders non-User2User chat without requiring otheruser info', async () => {
      mockChat.value = createChat({ chattype: 'User2Mod' })
      mockOtheruser.value = null
      const wrapper = await mountComponent()
      expect(wrapper.find('.outer').exists()).toBe(true)
    })

    it('displays chat name', async () => {
      mockChat.value = createChat({ name: 'Custom Chat Name' })
      const wrapper = await mountComponent()
      expect(wrapper.text()).toContain('Custom Chat Name')
    })

    it('shows profile image when not collapsed and has image', async () => {
      mockChat.value = createChat()
      mockOtheruser.value = createOtheruser({
        profile: { paththumb: '/thumb.jpg' },
      })
      const wrapper = await mountComponent()
      expect(wrapper.find('.profile-image').exists()).toBe(true)
    })

    it('uses chat icon when otheruser has no profile image', async () => {
      mockChat.value = createChat({ icon: '/chat-icon.png' })
      mockOtheruser.value = createOtheruser({ profile: null })
      const wrapper = await mountComponent()
      const img = wrapper.find('.profile-image')
      expect(img.exists()).toBe(true)
      expect(img.attributes('src')).toBe('/chat-icon.png')
    })

    it('shows UserRatings when otheruser has info and not deleted', async () => {
      mockChat.value = createChat()
      mockOtheruser.value = createOtheruser({ info: { replytime: 60 } })
      const wrapper = await mountComponent()
      expect(wrapper.find('.user-ratings').exists()).toBe(true)
    })

    it('shows SupporterInfo when otheruser is supporter', async () => {
      mockChat.value = createChat()
      mockOtheruser.value = createOtheruser({ supporter: true })
      const wrapper = await mountComponent()
      expect(wrapper.find('.supporter-info').exists()).toBe(true)
    })

    it('does not show SupporterInfo when otheruser is not supporter', async () => {
      mockChat.value = createChat()
      mockOtheruser.value = createOtheruser({ supporter: false })
      const wrapper = await mountComponent()
      expect(wrapper.find('.supporter-info').exists()).toBe(false)
    })
  })

  describe('computed properties', () => {
    describe('collapsed', () => {
      it('returns chatinfoheader value from miscStore', async () => {
        /* Component sets collapsed=false on mount, so set value after mount */
        const wrapper = await mountComponent()
        const inner = getInner(wrapper)
        mockMiscVals.chatinfoheader = true
        await nextTick()
        expect(inner.vm.collapsed).toBe(true)
      })

      it('sets chatinfoheader value in miscStore', async () => {
        const wrapper = await mountComponent()
        const inner = getInner(wrapper)
        inner.vm.collapsed = true
        expect(mockMiscStore.set).toHaveBeenCalledWith({
          key: 'chatinfoheader',
          value: true,
        })
      })
    })

    describe('replytime', () => {
      it('returns formatted seconds for < 60 seconds', async () => {
        mockOtheruser.value = createOtheruser({
          info: { replytime: 30 },
        })
        const wrapper = await mountComponent()
        const inner = getInner(wrapper)
        expect(inner.vm.replytime).toBe('30 seconds')
      })

      it('returns singular second for 1 second', async () => {
        mockOtheruser.value = createOtheruser({
          info: { replytime: 1 },
        })
        const wrapper = await mountComponent()
        const inner = getInner(wrapper)
        expect(inner.vm.replytime).toBe('1 second')
      })

      it('returns formatted minutes for < 60 minutes', async () => {
        mockOtheruser.value = createOtheruser({
          info: { replytime: 300 },
        })
        const wrapper = await mountComponent()
        const inner = getInner(wrapper)
        expect(inner.vm.replytime).toBe('5 minutes')
      })

      it('returns singular minute for ~1 minute', async () => {
        mockOtheruser.value = createOtheruser({
          info: { replytime: 60 },
        })
        const wrapper = await mountComponent()
        const inner = getInner(wrapper)
        expect(inner.vm.replytime).toBe('1 minute')
      })

      it('returns formatted hours for < 24 hours', async () => {
        mockOtheruser.value = createOtheruser({
          info: { replytime: 7200 },
        })
        const wrapper = await mountComponent()
        const inner = getInner(wrapper)
        expect(inner.vm.replytime).toBe('2 hours')
      })

      it('returns singular hour for 1 hour', async () => {
        mockOtheruser.value = createOtheruser({
          info: { replytime: 3600 },
        })
        const wrapper = await mountComponent()
        const inner = getInner(wrapper)
        expect(inner.vm.replytime).toBe('1 hour')
      })

      it('returns formatted days for >= 24 hours', async () => {
        mockOtheruser.value = createOtheruser({
          info: { replytime: 172800 },
        })
        const wrapper = await mountComponent()
        const inner = getInner(wrapper)
        expect(inner.vm.replytime).toBe('2 days')
      })

      it('returns singular day for 1 day', async () => {
        mockOtheruser.value = createOtheruser({
          info: { replytime: 86400 },
        })
        const wrapper = await mountComponent()
        const inner = getInner(wrapper)
        expect(inner.vm.replytime).toBe('1 day')
      })

      it('returns null when no replytime', async () => {
        mockOtheruser.value = createOtheruser({
          info: { replytime: null },
        })
        const wrapper = await mountComponent()
        const inner = getInner(wrapper)
        expect(inner.vm.replytime).toBe(null)
      })

      it('returns null when no otheruser info', async () => {
        mockOtheruser.value = createOtheruser({ info: null })
        const wrapper = await mountComponent()
        const inner = getInner(wrapper)
        expect(inner.vm.replytime).toBe(null)
      })
    })

    describe('aboutthem', () => {
      it('returns aboutme text when available', async () => {
        mockOtheruser.value = createOtheruser({
          aboutme: { text: 'I love freegling!' },
        })
        const wrapper = await mountComponent()
        const inner = getInner(wrapper)
        expect(inner.vm.aboutthem).toBe('I love freegling!')
      })

      it('returns null when aboutme is null', async () => {
        mockOtheruser.value = createOtheruser({ aboutme: null })
        const wrapper = await mountComponent()
        const inner = getInner(wrapper)
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
    describe('collapse', () => {
      it('sets collapsed value', async () => {
        const wrapper = await mountComponent()
        const inner = getInner(wrapper)
        inner.vm.collapse(true)
        expect(mockMiscStore.set).toHaveBeenCalledWith({
          key: 'chatinfoheader',
          value: true,
        })
      })

      it('is exposed for external access', async () => {
        const wrapper = await mountComponent()
        const inner = getInner(wrapper)
        expect(typeof inner.vm.collapse).toBe('function')
      })
    })

    describe('hide', () => {
      it('calls chatStore.hide and navigates to /chats', async () => {
        const wrapper = await mountComponent()
        const inner = getInner(wrapper)
        await inner.vm.hide()
        expect(mockChatStore.hide).toHaveBeenCalledWith(123)
        expect(mockRouterPush).toHaveBeenCalledWith('/chats')
      })
    })

    describe('block', () => {
      it('calls chatStore.block and navigates to /chats', async () => {
        const wrapper = await mountComponent()
        const inner = getInner(wrapper)
        await inner.vm.block()
        expect(mockChatStore.block).toHaveBeenCalledWith(123)
        expect(mockRouterPush).toHaveBeenCalledWith('/chats')
      })
    })

    describe('unhide', () => {
      it('calls chatStore.unhide', async () => {
        const wrapper = await mountComponent()
        const inner = getInner(wrapper)
        await inner.vm.unhide()
        expect(mockChatStore.unhide).toHaveBeenCalledWith(123)
      })
    })

    describe('showhide', () => {
      it('sets showChatHide to true', async () => {
        const wrapper = await mountComponent()
        const inner = getInner(wrapper)
        expect(inner.vm.showChatHide).toBe(false)
        inner.vm.showhide()
        expect(inner.vm.showChatHide).toBe(true)
      })
    })

    describe('showblock', () => {
      it('sets showChatBlock to true', async () => {
        const wrapper = await mountComponent()
        const inner = getInner(wrapper)
        expect(inner.vm.showChatBlock).toBe(false)
        inner.vm.showblock()
        expect(inner.vm.showChatBlock).toBe(true)
      })
    })

    describe('showInfo', () => {
      it('navigates to member page', async () => {
        mockChat.value = createChat({
          group: { id: 789 },
          user1id: 456,
        })
        const wrapper = await mountComponent()
        const inner = getInner(wrapper)
        inner.vm.showInfo()
        expect(mockNavigateTo).toHaveBeenCalledWith('/members/approved/789/456')
      })
    })

    describe('report', () => {
      it('sets showChatReport to true', async () => {
        const wrapper = await mountComponent()
        const inner = getInner(wrapper)
        expect(inner.vm.showChatReport).toBe(false)
        inner.vm.report()
        expect(inner.vm.showChatReport).toBe(true)
      })
    })

    describe('markRead', () => {
      it('calls chatStore.markRead and fetchChat', async () => {
        const wrapper = await mountComponent()
        const inner = getInner(wrapper)
        await inner.vm.markRead()
        expect(mockChatStore.markRead).toHaveBeenCalledWith(123)
        expect(mockChatStore.fetchChat).toHaveBeenCalledWith(123)
      })
    })
  })

  describe('collapsed state', () => {
    it('hides profile image when collapsed', async () => {
      /* The component sets collapsed=false on mount, so we need to set it after */
      const wrapper = await mountComponent()
      const inner = getInner(wrapper)
      inner.vm.collapsed = true
      await nextTick()
      expect(wrapper.find('.profile-image').exists()).toBe(false)
    })

    it('shows expand button when collapsed', async () => {
      const wrapper = await mountComponent()
      const inner = getInner(wrapper)
      inner.vm.collapsed = true
      await nextTick()
      expect(wrapper.find('.collapsedbutton').exists()).toBe(true)
    })

    it('hides actions when collapsed', async () => {
      const wrapper = await mountComponent()
      const inner = getInner(wrapper)
      inner.vm.collapsed = true
      await nextTick()
      expect(wrapper.find('.actions').exists()).toBe(false)
    })

    it('shows actions when not collapsed', async () => {
      /* Component starts with collapsed=false, so this should pass as-is */
      const wrapper = await mountComponent()
      expect(wrapper.find('.actions').exists()).toBe(true)
    })
  })

  describe('unseen messages', () => {
    it('shows Mark read button when there are unseen messages', async () => {
      mockUnseen.value = 5
      const wrapper = await mountComponent()
      expect(wrapper.text()).toContain('Mark read')
    })

    it('shows badge with unseen count', async () => {
      mockUnseen.value = 3
      const wrapper = await mountComponent()
      expect(wrapper.text()).toContain('3')
    })

    it('hides Mark read button when no unseen messages', async () => {
      mockUnseen.value = 0
      const wrapper = await mountComponent()
      expect(wrapper.text()).not.toContain('Mark read')
    })
  })

  describe('chat status buttons', () => {
    describe('hide/unhide', () => {
      it('shows Unhide button when chat is Closed', async () => {
        mockChat.value = createChat({ status: 'Closed' })
        const wrapper = await mountComponent()
        expect(wrapper.text()).toContain('Unhide')
      })

      it('shows Hide button when chat is not Closed', async () => {
        mockChat.value = createChat({ status: 'Online' })
        const wrapper = await mountComponent()
        expect(wrapper.text()).toContain('Hide')
      })
    })

    describe('block/unblock', () => {
      it('shows Unblock button when chat is Blocked', async () => {
        mockChat.value = createChat({
          chattype: 'User2User',
          status: 'Blocked',
        })
        mockOtheruser.value = createOtheruser()
        const wrapper = await mountComponent()
        expect(wrapper.text()).toContain('Unblock')
      })

      it('shows Block button when chat is not Blocked', async () => {
        mockChat.value = createChat({
          chattype: 'User2User',
          status: 'Online',
        })
        mockOtheruser.value = createOtheruser()
        const wrapper = await mountComponent()
        expect(wrapper.text()).toContain('Block')
      })

      it('hides Block button for non-User2User chats', async () => {
        mockChat.value = createChat({ chattype: 'User2Mod' })
        const wrapper = await mountComponent()
        expect(wrapper.text()).not.toContain('Block')
      })
    })

    describe('report', () => {
      it('shows Report button for User2User chat with non-deleted otheruser', async () => {
        mockChat.value = createChat({ chattype: 'User2User' })
        mockOtheruser.value = createOtheruser({ deleted: false })
        const wrapper = await mountComponent()
        expect(wrapper.text()).toContain('Report')
      })

      it('hides Report button for deleted otheruser', async () => {
        mockChat.value = createChat({ chattype: 'User2User' })
        mockOtheruser.value = createOtheruser({ deleted: true })
        const wrapper = await mountComponent()
        expect(wrapper.text()).not.toContain('Report')
      })

      it('hides Report button for non-User2User chats', async () => {
        mockChat.value = createChat({ chattype: 'User2Mod' })
        const wrapper = await mountComponent()
        expect(wrapper.text()).not.toContain('Report')
      })
    })
  })

  describe('view profile button', () => {
    it('shows View profile button when otheruser has info and not deleted', async () => {
      mockChat.value = createChat()
      mockOtheruser.value = createOtheruser({
        info: { replytime: 60 },
        deleted: false,
      })
      const wrapper = await mountComponent()
      expect(wrapper.text()).toContain('View profile')
    })

    it('hides View profile button when otheruser is deleted', async () => {
      mockChat.value = createChat()
      mockOtheruser.value = createOtheruser({ deleted: true })
      const wrapper = await mountComponent()
      expect(wrapper.text()).not.toContain('View profile')
    })

    it('hides View profile button when otheruser has no info', async () => {
      mockChat.value = createChat()
      mockOtheruser.value = createOtheruser({ info: null })
      const wrapper = await mountComponent()
      expect(wrapper.text()).not.toContain('View profile')
    })
  })

  describe('aboutthem blockquote', () => {
    it('shows aboutthem when available and not collapsed', async () => {
      mockMiscVals.chatinfoheader = false
      mockOtheruser.value = createOtheruser({
        aboutme: { text: 'Love recycling!' },
      })
      const wrapper = await mountComponent()
      expect(wrapper.text()).toContain('Love recycling!')
    })

    it('hides aboutthem when collapsed', async () => {
      /* Component sets collapsed=false on mount, so set value after mount */
      mockOtheruser.value = createOtheruser({
        aboutme: { text: 'Love recycling!' },
      })
      const wrapper = await mountComponent()
      /* Verify aboutthem is shown initially */
      expect(wrapper.find('.aboutthem').exists()).toBe(true)
      /* Now collapse and verify it's hidden */
      mockMiscVals.chatinfoheader = true
      await nextTick()
      expect(wrapper.find('.aboutthem').exists()).toBe(false)
    })
  })

  describe('userinfo display', () => {
    it('shows last seen time when otheruser has lastaccess', async () => {
      mockOtheruser.value = createOtheruser({
        lastaccess: '2024-01-15T10:00:00Z',
        info: {},
      })
      const wrapper = await mountComponent()
      /* The template shows Last seen / Seen depending on screen size */
      expect(wrapper.text()).toContain('Last seen')
    })

    it('shows replytime when available', async () => {
      mockOtheruser.value = createOtheruser({
        info: { replytime: 3600 },
      })
      const wrapper = await mountComponent()
      expect(wrapper.text()).toContain('Typically replies in')
    })

    it('shows distance when milesaway available and user not deleted', async () => {
      mockMilesaway.value = 10
      mockMilesstring.value = '10 miles away'
      mockOtheruser.value = createOtheruser({ deleted: false })
      const wrapper = await mountComponent()
      expect(wrapper.text()).toContain('About')
      expect(wrapper.text()).toContain('10 miles away')
    })

    it('hides distance when user is deleted', async () => {
      mockMilesaway.value = 10
      mockMilesstring.value = '10 miles away'
      mockOtheruser.value = createOtheruser({ deleted: true })
      const wrapper = await mountComponent()
      expect(wrapper.text()).not.toContain('10 miles away')
    })
  })

  describe('modals', () => {
    it('renders ChatBlockModal when showChatBlock is true for User2User chat', async () => {
      mockChat.value = createChat({ chattype: 'User2User' })
      mockOtheruser.value = createOtheruser()
      const wrapper = await mountComponent()
      const inner = getInner(wrapper)
      inner.vm.showChatBlock = true
      await nextTick()
      expect(wrapper.find('.chat-block-modal').exists()).toBe(true)
    })

    it('renders ChatReportModal when showChatReport is true for User2User chat', async () => {
      mockChat.value = createChat({ chattype: 'User2User' })
      mockOtheruser.value = createOtheruser()
      const wrapper = await mountComponent()
      const inner = getInner(wrapper)
      inner.vm.showChatReport = true
      await nextTick()
      expect(wrapper.find('.chat-report-modal').exists()).toBe(true)
    })

    it('renders ChatHideModal when showChatHide is true', async () => {
      mockChat.value = createChat({ chattype: 'User2User' })
      mockOtheruser.value = createOtheruser()
      const wrapper = await mountComponent()
      const inner = getInner(wrapper)
      inner.vm.showChatHide = true
      await nextTick()
      expect(wrapper.find('.chat-hide-modal').exists()).toBe(true)
    })

    it('renders ChatHideModal for User2Mod chat', async () => {
      mockChat.value = createChat({ chattype: 'User2Mod' })
      mockOtheruser.value = createOtheruser()
      const wrapper = await mountComponent()
      const inner = getInner(wrapper)
      inner.vm.showChatHide = true
      await nextTick()
      expect(wrapper.find('.chat-hide-modal').exists()).toBe(true)
    })

    it('does not render ChatBlockModal for non-User2User chat', async () => {
      mockChat.value = createChat({ chattype: 'User2Mod' })
      mockOtheruser.value = createOtheruser()
      const wrapper = await mountComponent()
      const inner = getInner(wrapper)
      inner.vm.showChatBlock = true
      await nextTick()
      expect(wrapper.find('.chat-block-modal').exists()).toBe(false)
    })
  })

  describe('button interactions', () => {
    it('calls markRead when Mark read button clicked', async () => {
      mockUnseen.value = 5
      const wrapper = await mountComponent()
      const markReadBtn = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Mark read'))
      expect(markReadBtn).toBeDefined()
      await markReadBtn.trigger('click')
      expect(mockChatStore.markRead).toHaveBeenCalledWith(123)
    })

    it('calls showInfo when View profile button clicked', async () => {
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

    it('calls showhide when Hide chat button clicked', async () => {
      mockChat.value = createChat({ chattype: 'User2User', status: 'Online' })
      const wrapper = await mountComponent()
      const inner = getInner(wrapper)
      const hideBtn = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Hide'))
      expect(hideBtn).toBeDefined()
      await hideBtn.trigger('click')
      expect(inner.vm.showChatHide).toBe(true)
    })

    it('calls unhide when Unhide chat button clicked', async () => {
      mockChat.value = createChat({ chattype: 'User2User', status: 'Closed' })
      const wrapper = await mountComponent()
      const unhideBtn = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Unhide'))
      expect(unhideBtn).toBeDefined()
      await unhideBtn.trigger('click')
      expect(mockChatStore.unhide).toHaveBeenCalledWith(123)
    })

    it('calls showblock when Block button clicked', async () => {
      mockChat.value = createChat({ chattype: 'User2User', status: 'Online' })
      mockOtheruser.value = createOtheruser()
      const wrapper = await mountComponent()
      const inner = getInner(wrapper)
      const blockBtn = wrapper
        .findAll('button')
        .find((b) => b.text() === 'Block')
      expect(blockBtn).toBeDefined()
      await blockBtn.trigger('click')
      expect(inner.vm.showChatBlock).toBe(true)
    })

    it('calls report when Report button clicked', async () => {
      mockChat.value = createChat({ chattype: 'User2User' })
      mockOtheruser.value = createOtheruser({ deleted: false })
      const wrapper = await mountComponent()
      const inner = getInner(wrapper)
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
