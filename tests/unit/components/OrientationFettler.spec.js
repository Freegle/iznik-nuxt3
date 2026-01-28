import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import OrientationFettler from '~/components/OrientationFettler.vue'

const mockMiscStore = {
  fullscreenModalOpen: false,
  isLandscape: false,
  setLandscape: vi.fn(),
}

vi.mock('~/stores/misc', () => ({
  useMiscStore: () => mockMiscStore,
}))

vi.mock('@capacitor/core', () => ({
  Capacitor: {
    getPlatform: vi.fn().mockReturnValue('web'),
  },
}))

describe('OrientationFettler', () => {
  let mockMatchMedia
  let mediaQueryHandler = null

  beforeEach(() => {
    vi.clearAllMocks()
    mockMiscStore.fullscreenModalOpen = false
    mockMiscStore.isLandscape = false

    mockMatchMedia = {
      matches: false,
      addEventListener: vi.fn((event, handler) => {
        mediaQueryHandler = handler
      }),
      removeEventListener: vi.fn(),
    }

    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(mockMatchMedia))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  function createWrapper() {
    return mount(OrientationFettler)
  }

  describe('rendering', () => {
    it('renders empty span element', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('span').exists()).toBe(true)
      expect(wrapper.find('span').text()).toBe('')
    })
  })

  describe('web platform orientation', () => {
    it('uses matchMedia for orientation detection on web', () => {
      createWrapper()
      expect(window.matchMedia).toHaveBeenCalledWith('(orientation: landscape)')
    })

    it('adds event listener for orientation changes', () => {
      createWrapper()
      expect(mockMatchMedia.addEventListener).toHaveBeenCalledWith(
        'change',
        expect.any(Function)
      )
    })

    it('sets landscape to true when matchMedia matches', () => {
      mockMatchMedia.matches = true
      createWrapper()
      expect(mockMiscStore.setLandscape).toHaveBeenCalledWith(true)
    })

    it('does not update landscape when already false', () => {
      mockMatchMedia.matches = false
      mockMiscStore.isLandscape = false
      createWrapper()
      // Does not call setLandscape because isLandscape is already false
      expect(mockMiscStore.setLandscape).not.toHaveBeenCalled()
    })
  })

  describe('orientation change handling', () => {
    it('updates landscape on orientation change event', () => {
      createWrapper()

      // Simulate orientation change
      if (mediaQueryHandler) {
        mediaQueryHandler({ matches: true })
      }

      expect(mockMiscStore.setLandscape).toHaveBeenCalledWith(true)
    })

    it('does not update orientation when fullscreen modal is open', () => {
      mockMiscStore.fullscreenModalOpen = true
      createWrapper()

      // Simulate orientation change
      if (mediaQueryHandler) {
        mockMiscStore.setLandscape.mockClear()
        mediaQueryHandler({ matches: true })
      }

      expect(mockMiscStore.setLandscape).not.toHaveBeenCalled()
    })

    it('does not update when orientation has not changed', () => {
      mockMiscStore.isLandscape = true
      mockMatchMedia.matches = true
      createWrapper()

      // Clear mock to check for subsequent calls
      mockMiscStore.setLandscape.mockClear()

      if (mediaQueryHandler) {
        mediaQueryHandler({ matches: true })
      }

      expect(mockMiscStore.setLandscape).not.toHaveBeenCalled()
    })
  })

  describe('cleanup on unmount', () => {
    it('removes event listener on unmount', () => {
      const wrapper = createWrapper()
      wrapper.unmount()
      expect(mockMatchMedia.removeEventListener).toHaveBeenCalledWith(
        'change',
        expect.any(Function)
      )
    })
  })
})
