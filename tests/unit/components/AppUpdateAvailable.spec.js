import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import AppUpdateAvailable from '~/components/AppUpdateAvailable.vue'

// Mock mobile store
const mockMobileStore = {
  appupdaterequired: false,
  isiOS: false,
}
vi.mock('~/stores/mobile', () => ({
  useMobileStore: () => mockMobileStore,
}))

describe('AppUpdateAvailable', () => {
  let windowOpenSpy

  beforeEach(() => {
    vi.clearAllMocks()
    mockMobileStore.appupdaterequired = false
    mockMobileStore.isiOS = false
    windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => {})
  })

  afterEach(() => {
    windowOpenSpy.mockRestore()
  })

  function createWrapper() {
    return mount(AppUpdateAvailable, {
      global: {
        stubs: {
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
        },
      },
    })
  }

  describe('rendering', () => {
    it('mounts successfully', () => {
      const wrapper = createWrapper()
      expect(wrapper.exists()).toBe(true)
    })

    it('does not show notice when appupdaterequired is false', () => {
      mockMobileStore.appupdaterequired = false
      const wrapper = createWrapper()
      expect(wrapper.find('.notice-message').exists()).toBe(false)
    })

    it('shows notice when appupdaterequired is true', () => {
      mockMobileStore.appupdaterequired = true
      const wrapper = createWrapper()
      expect(wrapper.find('.notice-message').exists()).toBe(true)
    })

    it('shows danger variant notice', () => {
      mockMobileStore.appupdaterequired = true
      const wrapper = createWrapper()
      expect(wrapper.find('.notice-message').classes()).toContain('danger')
    })
  })

  describe('content', () => {
    beforeEach(() => {
      mockMobileStore.appupdaterequired = true
    })

    it('displays Update Required heading', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Update Required')
    })

    it('displays explanation message', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('new version of the app is required')
    })

    it('displays Update Now button', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Update Now')
    })
  })

  describe('update button', () => {
    beforeEach(() => {
      mockMobileStore.appupdaterequired = true
    })

    it('opens iOS App Store when isiOS is true', async () => {
      mockMobileStore.isiOS = true
      const wrapper = createWrapper()
      const button = wrapper.find('button')
      await button.trigger('click')

      expect(windowOpenSpy).toHaveBeenCalledWith(
        'https://apps.apple.com/gb/app/freegle/id970045029',
        '_blank'
      )
    })

    it('opens Play Store when isiOS is false', async () => {
      mockMobileStore.isiOS = false
      const wrapper = createWrapper()
      const button = wrapper.find('button')
      await button.trigger('click')

      expect(windowOpenSpy).toHaveBeenCalledWith(
        'https://play.google.com/store/apps/details?id=org.ilovefreegle.direct',
        '_blank'
      )
    })
  })

  describe('store dependency', () => {
    it('reacts to appupdaterequired changes', () => {
      mockMobileStore.appupdaterequired = false
      const wrapper = createWrapper()
      expect(wrapper.find('.notice-message').exists()).toBe(false)

      // Change store value and re-mount to simulate reactivity
      mockMobileStore.appupdaterequired = true
      const wrapper2 = createWrapper()
      expect(wrapper2.find('.notice-message').exists()).toBe(true)
    })
  })
})
