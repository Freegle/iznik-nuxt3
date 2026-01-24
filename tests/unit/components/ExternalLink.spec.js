import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ExternalLink from '~/components/ExternalLink.vue'

const { mockOpenUrl } = vi.hoisted(() => ({
  mockOpenUrl: vi.fn(),
}))

vi.mock('~/stores/mobile', () => ({
  useMobileStore: () => ({
    isApp: false,
  }),
}))

vi.mock('@capacitor/app-launcher', () => ({
  AppLauncher: {
    openUrl: mockOpenUrl,
  },
}))

describe('ExternalLink', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function createWrapper(props = {}) {
    return mount(ExternalLink, {
      props: {
        href: 'https://example.com',
        ...props,
      },
      slots: {
        default: 'Click here',
      },
    })
  }

  describe('rendering', () => {
    it('renders anchor element', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('a').exists()).toBe(true)
    })

    it('renders slot content', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toBe('Click here')
    })

    it('sets rel attribute for security', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('a').attributes('rel')).toBe('noopener noreferrer')
    })
  })

  describe('href handling', () => {
    it('passes through https URLs unchanged', () => {
      const wrapper = createWrapper({ href: 'https://example.com' })
      expect(wrapper.find('a').attributes('href')).toBe('https://example.com')
    })

    it('passes through http URLs unchanged', () => {
      const wrapper = createWrapper({ href: 'http://example.com' })
      expect(wrapper.find('a').attributes('href')).toBe('http://example.com')
    })

    it('adds https:// to URLs without protocol', () => {
      const wrapper = createWrapper({ href: 'example.com' })
      expect(wrapper.find('a').attributes('href')).toBe('https://example.com')
    })

    it('passes through mailto URLs unchanged', () => {
      const wrapper = createWrapper({ href: 'mailto:test@example.com' })
      expect(wrapper.find('a').attributes('href')).toBe(
        'mailto:test@example.com'
      )
    })
  })

  describe('target handling', () => {
    it('uses _blank target for regular URLs', () => {
      const wrapper = createWrapper({ href: 'https://example.com' })
      expect(wrapper.find('a').attributes('target')).toBe('_blank')
    })

    it('uses _self target for mailto URLs', () => {
      const wrapper = createWrapper({ href: 'mailto:test@example.com' })
      expect(wrapper.find('a').attributes('target')).toBe('_self')
    })
  })

  describe('computed carefulHref', () => {
    it('prepends https:// to plain domain', () => {
      const wrapper = createWrapper({ href: 'example.com/path' })
      expect(wrapper.vm.carefulHref).toBe('https://example.com/path')
    })

    it('does not modify https URLs', () => {
      const wrapper = createWrapper({ href: 'https://secure.site.com' })
      expect(wrapper.vm.carefulHref).toBe('https://secure.site.com')
    })

    it('does not modify http URLs', () => {
      const wrapper = createWrapper({ href: 'http://insecure.site.com' })
      expect(wrapper.vm.carefulHref).toBe('http://insecure.site.com')
    })
  })

  describe('props', () => {
    it('requires href prop', () => {
      const wrapper = createWrapper({ href: 'https://test.com' })
      expect(wrapper.props('href')).toBe('https://test.com')
    })
  })

  describe('openInBrowser function', () => {
    it('has openInBrowser function', () => {
      const wrapper = createWrapper()
      expect(typeof wrapper.vm.openInBrowser).toBe('function')
    })
  })
})
