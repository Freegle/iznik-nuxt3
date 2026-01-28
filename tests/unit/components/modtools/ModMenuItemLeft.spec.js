import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ModMenuItemLeft from '~/modtools/components/ModMenuItemLeft.vue'

// Mock the auth store
const mockAuthStore = {
  work: {
    pending: 5,
    spam: 2,
    messages: 3,
  },
}

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => mockAuthStore,
}))

// Mock the useModMe composable
const mockCheckWork = vi.fn()
vi.mock('~/composables/useModMe', () => ({
  useModMe: () => ({
    checkWork: mockCheckWork,
  }),
}))

// Mock vue-router
const mockRoute = {
  path: '/modtools/dashboard',
  fullPath: '/modtools/dashboard',
}

const mockRouter = {
  push: vi.fn(),
}

vi.mock('vue-router', () => ({
  useRoute: () => mockRoute,
  useRouter: () => mockRouter,
}))

describe('ModMenuItemLeft', () => {
  function mountModMenuItemLeft(props = {}, routeOverrides = {}) {
    // Update the mock route values before mounting
    Object.assign(mockRoute, {
      path: '/modtools/dashboard',
      fullPath: '/modtools/dashboard',
      ...routeOverrides,
    })

    return mount(ModMenuItemLeft, {
      props: {
        link: '/modtools/dashboard',
        name: 'Dashboard',
        ...props,
      },
      global: {
        stubs: {
          'nuxt-link': {
            template:
              '<a :href="to" @mousedown="$emit(\'mousedown\', $event)"><slot /></a>',
            props: ['to'],
          },
          'b-badge': {
            template: '<span :class="\'badge-\' + variant"><slot /></span>',
            props: ['variant'],
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockAuthStore.work = {
      pending: 5,
      spam: 2,
      messages: 3,
    }
    // Reset route to defaults
    mockRoute.path = '/modtools/dashboard'
    mockRoute.fullPath = '/modtools/dashboard'
  })

  describe('rendering', () => {
    it('renders a link with the correct href', () => {
      const wrapper = mountModMenuItemLeft({ link: '/modtools/members' })
      const link = wrapper.find('a')
      expect(link.attributes('href')).toBe('/modtools/members')
    })

    it('displays the name text', () => {
      const wrapper = mountModMenuItemLeft({ name: 'Members' })
      expect(wrapper.text()).toContain('Members')
    })

    it('applies pl-1 class to container', () => {
      const wrapper = mountModMenuItemLeft()
      expect(wrapper.find('div').classes()).toContain('pl-1')
    })
  })

  describe('active state', () => {
    it('applies active class when route matches link exactly', () => {
      const wrapper = mountModMenuItemLeft(
        { link: '/modtools/dashboard' },
        { path: '/modtools/dashboard' }
      )
      expect(wrapper.find('div').classes()).toContain('active')
    })

    it('applies active class when route starts with link', () => {
      const wrapper = mountModMenuItemLeft(
        { link: '/modtools/members' },
        { path: '/modtools/members/123' }
      )
      expect(wrapper.find('div').classes()).toContain('active')
    })

    it('does not apply active class when route does not match', () => {
      const wrapper = mountModMenuItemLeft(
        { link: '/modtools/members' },
        { path: '/modtools/dashboard' }
      )
      expect(wrapper.find('div').classes()).not.toContain('active')
    })
  })

  describe('indent prop', () => {
    it('does not add pl-3 span when indent is false', () => {
      const wrapper = mountModMenuItemLeft({ indent: false })
      expect(wrapper.find('span.pl-3').exists()).toBe(false)
    })

    it('adds pl-3 span when indent is true', () => {
      const wrapper = mountModMenuItemLeft({ indent: true })
      expect(wrapper.find('span.pl-3').exists()).toBe(true)
    })
  })

  describe('count badges', () => {
    it('shows count badge when count matches work keys', () => {
      const wrapper = mountModMenuItemLeft({
        count: ['pending', 'spam'],
      })
      expect(wrapper.find('.badge-danger').exists()).toBe(true)
      expect(wrapper.text()).toContain('7') // 5 + 2
    })

    it('does not show count badge when count is null', () => {
      const wrapper = mountModMenuItemLeft({ count: null })
      expect(wrapper.find('.badge-danger').exists()).toBe(false)
    })

    it('does not show badge when total is 0', () => {
      mockAuthStore.work = { pending: 0, spam: 0 }
      const wrapper = mountModMenuItemLeft({
        count: ['pending', 'spam'],
      })
      expect(wrapper.find('.badge-danger').exists()).toBe(false)
    })

    it('applies correct variant to count badge', () => {
      const wrapper = mountModMenuItemLeft({
        count: ['pending'],
        countVariant: 'warning',
      })
      expect(wrapper.find('.badge-warning').exists()).toBe(true)
    })
  })

  describe('othercount badges', () => {
    it('shows othercount badge with info variant', () => {
      const wrapper = mountModMenuItemLeft({
        othercount: ['messages'],
      })
      expect(wrapper.find('.badge-info').exists()).toBe(true)
      expect(wrapper.text()).toContain('3')
    })
  })

  describe('click behavior', () => {
    it('calls checkWork when clicking on current route', async () => {
      const wrapper = mountModMenuItemLeft(
        { link: '/modtools/dashboard' },
        { path: '/modtools/dashboard', fullPath: '/modtools/dashboard' }
      )

      const link = wrapper.find('a')
      await link.trigger('mousedown', { button: 0 })

      expect(mockCheckWork).toHaveBeenCalledWith(true)
    })

    it('pushes to router when clicking on different route', async () => {
      const wrapper = mountModMenuItemLeft(
        { link: '/modtools/members' },
        { path: '/modtools/dashboard', fullPath: '/modtools/dashboard' }
      )

      const link = wrapper.find('a')
      await link.trigger('mousedown', { button: 0 })

      expect(mockRouter.push).toHaveBeenCalledWith('/modtools/members')
    })

    it('does not navigate on right click', async () => {
      const wrapper = mountModMenuItemLeft(
        { link: '/modtools/members' },
        { path: '/modtools/dashboard' }
      )

      const link = wrapper.find('a')
      await link.trigger('mousedown', { button: 2 })

      expect(mockRouter.push).not.toHaveBeenCalled()
      expect(mockCheckWork).not.toHaveBeenCalled()
    })
  })

  describe('props validation', () => {
    it('accepts required props', () => {
      const wrapper = mountModMenuItemLeft({
        link: '/test',
        name: 'Test',
      })
      expect(wrapper.props('link')).toBe('/test')
      expect(wrapper.props('name')).toBe('Test')
    })
  })
})
