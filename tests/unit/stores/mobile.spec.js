import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

let mockPlatform = 'web'
vi.mock('@capacitor/core', () => ({
  Capacitor: {
    getPlatform: () => mockPlatform,
    isNativePlatform: () => mockPlatform !== 'web',
  },
}))

const mockChatSend = vi.fn()
const mockChatMarkRead = vi.fn()
const mockConfigFetchv2 = vi.fn()
vi.mock('~/api', () => ({
  default: () => ({
    chat: {
      send: mockChatSend,
      markRead: mockChatMarkRead,
    },
    config: {
      fetchv2: mockConfigFetchv2,
    },
  }),
}))

const mockSavePushId = vi.fn()
const mockClearRelated = vi.fn()
const mockLogout = vi.fn()
const mockLogin = vi.fn()
const mockForget = vi.fn()
let mockAuthUser = null
vi.mock('~/stores/auth', () => ({
  useAuthStore: () => ({
    savePushId: mockSavePushId,
    clearRelated: mockClearRelated,
    logout: mockLogout,
    login: mockLogin,
    forget: mockForget,
    user: mockAuthUser,
    forceLogin: false,
    loggedInEver: false,
  }),
}))

const mockFetchChats = vi.fn()
const mockFetchMessages = vi.fn()
vi.mock('~/stores/chat', () => ({
  useChatStore: () => ({
    fetchChats: mockFetchChats,
    fetchMessages: mockFetchMessages,
  }),
}))

vi.mock('~/stores/notification', () => ({
  useNotificationStore: () => ({
    fetchCount: vi.fn(),
  }),
}))

vi.mock('~/stores/debug', () => ({
  useDebugStore: () => ({
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}))

let mockMobileVersion = '1.0.0'
vi.stubGlobal('useRuntimeConfig', () => ({
  public: { MOBILE_VERSION: mockMobileVersion },
}))

const mockRouterPush = vi.fn()
vi.stubGlobal('useRouter', () => ({
  push: mockRouterPush,
  currentRoute: { path: '/' },
}))

describe('mobile store', () => {
  let useMobileStore

  beforeEach(async () => {
    vi.clearAllMocks()
    mockPlatform = 'web'
    mockAuthUser = null
    mockMobileVersion = '1.0.0'
    setActivePinia(createPinia())
    const mod = await import('~/stores/mobile')
    useMobileStore = mod.useMobileStore
  })

  describe('initial state', () => {
    it('starts with correct defaults', () => {
      const store = useMobileStore()
      expect(store.isApp).toBe(false)
      expect(store.mobileVersion).toBe(false)
      expect(store.deviceinfo).toBeNull()
      expect(store.isiOS).toBe(false)
      expect(store.lastBadgeCount).toBe(-1)
      expect(store.modtools).toBe(false)
      expect(store.inlineReply).toBe(false)
      expect(store.chatid).toBe(false)
      expect(store.pushed).toBe(false)
      expect(store.route).toBe(false)
      expect(store.appupdaterequired).toBe(false)
    })
  })

  describe('init', () => {
    it('detects web platform', () => {
      const store = useMobileStore()
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      mockPlatform = 'web'
      store.init({ public: { MOBILE_VERSION: '1.0.0' } })
      expect(store.isApp).toBe(false)
      expect(store.isiOS).toBe(false)
      logSpy.mockRestore()
    })

    it('detects iOS platform', () => {
      const store = useMobileStore()
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      mockPlatform = 'ios'
      // Mock initApp to avoid Capacitor imports
      store.initApp = vi.fn()
      store.init({ public: { MOBILE_VERSION: '2.0.0' } })
      expect(store.isApp).toBe(true)
      expect(store.isiOS).toBe(true)
      expect(store.mobileVersion).toBe('2.0.0')
      expect(store.initApp).toHaveBeenCalled()
      logSpy.mockRestore()
    })

    it('detects Android platform', () => {
      const store = useMobileStore()
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      mockPlatform = 'android'
      store.initApp = vi.fn()
      store.init({ public: { MOBILE_VERSION: '2.0.0' } })
      expect(store.isApp).toBe(true)
      expect(store.isiOS).toBe(false)
      logSpy.mockRestore()
    })
  })

  describe('extractQueryStringParams', () => {
    it('parses query string parameters', () => {
      const store = useMobileStore()
      const result = store.extractQueryStringParams(
        'https://example.com/path?u=123&k=abc'
      )
      expect(result).toEqual({ u: '123', k: 'abc' })
    })

    it('decodes URL-encoded values', () => {
      const store = useMobileStore()
      const result = store.extractQueryStringParams(
        'https://example.com?name=hello+world&email=a%40b.com'
      )
      expect(result.name).toBe('hello world')
      expect(result.email).toBe('a@b.com')
    })

    it('replaces dots with underscores in keys', () => {
      const store = useMobileStore()
      const result = store.extractQueryStringParams(
        'https://example.com?my.key=value'
      )
      expect(result.my_key).toBe('value')
    })

    it('returns false when no query string', () => {
      const store = useMobileStore()
      const result = store.extractQueryStringParams(
        'https://example.com/path'
      )
      expect(result).toBe(false)
    })

    it('handles empty query string', () => {
      const store = useMobileStore()
      const result = store.extractQueryStringParams(
        'https://example.com?'
      )
      expect(result).toEqual({})
    })

    it('handles params without values', () => {
      const store = useMobileStore()
      const result = store.extractQueryStringParams(
        'https://example.com?flag&key=val'
      )
      expect(result.flag).toBe('')
      expect(result.key).toBe('val')
    })
  })

  describe('versionOutOfDate', () => {
    it('returns true when required version is higher', () => {
      const store = useMobileStore()
      mockMobileVersion = '1.0.0'
      expect(store.versionOutOfDate('2.0.0')).toBe(true)
    })

    it('returns false when versions are equal', () => {
      const store = useMobileStore()
      mockMobileVersion = '1.0.0'
      expect(store.versionOutOfDate('1.0.0')).toBe(false)
    })

    it('returns false when current version is higher', () => {
      const store = useMobileStore()
      mockMobileVersion = '2.0.0'
      expect(store.versionOutOfDate('1.0.0')).toBe(false)
    })

    it('compares minor versions correctly', () => {
      const store = useMobileStore()
      mockMobileVersion = '1.2.0'
      expect(store.versionOutOfDate('1.3.0')).toBe(true)
    })

    it('compares patch versions correctly', () => {
      const store = useMobileStore()
      mockMobileVersion = '1.0.1'
      expect(store.versionOutOfDate('1.0.2')).toBe(true)
    })

    it('handles higher major but lower minor', () => {
      const store = useMobileStore()
      mockMobileVersion = '2.5.0'
      expect(store.versionOutOfDate('1.9.9')).toBe(false)
    })

    it('returns false for null/empty version', () => {
      const store = useMobileStore()
      expect(store.versionOutOfDate(null)).toBe(false)
      expect(store.versionOutOfDate('')).toBe(false)
    })
  })

  describe('setBadgeCount', () => {
    it('skips when not an app', async () => {
      const store = useMobileStore()
      store.isApp = false
      const mockBadge = { set: vi.fn() }
      await store.setBadgeCount(5, mockBadge)
      expect(mockBadge.set).not.toHaveBeenCalled()
    })

    it('sets badge when count changes', async () => {
      const store = useMobileStore()
      store.isApp = true
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      const mockBadge = { set: vi.fn() }
      await store.setBadgeCount(5, mockBadge)
      expect(mockBadge.set).toHaveBeenCalledWith({ count: 5 })
      expect(store.lastBadgeCount).toBe(5)
      logSpy.mockRestore()
    })

    it('skips when count is same as last', async () => {
      const store = useMobileStore()
      store.isApp = true
      store.lastBadgeCount = 5
      const mockBadge = { set: vi.fn() }
      await store.setBadgeCount(5, mockBadge)
      expect(mockBadge.set).not.toHaveBeenCalled()
    })

    it('treats NaN as 0', async () => {
      const store = useMobileStore()
      store.isApp = true
      store.lastBadgeCount = 5
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      const mockBadge = { set: vi.fn() }
      await store.setBadgeCount(NaN, mockBadge)
      expect(mockBadge.set).toHaveBeenCalledWith({ count: 0 })
      logSpy.mockRestore()
    })
  })

  describe('handleNotification', () => {
    let store

    beforeEach(() => {
      store = useMobileStore()
      store.isApp = true
      store.config = { public: {} }
    })

    it('returns early when notification is null', async () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      await store.handleNotification(null, {}, {})
      expect(errorSpy).toHaveBeenCalled()
      errorSpy.mockRestore()
      logSpy.mockRestore()
    })

    it('returns early when notification.data is missing', async () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      await store.handleNotification({}, {}, {})
      expect(errorSpy).toHaveBeenCalled()
      errorSpy.mockRestore()
      logSpy.mockRestore()
    })

    it('ignores legacy notifications without channel_id', async () => {
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      await store.handleNotification(
        { data: { route: '/chats/1' } },
        {},
        {}
      )
      expect(store.route).toBe(false)
      logSpy.mockRestore()
    })

    it('sets modtools flag from notification data', async () => {
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      // Mock App import
      vi.mock('@capacitor/app', () => ({
        App: { getState: () => Promise.resolve({ isActive: false }) },
      }))

      await store.handleNotification(
        {
          data: {
            channel_id: 'chat_messages',
            modtools: '1',
            badge: '3',
            route: '/chats/1',
          },
        },
        {},
        { set: vi.fn() }
      )
      expect(store.modtools).toBe(true)
      logSpy.mockRestore()
    })

    it('refreshes chats on foreground push', async () => {
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      await store.handleNotification(
        {
          data: {
            channel_id: 'chat_messages',
            foreground: true,
            badge: '0',
            modtools: '0',
            chatids: '42',
          },
        },
        {},
        { set: vi.fn() }
      )
      expect(mockFetchChats).toHaveBeenCalledWith(null, false)
      expect(mockFetchMessages).toHaveBeenCalledWith(42)
      logSpy.mockRestore()
    })
  })

  describe('handleReplyAction', () => {
    it('sends reply via API', async () => {
      const store = useMobileStore()
      store.config = { public: {} }
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      mockChatSend.mockResolvedValue({})

      await store.handleReplyAction(
        { data: { chatids: '42' } },
        'Hello!'
      )

      expect(mockChatSend).toHaveBeenCalledWith({
        roomid: 42,
        message: 'Hello!',
      })
      logSpy.mockRestore()
    })

    it('does nothing when no notification data', async () => {
      const store = useMobileStore()
      store.config = { public: {} }
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await store.handleReplyAction(null, 'Hello!')
      expect(mockChatSend).not.toHaveBeenCalled()

      logSpy.mockRestore()
      errorSpy.mockRestore()
    })

    it('does nothing when no chat ID', async () => {
      const store = useMobileStore()
      store.config = { public: {} }
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await store.handleReplyAction({ data: {} }, 'Hello!')
      expect(mockChatSend).not.toHaveBeenCalled()

      logSpy.mockRestore()
      errorSpy.mockRestore()
    })
  })

  describe('handleMarkReadAction', () => {
    it('marks chat as read via API', async () => {
      const store = useMobileStore()
      store.isApp = true
      store.config = { public: {} }
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      mockChatMarkRead.mockResolvedValue({})

      // Mock Badge import
      vi.doMock('@capawesome/capacitor-badge', () => ({
        Badge: { set: vi.fn() },
      }))

      await store.handleMarkReadAction({
        data: { chatids: '42', messageid: '999', badge: '3' },
      })

      expect(mockChatMarkRead).toHaveBeenCalledWith(42, 999, false)
      logSpy.mockRestore()
    })

    it('does nothing when no notification data', async () => {
      const store = useMobileStore()
      store.config = { public: {} }
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await store.handleMarkReadAction(null)
      expect(mockChatMarkRead).not.toHaveBeenCalled()

      logSpy.mockRestore()
      errorSpy.mockRestore()
    })

    it('does nothing when no message ID', async () => {
      const store = useMobileStore()
      store.config = { public: {} }
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await store.handleMarkReadAction({
        data: { chatids: '42' },
      })
      expect(mockChatMarkRead).not.toHaveBeenCalled()

      logSpy.mockRestore()
      errorSpy.mockRestore()
    })
  })

  describe('checkForAppUpdate', () => {
    it('sets appupdaterequired when version is outdated', async () => {
      const store = useMobileStore()
      store.config = { public: {} }
      store.isiOS = false
      mockMobileVersion = '1.0.0'
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      mockConfigFetchv2.mockResolvedValue([{ value: '2.0.0' }])

      await store.checkForAppUpdate()
      expect(store.appupdaterequired).toBe(true)
      expect(store.apprequiredversion).toBe('2.0.0')
      logSpy.mockRestore()
    })

    it('does not set appupdaterequired when version is current', async () => {
      const store = useMobileStore()
      store.config = { public: {} }
      store.isiOS = false
      mockMobileVersion = '2.0.0'

      mockConfigFetchv2.mockResolvedValue([{ value: '1.0.0' }])

      await store.checkForAppUpdate()
      expect(store.appupdaterequired).toBe(false)
    })

    it('uses iOS key when on iOS', async () => {
      const store = useMobileStore()
      store.config = { public: {} }
      store.isiOS = true

      mockConfigFetchv2.mockResolvedValue([{ value: '1.0.0' }])

      await store.checkForAppUpdate()
      expect(mockConfigFetchv2).toHaveBeenCalledWith(
        'app_fd_version_ios_required'
      )
    })

    it('uses Android key when not iOS', async () => {
      const store = useMobileStore()
      store.config = { public: {} }
      store.isiOS = false

      mockConfigFetchv2.mockResolvedValue([{ value: '1.0.0' }])

      await store.checkForAppUpdate()
      expect(mockConfigFetchv2).toHaveBeenCalledWith(
        'app_fd_version_android_required'
      )
    })

    it('handles empty API response', async () => {
      const store = useMobileStore()
      store.config = { public: {} }
      store.isiOS = false

      mockConfigFetchv2.mockResolvedValue(null)

      await store.checkForAppUpdate()
      expect(store.appupdaterequired).toBe(false)
    })
  })

  describe('getDeviceInfo', () => {
    it('builds device info string', async () => {
      const store = useMobileStore()
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      const mockDevice = {
        getInfo: vi.fn().mockResolvedValue({
          manufacturer: 'Samsung',
          model: 'Galaxy S21',
          platform: 'android',
          osVersion: '13',
          webViewVersion: '120.0',
        }),
        getId: vi.fn().mockResolvedValue({ identifier: 'device-123' }),
      }

      await store.getDeviceInfo(mockDevice)

      expect(store.deviceuserinfo).toBe(
        'Samsung Galaxy S21 android 13 WebView 120.0'
      )
      expect(store.devicePersistentId).toBe('device-123')
      expect(store.isiOS).toBe(false)
      expect(store.osVersion).toBe('13')
      logSpy.mockRestore()
    })

    it('skips duplicate webViewVersion when same as osVersion', async () => {
      const store = useMobileStore()
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      const mockDevice = {
        getInfo: vi.fn().mockResolvedValue({
          manufacturer: 'Apple',
          model: 'iPhone',
          platform: 'ios',
          osVersion: '17.0',
          webViewVersion: '17.0',
        }),
        getId: vi.fn().mockResolvedValue({ identifier: 'ios-456' }),
      }

      await store.getDeviceInfo(mockDevice)

      expect(store.deviceuserinfo).toBe('Apple iPhone ios 17.0')
      expect(store.isiOS).toBe(true)
      logSpy.mockRestore()
    })

    it('handles missing optional fields', async () => {
      const store = useMobileStore()
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      const mockDevice = {
        getInfo: vi.fn().mockResolvedValue({
          platform: 'android',
          osVersion: '13',
        }),
        getId: vi.fn().mockResolvedValue({ identifier: 'dev-789' }),
      }

      await store.getDeviceInfo(mockDevice)

      expect(store.deviceuserinfo).toBe('android 13')
      logSpy.mockRestore()
    })
  })
})
