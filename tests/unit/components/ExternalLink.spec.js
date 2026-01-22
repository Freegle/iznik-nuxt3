import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ExternalLink from '~/components/ExternalLink.vue'

// Mock mobile store
const mockMobileStore = {
  isApp: false,
}

vi.mock('~/stores/mobile', () => ({
  useMobileStore: () => mockMobileStore,
}))

// Mock AppLauncher
const mockOpenUrl = vi.fn()
vi.mock('@capacitor/app-launcher', () => ({
  AppLauncher: {
    openUrl: (...args) => mockOpenUrl(...args),
  },
}))

describe('ExternalLink', () => {
  function mountExternalLink(href, slotContent = 'Link text') {
    return mount(ExternalLink, {
      props: { href },
      slots: { default: slotContent },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockMobileStore.isApp = false
  })

  describe('rendering', () => {
    it('renders an anchor element', () => {
      const wrapper = mountExternalLink('https://example.com')
      expect(wrapper.find('a').exists()).toBe(true)
    })

    it('renders slot content', () => {
      const wrapper = mountExternalLink('https://example.com', 'Click me')
      expect(wrapper.text()).toBe('Click me')
    })

    it('always has rel="noopener noreferrer" for security', () => {
      const wrapper = mountExternalLink('https://example.com')
      expect(wrapper.find('a').attributes('rel')).toBe('noopener noreferrer')
    })
  })

  describe('carefulHref computed property', () => {
    it('passes through URLs starting with http', () => {
      const wrapper = mountExternalLink('http://example.com')
      expect(wrapper.find('a').attributes('href')).toBe('http://example.com')
    })

    it('passes through URLs starting with https', () => {
      const wrapper = mountExternalLink('https://example.com')
      expect(wrapper.find('a').attributes('href')).toBe('https://example.com')
    })

    it('passes through mailto links unchanged', () => {
      const wrapper = mountExternalLink('mailto:test@example.com')
      expect(wrapper.find('a').attributes('href')).toBe(
        'mailto:test@example.com'
      )
    })

    it('prepends https:// to bare domain names', () => {
      const wrapper = mountExternalLink('example.com')
      expect(wrapper.find('a').attributes('href')).toBe('https://example.com')
    })

    it('prepends https:// to domain with path', () => {
      const wrapper = mountExternalLink('example.com/page')
      expect(wrapper.find('a').attributes('href')).toBe(
        'https://example.com/page'
      )
    })

    it('handles URL with subdomain', () => {
      const wrapper = mountExternalLink('www.example.com')
      expect(wrapper.find('a').attributes('href')).toBe(
        'https://www.example.com'
      )
    })
  })

  describe('target computed property', () => {
    it('returns _blank for regular URLs to open in new tab', () => {
      const wrapper = mountExternalLink('https://example.com')
      expect(wrapper.find('a').attributes('target')).toBe('_blank')
    })

    it('returns _blank for bare domains', () => {
      const wrapper = mountExternalLink('example.com')
      expect(wrapper.find('a').attributes('target')).toBe('_blank')
    })

    it('returns _self for mailto links to open in same window', () => {
      const wrapper = mountExternalLink('mailto:test@example.com')
      expect(wrapper.find('a').attributes('target')).toBe('_self')
    })
  })

  describe('edge cases', () => {
    it('handles null href gracefully via optional chaining', () => {
      // The component uses optional chaining, so null/undefined won't crash
      // but will result in 'https://null' or similar - testing the behavior
      const wrapper = mount(ExternalLink, {
        props: { href: '' },
        slots: { default: 'Link' },
      })
      // Empty string doesn't start with http or mailto, so gets https:// prepended
      expect(wrapper.find('a').attributes('href')).toBe('https://')
    })
  })

  describe('openInBrowser for mobile app', () => {
    it('does nothing special when not in app mode', async () => {
      mockMobileStore.isApp = false
      const wrapper = mountExternalLink('https://example.com')
      await wrapper.find('a').trigger('click')
      expect(mockOpenUrl).not.toHaveBeenCalled()
    })

    it('opens URL with AppLauncher when in app mode', async () => {
      mockMobileStore.isApp = true
      const wrapper = mountExternalLink('https://example.com')
      await wrapper.find('a').trigger('click')
      expect(mockOpenUrl).toHaveBeenCalledWith({ url: 'https://example.com' })
    })

    it('uses carefulHref (with https:// added) when opening in app', async () => {
      mockMobileStore.isApp = true
      const wrapper = mountExternalLink('example.com')
      await wrapper.find('a').trigger('click')
      expect(mockOpenUrl).toHaveBeenCalledWith({ url: 'https://example.com' })
    })
  })
})
