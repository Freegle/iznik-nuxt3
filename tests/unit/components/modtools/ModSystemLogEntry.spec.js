import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ModSystemLogEntry from '~/modtools/components/ModSystemLogEntry.vue'

// Mock useSystemLogFormatter composable
vi.mock('~/modtools/composables/useSystemLogFormatter', () => ({
  formatLogText: vi.fn(
    (log) => `Formatted: ${log.text || log.type || 'action'}`
  ),
  getLogLevelClass: vi.fn((log) => {
    if (log.level === 'error') return 'text-danger'
    if (log.level === 'warn') return 'text-warning'
    return ''
  }),
  getLogSourceVariant: vi.fn((source) => {
    const variants = {
      api: 'info',
      client: 'primary',
      email: 'success',
      logs_table: 'secondary',
    }
    return variants[source] || 'light'
  }),
  formatLogTimestamp: vi.fn((timestamp, format) => {
    if (!timestamp) return ''
    if (format === 'short') return '10:30:00.123'
    if (format === 'full') return '15/01/2024, 10:30:00'
    return timestamp
  }),
  parseLaravelLogLevel: vi.fn((log) => {
    if (log.source !== 'laravel-batch') return null
    return { level: 'INFO', variant: 'info' }
  }),
}))

// Mock user store
const mockUserStore = {
  list: {},
  fetch: vi.fn(),
}

vi.mock('~/stores/user', () => ({
  useUserStore: () => mockUserStore,
}))

// Mock group store
const mockGroupStore = {
  list: {},
  fetch: vi.fn(),
}

vi.mock('~/stores/group', () => ({
  useGroupStore: () => mockGroupStore,
}))

// Mock api
vi.mock('~/api', () => ({
  default: () => ({
    systemlogs: {
      fetchHeadersByRequestId: vi.fn().mockResolvedValue({ logs: [] }),
      fetchHeadersByTimestamp: vi.fn().mockResolvedValue({ logs: [] }),
    },
  }),
}))

// Mock useRuntimeConfig
vi.stubGlobal('useRuntimeConfig', () => ({
  public: {
    APIv2: '/apiv2',
  },
}))

describe('ModSystemLogEntry', () => {
  const createLog = (overrides = {}) => ({
    id: 1,
    timestamp: '2024-01-15T10:30:00.123Z',
    source: 'api',
    type: 'User',
    subtype: 'Login',
    text: 'Logged in via email',
    user_id: null,
    byuser_id: null,
    group_id: null,
    message_id: null,
    trace_id: null,
    session_id: null,
    level: 'info',
    raw: {},
    ...overrides,
  })

  function mountComponent(props = {}) {
    return mount(ModSystemLogEntry, {
      props: {
        log: createLog(),
        ...props,
      },
      global: {
        stubs: {
          'b-badge': {
            template: '<span class="badge" :class="variant"><slot /></span>',
            props: ['variant'],
          },
          'b-modal': {
            template: '<div v-if="modelValue" class="modal"><slot /></div>',
            props: ['modelValue', 'title', 'size', 'hideFooter', 'scrollable'],
          },
          'b-button': {
            template:
              '<button :variant="variant" :size="size" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant', 'size'],
          },
          'v-icon': {
            template: '<span class="icon" :class="icon" />',
            props: ['icon', 'scale'],
          },
          ProfileImage: {
            template: '<img class="profile-image" />',
            props: ['image', 'name', 'size', 'isThumbnail'],
          },
          ExternalLink: {
            template: '<a :href="href" class="external-link"><slot /></a>',
            props: ['href', 'title'],
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockUserStore.list = {}
    mockGroupStore.list = {}
  })

  describe('rendering', () => {
    it('renders log entry container', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.log-entry').exists()).toBe(true)
    })

    it('renders timestamp', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.timestamp').exists()).toBe(true)
      expect(wrapper.text()).toContain('10:30:00.123')
    })

    it('renders source badge', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.source-badge').exists()).toBe(true)
      expect(wrapper.text()).toContain('API')
    })

    it('renders action text', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.action-text').exists()).toBe(true)
    })

    it('renders details button', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.details-btn').exists()).toBe(true)
    })
  })

  describe('props', () => {
    it('accepts log prop', () => {
      const log = createLog({ id: 123 })
      const wrapper = mountComponent({ log })
      expect(wrapper.props('log').id).toBe(123)
    })

    it('accepts count prop with default 1', () => {
      const wrapper = mountComponent()
      expect(wrapper.props('count')).toBe(1)
    })

    it('accepts count prop', () => {
      const wrapper = mountComponent({ count: 5 })
      expect(wrapper.props('count')).toBe(5)
    })

    it('accepts firstTimestamp prop', () => {
      const wrapper = mountComponent({
        firstTimestamp: '2024-01-15T10:00:00Z',
      })
      expect(wrapper.props('firstTimestamp')).toBe('2024-01-15T10:00:00Z')
    })

    it('accepts lastTimestamp prop', () => {
      const wrapper = mountComponent({
        lastTimestamp: '2024-01-15T10:30:00Z',
      })
      expect(wrapper.props('lastTimestamp')).toBe('2024-01-15T10:30:00Z')
    })

    it('accepts entries prop', () => {
      const entries = [{ id: 1 }, { id: 2 }]
      const wrapper = mountComponent({ entries })
      expect(wrapper.props('entries')).toEqual(entries)
    })

    it('accepts hideUserColumn prop with default false', () => {
      const wrapper = mountComponent()
      expect(wrapper.props('hideUserColumn')).toBe(false)
    })

    it('accepts hideUserColumn prop', () => {
      const wrapper = mountComponent({ hideUserColumn: true })
      expect(wrapper.props('hideUserColumn')).toBe(true)
    })
  })

  describe('sourceLabel computed', () => {
    it('returns API for api source', () => {
      const wrapper = mountComponent({ log: createLog({ source: 'api' }) })
      expect(wrapper.vm.sourceLabel).toBe('API')
    })

    it('returns User for client source', () => {
      const wrapper = mountComponent({ log: createLog({ source: 'client' }) })
      expect(wrapper.vm.sourceLabel).toBe('User')
    })

    it('returns Email for email source', () => {
      const wrapper = mountComponent({ log: createLog({ source: 'email' }) })
      expect(wrapper.vm.sourceLabel).toBe('Email')
    })

    it('returns Email for laravel-batch source', () => {
      const wrapper = mountComponent({
        log: createLog({ source: 'laravel-batch' }),
      })
      expect(wrapper.vm.sourceLabel).toBe('Email')
    })

    it('returns User for logs_table when same user', () => {
      const wrapper = mountComponent({
        log: createLog({
          source: 'logs_table',
          user_id: 123,
          byuser_id: 123,
        }),
      })
      expect(wrapper.vm.sourceLabel).toBe('User')
    })

    it('returns Mod for logs_table when different users', () => {
      const wrapper = mountComponent({
        log: createLog({
          source: 'logs_table',
          user_id: 123,
          byuser_id: 456,
        }),
      })
      expect(wrapper.vm.sourceLabel).toBe('Mod')
    })

    it('returns source as-is for unknown sources', () => {
      const wrapper = mountComponent({
        log: createLog({ source: 'unknown_source' }),
      })
      expect(wrapper.vm.sourceLabel).toBe('unknown_source')
    })
  })

  describe('sourceVariant computed', () => {
    it('returns primary for user action in logs_table', () => {
      const wrapper = mountComponent({
        log: createLog({
          source: 'logs_table',
          user_id: 123,
          byuser_id: 123,
        }),
      })
      expect(wrapper.vm.sourceVariant).toBe('primary')
    })

    it('returns secondary for mod action in logs_table', () => {
      const wrapper = mountComponent({
        log: createLog({
          source: 'logs_table',
          user_id: 123,
          byuser_id: 456,
        }),
      })
      expect(wrapper.vm.sourceVariant).toBe('secondary')
    })

    it('returns success for laravel-batch source', () => {
      const wrapper = mountComponent({
        log: createLog({ source: 'laravel-batch' }),
      })
      expect(wrapper.vm.sourceVariant).toBe('success')
    })

    it('uses getLogSourceVariant for other sources', () => {
      const wrapper = mountComponent({ log: createLog({ source: 'api' }) })
      expect(wrapper.vm.sourceVariant).toBe('info')
    })
  })

  describe('entryClass computed', () => {
    it('returns log-error for API 5xx status', () => {
      const wrapper = mountComponent({
        log: createLog({
          source: 'api',
          raw: { status_code: 500 },
        }),
      })
      expect(wrapper.vm.entryClass).toContain('log-error')
    })

    it('does not return log-error for API 4xx status', () => {
      const wrapper = mountComponent({
        log: createLog({
          source: 'api',
          raw: { status_code: 400 },
        }),
      })
      expect(wrapper.vm.entryClass).not.toContain('log-error')
    })

    it('returns log-error for error level non-API logs', () => {
      const wrapper = mountComponent({
        log: createLog({
          source: 'client',
          level: 'error',
        }),
      })
      expect(wrapper.vm.entryClass).toContain('log-error')
    })

    it('returns log-warn for warn level non-API logs', () => {
      const wrapper = mountComponent({
        log: createLog({
          source: 'client',
          level: 'warn',
        }),
      })
      expect(wrapper.vm.entryClass).toContain('log-warn')
    })

    it('returns empty for normal logs', () => {
      const wrapper = mountComponent({
        log: createLog({
          source: 'api',
          raw: { status_code: 200 },
        }),
      })
      expect(wrapper.vm.entryClass).toEqual([])
    })
  })

  describe('rawApiCall computed', () => {
    it('returns null for non-api source', () => {
      const wrapper = mountComponent({
        log: createLog({ source: 'client' }),
      })
      expect(wrapper.vm.rawApiCall).toBeNull()
    })

    it('returns formatted API call for v1 API', () => {
      const wrapper = mountComponent({
        log: createLog({
          source: 'api',
          raw: { method: 'GET', call: 'user' },
        }),
      })
      expect(wrapper.vm.rawApiCall).toBe('GET /api/user')
    })

    it('returns formatted API call for v2 API', () => {
      const wrapper = mountComponent({
        log: createLog({
          source: 'api',
          raw: { method: 'POST', path: '/apiv2/message' },
        }),
      })
      expect(wrapper.vm.rawApiCall).toBe('POST /apiv2/message')
    })

    it('returns null when no endpoint info', () => {
      const wrapper = mountComponent({
        log: createLog({
          source: 'api',
          raw: { method: 'GET' },
        }),
      })
      expect(wrapper.vm.rawApiCall).toBeNull()
    })
  })

  describe('duration computed', () => {
    it('extracts duration from action text', () => {
      const wrapper = mountComponent({
        log: createLog({ text: 'API call (250ms)' }),
      })
      expect(wrapper.vm.duration).toBe('250ms')
    })

    it('returns duration from raw data', () => {
      const wrapper = mountComponent({
        log: createLog({
          text: 'API call',
          raw: { duration_ms: 150.5 },
        }),
      })
      expect(wrapper.vm.duration).toBe('151ms')
    })

    it('returns null when no duration', () => {
      const wrapper = mountComponent({
        log: createLog({ text: 'Simple action' }),
      })
      expect(wrapper.vm.duration).toBeNull()
    })
  })

  describe('ipAddress computed', () => {
    it('returns ip from raw.ip', () => {
      const wrapper = mountComponent({
        log: createLog({ raw: { ip: '192.168.1.1' } }),
      })
      expect(wrapper.vm.ipAddress).toBe('192.168.1.1')
    })

    it('returns ip from raw.ip_address', () => {
      const wrapper = mountComponent({
        log: createLog({ raw: { ip_address: '10.0.0.1' } }),
      })
      expect(wrapper.vm.ipAddress).toBe('10.0.0.1')
    })

    it('returns ip from raw.client_ip', () => {
      const wrapper = mountComponent({
        log: createLog({ raw: { client_ip: '172.16.0.1' } }),
      })
      expect(wrapper.vm.ipAddress).toBe('172.16.0.1')
    })

    it('returns null for placeholder 0.0.0.0', () => {
      const wrapper = mountComponent({
        log: createLog({ raw: { ip: '0.0.0.0' } }),
      })
      expect(wrapper.vm.ipAddress).toBeNull()
    })

    it('returns null for placeholder ::', () => {
      const wrapper = mountComponent({
        log: createLog({ raw: { ip: '::' } }),
      })
      expect(wrapper.vm.ipAddress).toBeNull()
    })

    it('returns null when no ip', () => {
      const wrapper = mountComponent({
        log: createLog({ raw: {} }),
      })
      expect(wrapper.vm.ipAddress).toBeNull()
    })
  })

  describe('sessionUrl computed', () => {
    it('returns url from raw data', () => {
      const wrapper = mountComponent({
        log: createLog({ raw: { url: 'https://www.ilovefreegle.org/give' } }),
      })
      expect(wrapper.vm.sessionUrl).toBe('https://www.ilovefreegle.org/give')
    })

    it('returns null when no url', () => {
      const wrapper = mountComponent({
        log: createLog({ raw: {} }),
      })
      expect(wrapper.vm.sessionUrl).toBeNull()
    })
  })

  describe('sessionUrlDisplay computed', () => {
    it('returns pathname and search from URL', () => {
      const wrapper = mountComponent({
        log: createLog({
          raw: { url: 'https://www.ilovefreegle.org/give?type=offer' },
        }),
      })
      expect(wrapper.vm.sessionUrlDisplay).toBe('/give?type=offer')
    })

    it('truncates long paths', () => {
      const longPath =
        '/very/long/path/that/exceeds/fifty/characters/limit/test/more'
      const wrapper = mountComponent({
        log: createLog({
          raw: { url: `https://example.com${longPath}` },
        }),
      })
      expect(wrapper.vm.sessionUrlDisplay.length).toBeLessThanOrEqual(50)
      expect(wrapper.vm.sessionUrlDisplay).toContain('...')
    })

    it('returns null when no sessionUrl', () => {
      const wrapper = mountComponent({
        log: createLog({ raw: {} }),
      })
      expect(wrapper.vm.sessionUrlDisplay).toBeNull()
    })
  })

  describe('messageSubject computed', () => {
    it('returns subject from raw.message', () => {
      const wrapper = mountComponent({
        log: createLog({
          raw: { message: { subject: 'OFFER: Chair' } },
        }),
      })
      expect(wrapper.vm.messageSubject).toBe('OFFER: Chair')
    })

    it('returns subject from raw.subject', () => {
      const wrapper = mountComponent({
        log: createLog({ raw: { subject: 'WANTED: Table' } }),
      })
      expect(wrapper.vm.messageSubject).toBe('WANTED: Table')
    })

    it('returns null when no subject', () => {
      const wrapper = mountComponent({
        log: createLog({ raw: {} }),
      })
      expect(wrapper.vm.messageSubject).toBeNull()
    })
  })

  describe('queryParams computed', () => {
    it('returns query_params from raw', () => {
      const params = { type: 'Offer', limit: 10 }
      const wrapper = mountComponent({
        log: createLog({ raw: { query_params: params } }),
      })
      expect(wrapper.vm.queryParams).toEqual(params)
    })

    it('returns null when no query_params', () => {
      const wrapper = mountComponent({
        log: createLog({ raw: {} }),
      })
      expect(wrapper.vm.queryParams).toBeNull()
    })
  })

  describe('requestBody computed', () => {
    it('returns request_body from raw', () => {
      const body = { name: 'Test', email: 'test@example.com' }
      const wrapper = mountComponent({
        log: createLog({ raw: { request_body: body } }),
      })
      expect(wrapper.vm.requestBody).toEqual(body)
    })

    it('returns null when no request_body', () => {
      const wrapper = mountComponent({
        log: createLog({ raw: {} }),
      })
      expect(wrapper.vm.requestBody).toBeNull()
    })
  })

  describe('responseBody computed', () => {
    it('returns response_body from raw', () => {
      const body = { ret: 0, status: 'success' }
      const wrapper = mountComponent({
        log: createLog({ raw: { response_body: body } }),
      })
      expect(wrapper.vm.responseBody).toEqual(body)
    })

    it('returns null when no response_body', () => {
      const wrapper = mountComponent({
        log: createLog({ raw: {} }),
      })
      expect(wrapper.vm.responseBody).toBeNull()
    })
  })

  describe('isApiLog computed', () => {
    it('returns true for api source', () => {
      const wrapper = mountComponent({
        log: createLog({ source: 'api' }),
      })
      expect(wrapper.vm.isApiLog).toBe(true)
    })

    it('returns false for non-api source', () => {
      const wrapper = mountComponent({
        log: createLog({ source: 'client' }),
      })
      expect(wrapper.vm.isApiLog).toBe(false)
    })
  })

  describe('requestId computed', () => {
    it('returns request_id from raw', () => {
      const wrapper = mountComponent({
        log: createLog({ raw: { request_id: 'abc123' } }),
      })
      expect(wrapper.vm.requestId).toBe('abc123')
    })

    it('returns null when no request_id', () => {
      const wrapper = mountComponent({
        log: createLog({ raw: {} }),
      })
      expect(wrapper.vm.requestId).toBeNull()
    })
  })

  describe('deviceInfo computed', () => {
    it('detects Chrome browser', () => {
      const wrapper = mountComponent({
        log: createLog({
          raw: {
            user_agent:
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
          },
        }),
      })
      expect(wrapper.vm.deviceInfo.browser).toBe('Chrome')
    })

    it('detects Firefox browser', () => {
      const wrapper = mountComponent({
        log: createLog({
          raw: { user_agent: 'Mozilla/5.0 Firefox/121.0' },
        }),
      })
      expect(wrapper.vm.deviceInfo.browser).toBe('Firefox')
    })

    it('detects Safari browser', () => {
      const wrapper = mountComponent({
        log: createLog({
          raw: {
            user_agent:
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15',
          },
        }),
      })
      expect(wrapper.vm.deviceInfo.browser).toBe('Safari')
    })

    it('detects Edge browser', () => {
      const wrapper = mountComponent({
        log: createLog({
          raw: { user_agent: 'Mozilla/5.0 Edg/120.0.0.0' },
        }),
      })
      expect(wrapper.vm.deviceInfo.browser).toBe('Edge')
    })

    it('detects mobile device', () => {
      const wrapper = mountComponent({
        log: createLog({
          raw: {
            user_agent:
              'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',
          },
        }),
      })
      expect(wrapper.vm.deviceInfo.type).toBe('mobile')
    })

    it('detects tablet device', () => {
      const wrapper = mountComponent({
        log: createLog({
          raw: {
            user_agent:
              'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
          },
        }),
      })
      expect(wrapper.vm.deviceInfo.type).toBe('tablet')
    })

    it('detects desktop by default', () => {
      const wrapper = mountComponent({
        log: createLog({
          raw: {
            user_agent:
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0',
          },
        }),
      })
      expect(wrapper.vm.deviceInfo.type).toBe('desktop')
    })

    it('includes screen size when available', () => {
      const wrapper = mountComponent({
        log: createLog({
          raw: {
            user_agent: 'Mozilla/5.0 Chrome/120.0',
            viewport_width: 1920,
            viewport_height: 1080,
          },
        }),
      })
      // Component uses multiplication sign (×) not x
      expect(wrapper.vm.deviceInfo.screenSize).toBe('1920×1080')
    })

    it('detects app info', () => {
      const wrapper = mountComponent({
        log: createLog({
          raw: {
            user_agent: 'Mozilla/5.0',
            app_platform: 'ios',
            app_model: 'iPhone 15',
            app_manufacturer: 'Apple',
            app_version: '2.1.0',
          },
        }),
      })
      expect(wrapper.vm.deviceInfo.isApp).toBe(true)
      expect(wrapper.vm.deviceInfo.appPlatform).toBe('ios')
      expect(wrapper.vm.deviceInfo.appModel).toBe('iPhone 15')
      expect(wrapper.vm.deviceInfo.appManufacturer).toBe('Apple')
      expect(wrapper.vm.deviceInfo.appVersion).toBe('2.1.0')
    })

    it('returns null when no user agent', () => {
      const wrapper = mountComponent({
        log: createLog({ raw: {} }),
      })
      expect(wrapper.vm.deviceInfo).toBeNull()
    })
  })

  describe('hasDeviceInfo computed', () => {
    it('returns truthy when browser is known', () => {
      const wrapper = mountComponent({
        log: createLog({
          raw: { user_agent: 'Mozilla/5.0 Chrome/120.0' },
        }),
      })
      expect(wrapper.vm.hasDeviceInfo).toBeTruthy()
    })

    it('returns truthy when screenSize is available', () => {
      const wrapper = mountComponent({
        log: createLog({
          raw: {
            user_agent: 'Mozilla/5.0',
            viewport_width: 1920,
            viewport_height: 1080,
          },
        }),
      })
      expect(wrapper.vm.hasDeviceInfo).toBeTruthy()
    })

    it('returns falsy when browser is unknown and no screen size', () => {
      const wrapper = mountComponent({
        log: createLog({
          raw: { user_agent: 'CustomBot/1.0' },
        }),
      })
      expect(wrapper.vm.hasDeviceInfo).toBeFalsy()
    })

    it('returns falsy when no deviceInfo', () => {
      const wrapper = mountComponent({
        log: createLog({ raw: {} }),
      })
      expect(wrapper.vm.hasDeviceInfo).toBeFalsy()
    })
  })

  describe('sentryEventId computed', () => {
    it('returns sentry_event_id from raw', () => {
      const wrapper = mountComponent({
        log: createLog({ raw: { sentry_event_id: 'abc123def456' } }),
      })
      expect(wrapper.vm.sentryEventId).toBe('abc123def456')
    })

    it('returns null when no sentry_event_id', () => {
      const wrapper = mountComponent({
        log: createLog({ raw: {} }),
      })
      expect(wrapper.vm.sentryEventId).toBeNull()
    })
  })

  describe('sentryUrl computed', () => {
    it('returns Sentry URL when event ID exists', () => {
      const wrapper = mountComponent({
        log: createLog({ raw: { sentry_event_id: 'abc123def456' } }),
      })
      expect(wrapper.vm.sentryUrl).toBe(
        'https://freegle.sentry.io/issues/?query=abc123def456'
      )
    })

    it('returns null when no event ID', () => {
      const wrapper = mountComponent({
        log: createLog({ raw: {} }),
      })
      expect(wrapper.vm.sentryUrl).toBeNull()
    })
  })

  describe('displayUser computed', () => {
    it('returns user from store when available', () => {
      mockUserStore.list = {
        123: { id: 123, displayname: 'Test User' },
      }
      const wrapper = mountComponent({
        log: createLog({ user_id: 123 }),
      })
      expect(wrapper.vm.displayUser).toEqual({
        id: 123,
        displayname: 'Test User',
      })
    })

    it('returns undefined when user not in store', () => {
      mockUserStore.list = {}
      const wrapper = mountComponent({
        log: createLog({ user_id: 123 }),
      })
      expect(wrapper.vm.displayUser).toBeUndefined()
    })

    it('returns null when no user_id', () => {
      const wrapper = mountComponent({
        log: createLog({ user_id: null }),
      })
      expect(wrapper.vm.displayUser).toBeNull()
    })
  })

  describe('byUser computed', () => {
    it('returns byuser from store when available', () => {
      mockUserStore.list = {
        456: { id: 456, displayname: 'Mod User' },
      }
      const wrapper = mountComponent({
        log: createLog({ byuser_id: 456 }),
      })
      expect(wrapper.vm.byUser).toEqual({
        id: 456,
        displayname: 'Mod User',
      })
    })

    it('returns undefined when byuser not in store', () => {
      mockUserStore.list = {}
      const wrapper = mountComponent({
        log: createLog({ byuser_id: 456 }),
      })
      expect(wrapper.vm.byUser).toBeUndefined()
    })

    it('returns null when no byuser_id', () => {
      const wrapper = mountComponent({
        log: createLog({ byuser_id: null }),
      })
      expect(wrapper.vm.byUser).toBeNull()
    })
  })

  describe('displayGroup computed', () => {
    it('returns group from store when available', () => {
      mockGroupStore.list = {
        789: { id: 789, nameshort: 'TestGroup' },
      }
      const wrapper = mountComponent({
        log: createLog({ group_id: 789 }),
      })
      expect(wrapper.vm.displayGroup).toEqual({
        id: 789,
        nameshort: 'TestGroup',
      })
    })

    it('returns undefined when group not in store', () => {
      mockGroupStore.list = {}
      const wrapper = mountComponent({
        log: createLog({ group_id: 789 }),
      })
      expect(wrapper.vm.displayGroup).toBeUndefined()
    })

    it('returns null when no group_id', () => {
      const wrapper = mountComponent({
        log: createLog({ group_id: null }),
      })
      expect(wrapper.vm.displayGroup).toBeNull()
    })
  })

  describe('formattedRaw computed', () => {
    it('returns formatted JSON', () => {
      const raw = { key: 'value', nested: { a: 1 } }
      const wrapper = mountComponent({
        log: createLog({ raw }),
      })
      expect(wrapper.vm.formattedRaw).toBe(JSON.stringify(raw, null, 2))
    })

    it('returns empty object JSON when no raw', () => {
      const wrapper = mountComponent({
        log: createLog({ raw: undefined }),
      })
      expect(wrapper.vm.formattedRaw).toBe('{}')
    })
  })

  describe('count badge', () => {
    it('does not show count badge when count is 1', () => {
      const wrapper = mountComponent({ count: 1 })
      expect(wrapper.find('.count-badge').exists()).toBe(false)
    })

    it('shows count badge when count > 1', () => {
      const wrapper = mountComponent({ count: 5 })
      expect(wrapper.find('.count-badge').exists()).toBe(true)
      expect(wrapper.text()).toContain('5x')
    })

    it('toggles expanded on count badge click', async () => {
      const wrapper = mountComponent({
        count: 3,
        entries: [{ id: 1 }, { id: 2 }, { id: 3 }],
      })
      expect(wrapper.vm.isExpanded).toBe(false)
      await wrapper.find('.count-badge').trigger('click')
      expect(wrapper.vm.isExpanded).toBe(true)
      await wrapper.find('.count-badge').trigger('click')
      expect(wrapper.vm.isExpanded).toBe(false)
    })
  })

  describe('expanded entries', () => {
    it('shows expanded entries when count > 1 and isExpanded', async () => {
      const entries = [
        { id: 1, timestamp: '2024-01-15T10:00:00Z' },
        { id: 2, timestamp: '2024-01-15T10:15:00Z' },
        { id: 3, timestamp: '2024-01-15T10:30:00Z' },
      ]
      const wrapper = mountComponent({ count: 3, entries })
      await wrapper.find('.count-badge').trigger('click')
      expect(wrapper.find('.expanded-entries').exists()).toBe(true)
      expect(wrapper.findAll('.expanded-entry-row')).toHaveLength(3)
    })

    it('does not show expanded entries when collapsed', () => {
      const wrapper = mountComponent({
        count: 3,
        entries: [{ id: 1 }, { id: 2 }, { id: 3 }],
      })
      expect(wrapper.find('.expanded-entries').exists()).toBe(false)
    })
  })

  describe('user column visibility', () => {
    it('shows user column by default', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.log-col-user').exists()).toBe(true)
    })

    it('hides user column when hideUserColumn is true', () => {
      const wrapper = mountComponent({ hideUserColumn: true })
      expect(wrapper.find('.log-col-user').exists()).toBe(false)
    })
  })

  describe('user display', () => {
    it('shows user info when displayUser is available', () => {
      mockUserStore.list = {
        123: {
          id: 123,
          displayname: 'Test User',
          profile: { url: 'https://example.com/photo.jpg' },
        },
      }
      const wrapper = mountComponent({
        log: createLog({ user_id: 123 }),
      })
      expect(wrapper.find('.user-display').exists()).toBe(true)
      expect(wrapper.text()).toContain('Test User')
    })

    it('shows user placeholder when loading', () => {
      mockUserStore.list = {}
      const wrapper = mountComponent({
        log: createLog({ user_id: 123 }),
      })
      expect(wrapper.find('.user-placeholder').exists()).toBe(true)
      expect(wrapper.text()).toContain('#123')
    })

    it('shows Anon for api source without user', () => {
      const wrapper = mountComponent({
        log: createLog({ source: 'api', user_id: null }),
      })
      expect(wrapper.text()).toContain('Anon')
    })
  })

  describe('details modal', () => {
    it('opens modal on details button click', async () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.showModal).toBe(false)
      await wrapper.find('.details-btn').trigger('click')
      expect(wrapper.vm.showModal).toBe(true)
    })

    it('shows modal content when open', async () => {
      const wrapper = mountComponent()
      await wrapper.find('.details-btn').trigger('click')
      expect(wrapper.find('.modal').exists()).toBe(true)
    })
  })

  describe('emits', () => {
    it('emits filter-ip when IP clicked', async () => {
      const wrapper = mountComponent({
        log: createLog({ source: 'api', raw: { ip: '192.168.1.1' } }),
      })
      await wrapper.find('.ip-address').trigger('click')
      expect(wrapper.emitted('filter-ip')).toBeTruthy()
      expect(wrapper.emitted('filter-ip')[0]).toEqual(['192.168.1.1'])
    })

    it('emits filter-trace when filter by trace clicked in modal', async () => {
      const wrapper = mountComponent({
        log: createLog({ trace_id: 'trace-123' }),
      })
      await wrapper.find('.details-btn').trigger('click')
      wrapper.vm.filterByTraceAndClose()
      expect(wrapper.emitted('filter-trace')).toBeTruthy()
      expect(wrapper.emitted('filter-trace')[0]).toEqual(['trace-123'])
      expect(wrapper.vm.showModal).toBe(false)
    })

    it('emits filter-session when filter by session clicked in modal', async () => {
      const wrapper = mountComponent({
        log: createLog({ session_id: 'session-456' }),
      })
      await wrapper.find('.details-btn').trigger('click')
      wrapper.vm.filterBySessionAndClose()
      expect(wrapper.emitted('filter-session')).toBeTruthy()
      expect(wrapper.emitted('filter-session')[0]).toEqual(['session-456'])
      expect(wrapper.vm.showModal).toBe(false)
    })

    it('emits filter-ip and closes modal', async () => {
      const wrapper = mountComponent({
        log: createLog({ raw: { ip: '10.0.0.1' } }),
      })
      await wrapper.find('.details-btn').trigger('click')
      wrapper.vm.filterByIpAndClose()
      expect(wrapper.emitted('filter-ip')).toBeTruthy()
      expect(wrapper.emitted('filter-ip')[0]).toEqual(['10.0.0.1'])
      expect(wrapper.vm.showModal).toBe(false)
    })
  })

  describe('methods', () => {
    it('toggleExpanded toggles isExpanded state', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.isExpanded).toBe(false)
      wrapper.vm.toggleExpanded()
      expect(wrapper.vm.isExpanded).toBe(true)
      wrapper.vm.toggleExpanded()
      expect(wrapper.vm.isExpanded).toBe(false)
    })

    it('formatEntryTime calls formatLogTimestamp', () => {
      const wrapper = mountComponent()
      const result = wrapper.vm.formatEntryTime('2024-01-15T10:00:00Z')
      expect(result).toBe('10:30:00.123')
    })

    it('formatJson formats object to JSON string', () => {
      const wrapper = mountComponent()
      const result = wrapper.vm.formatJson({ key: 'value' })
      expect(result).toBe(JSON.stringify({ key: 'value' }, null, 2))
    })
  })

  describe('user/group fetching on mount', () => {
    it('fetches user when user_id present and not in store', () => {
      mockUserStore.list = {}
      mountComponent({
        log: createLog({ user_id: 123 }),
      })
      expect(mockUserStore.fetch).toHaveBeenCalledWith(123)
    })

    it('does not fetch user when already in store', () => {
      mockUserStore.list = { 123: { id: 123 } }
      mountComponent({
        log: createLog({ user_id: 123 }),
      })
      expect(mockUserStore.fetch).not.toHaveBeenCalled()
    })

    it('fetches group when group_id present and not in store', () => {
      mockGroupStore.list = {}
      mountComponent({
        log: createLog({ group_id: 789 }),
      })
      expect(mockGroupStore.fetch).toHaveBeenCalledWith(789)
    })

    it('does not fetch group when already in store', () => {
      mockGroupStore.list = { 789: { id: 789 } }
      mountComponent({
        log: createLog({ group_id: 789 }),
      })
      expect(mockGroupStore.fetch).not.toHaveBeenCalled()
    })

    it('fetches byuser when byuser_id present and not in store', () => {
      mockUserStore.list = {}
      mountComponent({
        log: createLog({ byuser_id: 456 }),
      })
      expect(mockUserStore.fetch).toHaveBeenCalledWith(456)
    })
  })

  describe('laravelLevel computed', () => {
    it('returns parsed level for laravel-batch source', () => {
      const wrapper = mountComponent({
        log: createLog({ source: 'laravel-batch' }),
      })
      expect(wrapper.vm.laravelLevel).toEqual({
        level: 'INFO',
        variant: 'info',
      })
    })

    it('returns null for non-laravel-batch source', () => {
      const wrapper = mountComponent({
        log: createLog({ source: 'api' }),
      })
      expect(wrapper.vm.laravelLevel).toBeNull()
    })
  })

  describe('group and message display', () => {
    it('shows group tag when displayGroup available', () => {
      mockGroupStore.list = {
        789: { id: 789, nameshort: 'TestGroup' },
      }
      const wrapper = mountComponent({
        log: createLog({ group_id: 789 }),
      })
      expect(wrapper.find('.group-tag').exists()).toBe(true)
      expect(wrapper.text()).toContain('TestGroup')
    })

    it('shows group id when group not in store', () => {
      mockGroupStore.list = {}
      const wrapper = mountComponent({
        log: createLog({ group_id: 789 }),
      })
      expect(wrapper.text()).toContain('group #789')
    })

    it('shows message tag when message_id present', () => {
      const wrapper = mountComponent({
        log: createLog({ message_id: 555 }),
      })
      expect(wrapper.find('.message-tag').exists()).toBe(true)
    })
  })

  describe('sentry indicator', () => {
    it('shows sentry indicator when sentryEventId present', () => {
      const wrapper = mountComponent({
        log: createLog({ raw: { sentry_event_id: 'abc123' } }),
      })
      expect(wrapper.find('.sentry-indicator').exists()).toBe(true)
    })

    it('does not show sentry indicator when no sentryEventId', () => {
      const wrapper = mountComponent({
        log: createLog({ raw: {} }),
      })
      expect(wrapper.find('.sentry-indicator').exists()).toBe(false)
    })
  })

  describe('device info display', () => {
    it('shows device info summary when hasDeviceInfo', () => {
      const wrapper = mountComponent({
        log: createLog({
          raw: {
            user_agent: 'Mozilla/5.0 Chrome/120.0',
            viewport_width: 1920,
            viewport_height: 1080,
          },
        }),
      })
      expect(wrapper.find('.device-info-summary').exists()).toBe(true)
    })

    it('does not show device info summary when no device info', () => {
      const wrapper = mountComponent({
        log: createLog({ raw: {} }),
      })
      expect(wrapper.find('.device-info-summary').exists()).toBe(false)
    })

    it('shows screen size chip', () => {
      const wrapper = mountComponent({
        log: createLog({
          raw: {
            user_agent: 'Mozilla/5.0 Chrome/120.0',
            viewport_width: 1920,
            viewport_height: 1080,
          },
        }),
      })
      expect(wrapper.find('.screen-chip').exists()).toBe(true)
      // Component uses multiplication sign (×) not x
      expect(wrapper.text()).toContain('1920×1080')
    })

    it('shows app chip when isApp', () => {
      const wrapper = mountComponent({
        log: createLog({
          raw: {
            // Need Chrome in UA to make hasDeviceInfo truthy
            user_agent: 'Mozilla/5.0 Chrome/120.0',
            app_platform: 'ios',
            app_model: 'iPhone 15',
            app_manufacturer: 'Apple',
          },
        }),
      })
      expect(wrapper.find('.app-chip').exists()).toBe(true)
    })
  })

  describe('actionTextClean computed', () => {
    it('removes duration from action text', () => {
      mockUserStore.list = {}
      mockGroupStore.list = {}
      const wrapper = mountComponent({
        log: createLog({ text: 'API call (250ms)' }),
      })
      expect(wrapper.vm.actionTextClean).not.toContain('(250ms)')
    })

    it('replaces user #ID with username when available', () => {
      mockUserStore.list = {
        123: { id: 123, displayname: 'John Doe' },
      }
      const wrapper = mountComponent({
        log: createLog({
          user_id: 123,
          text: 'Action by user #123',
        }),
      })
      expect(wrapper.vm.actionTextClean).toContain('John Doe')
      expect(wrapper.vm.actionTextClean).not.toContain('user #123')
    })

    it('replaces group #ID with group name when available', () => {
      mockGroupStore.list = {
        789: { id: 789, nameshort: 'FreegleTest' },
      }
      const wrapper = mountComponent({
        log: createLog({
          group_id: 789,
          text: 'Joined group #789',
        }),
      })
      expect(wrapper.vm.actionTextClean).toContain('FreegleTest')
      expect(wrapper.vm.actionTextClean).not.toContain('group #789')
    })
  })
})
