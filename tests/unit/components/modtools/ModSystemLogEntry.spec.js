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
    it('renders log entry with timestamp, source badge, action text, and details button', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.log-entry').exists()).toBe(true)
      expect(wrapper.find('.timestamp').exists()).toBe(true)
      expect(wrapper.text()).toContain('10:30:00.123')
      expect(wrapper.find('.source-badge').exists()).toBe(true)
      expect(wrapper.text()).toContain('API')
      expect(wrapper.find('.action-text').exists()).toBe(true)
      expect(wrapper.find('.details-btn').exists()).toBe(true)
    })
  })

  describe('sourceLabel computed', () => {
    it.each([
      ['api', 'API'],
      ['client', 'User'],
      ['email', 'Email'],
      ['laravel-batch', 'Email'],
      ['unknown_source', 'unknown_source'],
    ])('returns %s label for %s source', (source, expected) => {
      const wrapper = mountComponent({ log: createLog({ source }) })
      expect(wrapper.vm.sourceLabel).toBe(expected)
    })

    it('returns User for logs_table when same user, Mod when different', () => {
      const sameUser = mountComponent({
        log: createLog({ source: 'logs_table', user_id: 123, byuser_id: 123 }),
      })
      expect(sameUser.vm.sourceLabel).toBe('User')

      const diffUser = mountComponent({
        log: createLog({ source: 'logs_table', user_id: 123, byuser_id: 456 }),
      })
      expect(diffUser.vm.sourceLabel).toBe('Mod')
    })
  })

  describe('sourceVariant computed', () => {
    it('returns primary for user action and secondary for mod action in logs_table', () => {
      const userAction = mountComponent({
        log: createLog({ source: 'logs_table', user_id: 123, byuser_id: 123 }),
      })
      expect(userAction.vm.sourceVariant).toBe('primary')

      const modAction = mountComponent({
        log: createLog({ source: 'logs_table', user_id: 123, byuser_id: 456 }),
      })
      expect(modAction.vm.sourceVariant).toBe('secondary')
    })

    it('returns success for laravel-batch, uses getLogSourceVariant for others', () => {
      const laravelBatch = mountComponent({
        log: createLog({ source: 'laravel-batch' }),
      })
      expect(laravelBatch.vm.sourceVariant).toBe('success')

      const api = mountComponent({ log: createLog({ source: 'api' }) })
      expect(api.vm.sourceVariant).toBe('info')
    })
  })

  describe('entryClass computed', () => {
    it.each([
      [{ source: 'api', raw: { status_code: 500 } }, 'log-error', true],
      [{ source: 'api', raw: { status_code: 400 } }, 'log-error', false],
      [{ source: 'client', level: 'error' }, 'log-error', true],
      [{ source: 'client', level: 'warn' }, 'log-warn', true],
      [{ source: 'api', raw: { status_code: 200 } }, 'empty', true],
    ])(
      'returns correct class for %p',
      (logProps, expectedClass, shouldContain) => {
        const wrapper = mountComponent({ log: createLog(logProps) })
        if (expectedClass === 'empty') {
          expect(wrapper.vm.entryClass).toEqual([])
        } else if (shouldContain) {
          expect(wrapper.vm.entryClass).toContain(expectedClass)
        } else {
          expect(wrapper.vm.entryClass).not.toContain(expectedClass)
        }
      }
    )
  })

  describe('rawApiCall computed', () => {
    it('returns null for non-api source or missing endpoint info', () => {
      expect(
        mountComponent({ log: createLog({ source: 'client' }) }).vm.rawApiCall
      ).toBeNull()
      expect(
        mountComponent({
          log: createLog({ source: 'api', raw: { method: 'GET' } }),
        }).vm.rawApiCall
      ).toBeNull()
    })

    it('formats v1 API calls with /api prefix and v2 API calls as-is', () => {
      const v1 = mountComponent({
        log: createLog({ source: 'api', raw: { method: 'GET', call: 'user' } }),
      })
      expect(v1.vm.rawApiCall).toBe('GET /api/user')

      const v2 = mountComponent({
        log: createLog({
          source: 'api',
          raw: { method: 'POST', path: '/apiv2/message' },
        }),
      })
      expect(v2.vm.rawApiCall).toBe('POST /apiv2/message')
    })
  })

  describe('duration computed', () => {
    it('extracts duration from action text, raw.duration_ms, or returns null', () => {
      expect(
        mountComponent({ log: createLog({ text: 'API call (250ms)' }) }).vm
          .duration
      ).toBe('250ms')
      expect(
        mountComponent({
          log: createLog({ text: 'API call', raw: { duration_ms: 150.5 } }),
        }).vm.duration
      ).toBe('151ms')
      expect(
        mountComponent({ log: createLog({ text: 'Simple action' }) }).vm
          .duration
      ).toBeNull()
    })
  })

  describe('ipAddress computed', () => {
    it.each([
      [{ ip: '192.168.1.1' }, '192.168.1.1'],
      [{ ip_address: '10.0.0.1' }, '10.0.0.1'],
      [{ client_ip: '172.16.0.1' }, '172.16.0.1'],
      [{ ip: '0.0.0.0' }, null],
      [{ ip: '::' }, null],
      [{}, null],
    ])('returns correct IP for raw=%p', (raw, expected) => {
      const wrapper = mountComponent({ log: createLog({ raw }) })
      expect(wrapper.vm.ipAddress).toBe(expected)
    })
  })

  describe('sessionUrl and sessionUrlDisplay computed', () => {
    it('returns URL and formatted display path, truncating long paths', () => {
      const wrapper = mountComponent({
        log: createLog({
          raw: { url: 'https://www.ilovefreegle.org/give?type=offer' },
        }),
      })
      expect(wrapper.vm.sessionUrl).toBe(
        'https://www.ilovefreegle.org/give?type=offer'
      )
      expect(wrapper.vm.sessionUrlDisplay).toBe('/give?type=offer')

      const longPath =
        '/very/long/path/that/exceeds/fifty/characters/limit/test/more'
      const longWrapper = mountComponent({
        log: createLog({ raw: { url: `https://example.com${longPath}` } }),
      })
      expect(longWrapper.vm.sessionUrlDisplay.length).toBeLessThanOrEqual(50)
      expect(longWrapper.vm.sessionUrlDisplay).toContain('...')

      const noUrl = mountComponent({ log: createLog({ raw: {} }) })
      expect(noUrl.vm.sessionUrl).toBeNull()
      expect(noUrl.vm.sessionUrlDisplay).toBeNull()
    })
  })

  describe('messageSubject computed', () => {
    it.each([
      [{ message: { subject: 'OFFER: Chair' } }, 'OFFER: Chair'],
      [{ subject: 'WANTED: Table' }, 'WANTED: Table'],
      [{}, null],
    ])('returns subject from raw=%p', (raw, expected) => {
      const wrapper = mountComponent({ log: createLog({ raw }) })
      expect(wrapper.vm.messageSubject).toBe(expected)
    })
  })

  describe('queryParams/requestBody/responseBody computed', () => {
    it('returns values from raw or null when missing', () => {
      const params = { type: 'Offer', limit: 10 }
      const body = { name: 'Test' }
      const response = { ret: 0 }

      const wrapper = mountComponent({
        log: createLog({
          raw: {
            query_params: params,
            request_body: body,
            response_body: response,
          },
        }),
      })
      expect(wrapper.vm.queryParams).toEqual(params)
      expect(wrapper.vm.requestBody).toEqual(body)
      expect(wrapper.vm.responseBody).toEqual(response)

      const emptyWrapper = mountComponent({ log: createLog({ raw: {} }) })
      expect(emptyWrapper.vm.queryParams).toBeNull()
      expect(emptyWrapper.vm.requestBody).toBeNull()
      expect(emptyWrapper.vm.responseBody).toBeNull()
    })
  })

  describe('isApiLog and requestId computed', () => {
    it('returns true for api source and request_id from raw', () => {
      expect(
        mountComponent({ log: createLog({ source: 'api' }) }).vm.isApiLog
      ).toBe(true)
      expect(
        mountComponent({ log: createLog({ source: 'client' }) }).vm.isApiLog
      ).toBe(false)

      expect(
        mountComponent({
          log: createLog({ raw: { request_id: 'abc123' } }),
        }).vm.requestId
      ).toBe('abc123')
      expect(
        mountComponent({ log: createLog({ raw: {} }) }).vm.requestId
      ).toBeNull()
    })
  })

  describe('deviceInfo computed', () => {
    it.each([
      ['Chrome/120.0.0.0', 'Chrome'],
      ['Firefox/121.0', 'Firefox'],
      ['Safari/605.1.15', 'Safari'],
      ['Edg/120.0.0.0', 'Edge'],
    ])('detects %s browser', (ua, browser) => {
      const wrapper = mountComponent({
        log: createLog({ raw: { user_agent: `Mozilla/5.0 ${ua}` } }),
      })
      expect(wrapper.vm.deviceInfo.browser).toBe(browser)
    })

    it.each([
      ['iPhone', 'mobile'],
      ['iPad', 'tablet'],
      ['Windows NT', 'desktop'],
    ])('detects %s device type', (uaFragment, type) => {
      const ua =
        uaFragment === 'Windows NT'
          ? 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0'
          : `Mozilla/5.0 (${uaFragment}; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15`
      const wrapper = mountComponent({
        log: createLog({ raw: { user_agent: ua } }),
      })
      expect(wrapper.vm.deviceInfo.type).toBe(type)
    })

    it('includes screen size and app info when available', () => {
      const wrapper = mountComponent({
        log: createLog({
          raw: {
            user_agent: 'Mozilla/5.0 Chrome/120.0',
            viewport_width: 1920,
            viewport_height: 1080,
            app_platform: 'ios',
            app_model: 'iPhone 15',
            app_manufacturer: 'Apple',
            app_version: '2.1.0',
          },
        }),
      })
      expect(wrapper.vm.deviceInfo.screenSize).toBe('1920×1080')
      expect(wrapper.vm.deviceInfo.isApp).toBe(true)
      expect(wrapper.vm.deviceInfo.appPlatform).toBe('ios')
      expect(wrapper.vm.deviceInfo.appModel).toBe('iPhone 15')
    })

    it('returns null when no user agent', () => {
      const wrapper = mountComponent({ log: createLog({ raw: {} }) })
      expect(wrapper.vm.deviceInfo).toBeNull()
    })
  })

  describe('hasDeviceInfo computed', () => {
    it('returns truthy when browser known or screenSize available, falsy otherwise', () => {
      expect(
        mountComponent({
          log: createLog({ raw: { user_agent: 'Mozilla/5.0 Chrome/120.0' } }),
        }).vm.hasDeviceInfo
      ).toBeTruthy()

      expect(
        mountComponent({
          log: createLog({
            raw: {
              user_agent: 'Mozilla/5.0',
              viewport_width: 1920,
              viewport_height: 1080,
            },
          }),
        }).vm.hasDeviceInfo
      ).toBeTruthy()

      expect(
        mountComponent({
          log: createLog({ raw: { user_agent: 'CustomBot/1.0' } }),
        }).vm.hasDeviceInfo
      ).toBeFalsy()

      expect(
        mountComponent({ log: createLog({ raw: {} }) }).vm.hasDeviceInfo
      ).toBeFalsy()
    })
  })

  describe('sentryEventId and sentryUrl computed', () => {
    it('returns event ID and URL when present, null otherwise', () => {
      const wrapper = mountComponent({
        log: createLog({ raw: { sentry_event_id: 'abc123def456' } }),
      })
      expect(wrapper.vm.sentryEventId).toBe('abc123def456')
      expect(wrapper.vm.sentryUrl).toBe(
        'https://freegle.sentry.io/issues/?query=abc123def456'
      )

      const emptyWrapper = mountComponent({ log: createLog({ raw: {} }) })
      expect(emptyWrapper.vm.sentryEventId).toBeNull()
      expect(emptyWrapper.vm.sentryUrl).toBeNull()
    })
  })

  describe('displayUser/byUser/displayGroup computed', () => {
    it('returns entity from store, undefined when not in store, null when no ID', () => {
      mockUserStore.list = { 123: { id: 123, displayname: 'Test User' } }
      mockGroupStore.list = { 789: { id: 789, nameshort: 'TestGroup' } }

      const wrapper = mountComponent({
        log: createLog({ user_id: 123, byuser_id: 456, group_id: 789 }),
      })
      expect(wrapper.vm.displayUser).toEqual({
        id: 123,
        displayname: 'Test User',
      })
      expect(wrapper.vm.byUser).toBeUndefined() // 456 not in store
      expect(wrapper.vm.displayGroup).toEqual({
        id: 789,
        nameshort: 'TestGroup',
      })

      const noIds = mountComponent({
        log: createLog({ user_id: null, byuser_id: null, group_id: null }),
      })
      expect(noIds.vm.displayUser).toBeNull()
      expect(noIds.vm.byUser).toBeNull()
      expect(noIds.vm.displayGroup).toBeNull()
    })
  })

  describe('formattedRaw computed', () => {
    it('returns formatted JSON or empty object', () => {
      const raw = { key: 'value', nested: { a: 1 } }
      expect(mountComponent({ log: createLog({ raw }) }).vm.formattedRaw).toBe(
        JSON.stringify(raw, null, 2)
      )

      expect(
        mountComponent({ log: createLog({ raw: undefined }) }).vm.formattedRaw
      ).toBe('{}')
    })
  })

  describe('count badge and expanded entries', () => {
    it('shows count badge when count > 1 and toggles expanded entries on click', async () => {
      const wrapper = mountComponent({ count: 1 })
      expect(wrapper.find('.count-badge').exists()).toBe(false)

      const multiWrapper = mountComponent({
        count: 3,
        entries: [
          { id: 1, timestamp: '2024-01-15T10:00:00Z' },
          { id: 2, timestamp: '2024-01-15T10:15:00Z' },
          { id: 3, timestamp: '2024-01-15T10:30:00Z' },
        ],
      })
      expect(multiWrapper.find('.count-badge').exists()).toBe(true)
      expect(multiWrapper.text()).toContain('3x')
      expect(multiWrapper.vm.isExpanded).toBe(false)
      expect(multiWrapper.find('.expanded-entries').exists()).toBe(false)

      await multiWrapper.find('.count-badge').trigger('click')
      expect(multiWrapper.vm.isExpanded).toBe(true)
      expect(multiWrapper.find('.expanded-entries').exists()).toBe(true)
      expect(multiWrapper.findAll('.expanded-entry-row')).toHaveLength(3)

      await multiWrapper.find('.count-badge').trigger('click')
      expect(multiWrapper.vm.isExpanded).toBe(false)
    })
  })

  describe('user column visibility', () => {
    it('shows by default, hides when hideUserColumn is true', () => {
      expect(mountComponent().find('.log-col-user').exists()).toBe(true)
      expect(
        mountComponent({ hideUserColumn: true }).find('.log-col-user').exists()
      ).toBe(false)
    })
  })

  describe('user display', () => {
    it('shows user info, placeholder when loading, or Anon for api without user', () => {
      mockUserStore.list = {
        123: {
          id: 123,
          displayname: 'Test User',
          profile: { url: 'photo.jpg' },
        },
      }
      const withUser = mountComponent({ log: createLog({ user_id: 123 }) })
      expect(withUser.find('.user-display').exists()).toBe(true)
      expect(withUser.text()).toContain('Test User')

      mockUserStore.list = {}
      const loading = mountComponent({ log: createLog({ user_id: 123 }) })
      expect(loading.find('.user-placeholder').exists()).toBe(true)
      expect(loading.text()).toContain('#123')

      const anon = mountComponent({
        log: createLog({ source: 'api', user_id: null }),
      })
      expect(anon.text()).toContain('Anon')
    })
  })

  describe('details modal', () => {
    it('opens on details button click and shows modal content', async () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.showModal).toBe(false)
      await wrapper.find('.details-btn').trigger('click')
      expect(wrapper.vm.showModal).toBe(true)
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

    it.each([
      ['filterByTraceAndClose', 'filter-trace', 'trace_id', 'trace-123'],
      [
        'filterBySessionAndClose',
        'filter-session',
        'session_id',
        'session-456',
      ],
      ['filterByIpAndClose', 'filter-ip', 'raw', { ip: '10.0.0.1' }],
    ])(
      '%s emits %s and closes modal',
      async (method, event, logProp, logValue) => {
        const log =
          logProp === 'raw'
            ? createLog({ raw: logValue })
            : createLog({ [logProp]: logValue })
        const wrapper = mountComponent({ log })
        await wrapper.find('.details-btn').trigger('click')
        wrapper.vm[method]()
        expect(wrapper.emitted(event)).toBeTruthy()
        expect(wrapper.vm.showModal).toBe(false)
      }
    )
  })

  describe('methods', () => {
    it('toggleExpanded, formatEntryTime, and formatJson work correctly', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.isExpanded).toBe(false)
      wrapper.vm.toggleExpanded()
      expect(wrapper.vm.isExpanded).toBe(true)
      wrapper.vm.toggleExpanded()
      expect(wrapper.vm.isExpanded).toBe(false)

      expect(wrapper.vm.formatEntryTime('2024-01-15T10:00:00Z')).toBe(
        '10:30:00.123'
      )
      expect(wrapper.vm.formatJson({ key: 'value' })).toBe(
        JSON.stringify({ key: 'value' }, null, 2)
      )
    })
  })

  describe('user/group fetching on mount', () => {
    it('fetches user/group when not in store, skips when already present', () => {
      mockUserStore.list = {}
      mockGroupStore.list = {}
      mountComponent({
        log: createLog({ user_id: 123, byuser_id: 456, group_id: 789 }),
      })
      expect(mockUserStore.fetch).toHaveBeenCalledWith(123)
      expect(mockUserStore.fetch).toHaveBeenCalledWith(456)
      expect(mockGroupStore.fetch).toHaveBeenCalledWith(789)

      vi.clearAllMocks()
      mockUserStore.list = { 123: { id: 123 } }
      mockGroupStore.list = { 789: { id: 789 } }
      mountComponent({
        log: createLog({ user_id: 123, group_id: 789 }),
      })
      expect(mockUserStore.fetch).not.toHaveBeenCalled()
      expect(mockGroupStore.fetch).not.toHaveBeenCalled()
    })
  })

  describe('laravelLevel computed', () => {
    it('returns parsed level for laravel-batch, null for others', () => {
      expect(
        mountComponent({ log: createLog({ source: 'laravel-batch' }) }).vm
          .laravelLevel
      ).toEqual({ level: 'INFO', variant: 'info' })
      expect(
        mountComponent({ log: createLog({ source: 'api' }) }).vm.laravelLevel
      ).toBeNull()
    })
  })

  describe('group and message display', () => {
    it('shows group tag/id and message tag based on availability', () => {
      mockGroupStore.list = { 789: { id: 789, nameshort: 'TestGroup' } }
      const withGroup = mountComponent({ log: createLog({ group_id: 789 }) })
      expect(withGroup.find('.group-tag').exists()).toBe(true)
      expect(withGroup.text()).toContain('TestGroup')

      mockGroupStore.list = {}
      const noGroupData = mountComponent({ log: createLog({ group_id: 789 }) })
      expect(noGroupData.text()).toContain('group #789')

      const withMessage = mountComponent({
        log: createLog({ message_id: 555 }),
      })
      expect(withMessage.find('.message-tag').exists()).toBe(true)
    })
  })

  describe('sentry indicator', () => {
    it('shows when sentryEventId present, hides otherwise', () => {
      expect(
        mountComponent({
          log: createLog({ raw: { sentry_event_id: 'abc123' } }),
        })
          .find('.sentry-indicator')
          .exists()
      ).toBe(true)
      expect(
        mountComponent({ log: createLog({ raw: {} }) })
          .find('.sentry-indicator')
          .exists()
      ).toBe(false)
    })
  })

  describe('device info display', () => {
    it('shows device info summary with screen and app chips when available', () => {
      const wrapper = mountComponent({
        log: createLog({
          raw: {
            user_agent: 'Mozilla/5.0 Chrome/120.0',
            viewport_width: 1920,
            viewport_height: 1080,
            app_platform: 'ios',
            app_model: 'iPhone 15',
            app_manufacturer: 'Apple',
          },
        }),
      })
      expect(wrapper.find('.device-info-summary').exists()).toBe(true)
      expect(wrapper.find('.screen-chip').exists()).toBe(true)
      expect(wrapper.text()).toContain('1920×1080')
      expect(wrapper.find('.app-chip').exists()).toBe(true)

      expect(
        mountComponent({ log: createLog({ raw: {} }) })
          .find('.device-info-summary')
          .exists()
      ).toBe(false)
    })
  })

  describe('actionTextClean computed', () => {
    it('removes duration and replaces user/group IDs with names', () => {
      mockUserStore.list = { 123: { id: 123, displayname: 'John Doe' } }
      mockGroupStore.list = { 789: { id: 789, nameshort: 'FreegleTest' } }

      const withDuration = mountComponent({
        log: createLog({ text: 'API call (250ms)' }),
      })
      expect(withDuration.vm.actionTextClean).not.toContain('(250ms)')

      const withUser = mountComponent({
        log: createLog({ user_id: 123, text: 'Action by user #123' }),
      })
      expect(withUser.vm.actionTextClean).toContain('John Doe')
      expect(withUser.vm.actionTextClean).not.toContain('user #123')

      const withGroup = mountComponent({
        log: createLog({ group_id: 789, text: 'Joined group #789' }),
      })
      expect(withGroup.vm.actionTextClean).toContain('FreegleTest')
      expect(withGroup.vm.actionTextClean).not.toContain('group #789')
    })
  })
})
