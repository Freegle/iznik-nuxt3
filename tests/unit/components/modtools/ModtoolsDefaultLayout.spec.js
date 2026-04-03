import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, Suspense, computed, nextTick } from 'vue'

// Import layout after mocks
import DefaultLayout from '~/modtools/layouts/default.vue'

// Stub Nuxt auto-imported globals not available in vitest
vi.stubGlobal('useHead', vi.fn())
vi.stubGlobal('useRuntimeConfig', vi.fn().mockReturnValue({ public: {} }))

// Use vi.hoisted so these refs are available inside vi.mock factories (which are hoisted)
const { mockAuthStore } = vi.hoisted(() => {
  const { reactive } = require('vue')
  const mockAuthStore = reactive({
    user: null,
    auth: { jwt: null, persistent: null },
    loginStateKnown: false,
    forceLogin: false,
    discourse: null,
    work: null,
    fetchUser: () => Promise.resolve(null),
    logout: () => Promise.resolve(undefined),
  })
  return { mockAuthStore }
})

vi.mock('~/stores/auth', () => ({
  useAuthStore: () => mockAuthStore,
}))

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => mockAuthStore,
}))

vi.mock('~/stores/chat', () => ({
  useChatStore: () => ({
    fetchLatestChatsMT: vi.fn(),
  }),
}))

vi.mock('@/stores/chat', () => ({
  useChatStore: () => ({
    fetchLatestChatsMT: vi.fn(),
  }),
}))

vi.mock('~/stores/misc', () => ({
  useMiscStore: () => ({
    apiCount: 0,
    workTimer: null,
    setTime: vi.fn(),
    set: vi.fn(),
  }),
}))

vi.mock('@/stores/modgroup', () => ({
  useModGroupStore: () => ({
    getModGroups: vi.fn().mockResolvedValue([]),
  }),
}))

vi.mock('@/stores/modconfig', () => ({
  useModConfigStore: () => ({
    fetch: vi.fn().mockResolvedValue({}),
  }),
}))

vi.mock('~/composables/useMe', () => ({
  useMe: () => ({
    supportOrAdmin: computed(() => false),
  }),
}))

vi.mock('~/composables/useModMe', () => ({
  useModMe: () => ({
    hasPermissionNewsletter: computed(() => false),
    hasPermissionSpamAdmin: computed(() => false),
    hasPermissionGiftAid: computed(() => false),
    checkWork: vi.fn(),
  }),
}))

vi.mock('~/composables/useMTBuildHead', () => ({
  buildHead: vi.fn().mockReturnValue({}),
}))

vi.mock('vue-router', () => ({
  useRoute: () => ({
    fullPath: '/',
    path: '/',
    query: {},
  }),
  useRouter: () => ({
    push: vi.fn(),
    go: vi.fn(),
  }),
}))

/**
 * Mounts the DefaultLayout inside Suspense (required for async setup).
 */
function mountLayout(stubs = {}) {
  const Wrapper = defineComponent({
    render() {
      return h(Suspense, null, {
        default: () =>
          h(DefaultLayout, null, { default: () => h('div', 'page content') }),
        fallback: () => h('div', 'loading'),
      })
    },
  })

  return mount(Wrapper, {
    global: {
      stubs: {
        ModStatus: { template: '<span />' },
        ChatMenu: { template: '<span />' },
        GoogleOneTap: { template: '<span />' },
        LoginModal: {
          template: '<span />',
          setup() {
            return { show: vi.fn(), showModal: false }
          },
        },
        ModMenuItemLeft: { template: '<div />' },
        ModMissingRules: { template: '<div />' },
        ModMissingProfile: { template: '<div />' },
        SomethingWentWrong: { template: '<div />' },
        ExternalLink: { template: '<a><slot /></a>' },
        'b-navbar': { template: '<nav><slot /></nav>' },
        'b-navbar-brand': { template: '<div><slot /></div>' },
        'b-navbar-nav': { template: '<div><slot /></div>' },
        'b-nav-item': { template: '<div><slot /></div>' },
        'b-img': { template: '<img />' },
        'b-badge': { template: '<span><slot /></span>' },
        'b-button': { template: '<button><slot /></button>' },
        'v-icon': { template: '<span />' },
        ...stubs,
      },
    },
  })
}

describe('modtools default layout — leftmenu CLS prevention', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuthStore.user = null
    mockAuthStore.loginStateKnown = false
    mockAuthStore.fetchUser = vi.fn().mockResolvedValue(null)
    mockAuthStore.logout = vi.fn().mockResolvedValue(undefined)
  })

  afterEach(() => {
    mockAuthStore.user = null
    mockAuthStore.loginStateKnown = false
  })

  it('renders leftmenu with invisible+inert when showMenu=true and user is not logged in', async () => {
    // User is not logged in (no JWT, no persistent session — e.g. Google One Tap scenario)
    mockAuthStore.user = null
    mockAuthStore.loginStateKnown = false

    const wrapper = mountLayout()
    await flushPromises()
    await nextTick()

    // leftmenu must exist in DOM to reserve flex space and prevent CLS
    // when user logs in via Google One Tap (~10 seconds later)
    const leftmenu = wrapper.find('.leftmenu')
    expect(leftmenu.exists()).toBe(true)

    // invisible: visually hidden but still occupies layout space
    expect(leftmenu.classes()).toContain('invisible')
    // inert: removes from tab order and accessibility tree
    expect(leftmenu.attributes('inert')).not.toBeUndefined()
  })

  it('renders leftmenu without invisible/inert when user is logged in', async () => {
    mockAuthStore.user = { id: 1, displayname: 'Test User' }
    mockAuthStore.loginStateKnown = true

    const wrapper = mountLayout()
    await flushPromises()
    await nextTick()

    const leftmenu = wrapper.find('.leftmenu')
    expect(leftmenu.exists()).toBe(true)
    expect(leftmenu.classes()).not.toContain('invisible')
    expect(leftmenu.attributes('inert')).toBeUndefined()
  })

  it('removes invisible+inert when loggedIn transitions from false to true after mount', async () => {
    // Start not logged in
    mockAuthStore.user = null
    mockAuthStore.loginStateKnown = false

    const wrapper = mountLayout()
    await flushPromises()
    await nextTick()

    // Confirm invisible on initial render
    expect(wrapper.find('.leftmenu').classes()).toContain('invisible')

    // Simulate Google One Tap completing: user becomes available reactively
    mockAuthStore.user = { id: 42, displayname: 'Jane' }
    await nextTick()

    // invisible and inert should be gone — no layout shift when content is revealed
    const leftmenu = wrapper.find('.leftmenu')
    expect(leftmenu.classes()).not.toContain('invisible')
    expect(leftmenu.attributes('inert')).toBeUndefined()
  })
})
