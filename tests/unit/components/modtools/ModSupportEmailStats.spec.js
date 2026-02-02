import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'

import ModSupportEmailStats from '~/modtools/components/ModSupportEmailStats.vue'

// Mock email tracking store
const mockEmailTrackingStore = {
  init: vi.fn(),
  stats: null,
  ampStats: null,
  statsLoading: false,
  statsError: null,
  hasStats: false,
  formattedStats: null,
  formattedAMPStats: null,
  hasAMPStats: false,
  timeSeries: [],
  timeSeriesLoading: false,
  timeSeriesError: null,
  hasTimeSeries: false,
  timeSeriesChartData: [],
  statsByType: [],
  statsByTypeLoading: false,
  statsByTypeError: null,
  hasStatsByType: false,
  typeComparisonChartData: [],
  clickedLinks: [],
  clickedLinksTotal: 0,
  clickedLinksLoading: false,
  clickedLinksError: null,
  hasClickedLinks: false,
  hasMoreClickedLinks: false,
  showAllClickedLinks: false,
  aggregateClickedLinks: true,
  userEmails: [],
  userEmailsTotal: 0,
  userEmailsLoading: false,
  userEmailsError: null,
  hasUserEmails: false,
  hasMoreUserEmails: false,
  currentUserId: null,
  currentEmail: null,
  volumeChartData: [],
  setFilters: vi.fn(),
  fetchStats: vi.fn().mockResolvedValue({}),
  fetchTimeSeries: vi.fn().mockResolvedValue({}),
  fetchStatsByType: vi.fn().mockResolvedValue({}),
  fetchClickedLinks: vi.fn().mockResolvedValue({}),
  fetchUserEmails: vi.fn().mockResolvedValue({}),
  loadMoreUserEmails: vi.fn().mockResolvedValue({}),
  toggleAggregateClickedLinks: vi.fn(),
  toggleShowAllClickedLinks: vi.fn(),
}

vi.mock('~/modtools/stores/emailtracking', () => ({
  useEmailTrackingStore: () => mockEmailTrackingStore,
}))

vi.mock('#app', () => ({
  useRuntimeConfig: () => ({ public: { apiUrl: 'http://test' } }),
}))

// Mock GChart
vi.mock('vue-google-charts', () => ({
  GChart: {
    template: '<div class="gchart" :data-type="type" />',
    props: ['type', 'data', 'options'],
  },
}))

describe('ModSupportEmailStats', () => {
  function mountComponent() {
    return mount(ModSupportEmailStats, {
      global: {
        stubs: {
          NoticeMessage: {
            template:
              '<div class="notice-message" :class="variant"><slot /></div>',
            props: ['variant'],
          },
          'b-modal': {
            template: '<div class="modal" v-if="modelValue"><slot /></div>',
            props: ['modelValue', 'title', 'okOnly', 'okTitle', 'size'],
          },
          'b-card': { template: '<div class="card"><slot /></div>' },
          'b-form': {
            template:
              '<form @submit.prevent="$emit(\'submit\')"><slot /></form>',
            props: ['inline'],
          },
          'b-form-select': {
            template:
              '<select :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><slot /></select>',
            props: ['modelValue', 'options', 'size'],
          },
          'b-form-input': {
            template:
              '<input :value="modelValue" :type="type" @input="$emit(\'update:modelValue\', $event.target.value)" />',
            props: ['modelValue', 'type', 'size', 'placeholder'],
          },
          'b-button': {
            template:
              '<button :disabled="disabled" :class="variant" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant', 'size', 'disabled', 'type'],
          },
          'b-spinner': { template: '<span class="spinner" />' },
          'b-table': {
            template: '<table class="table"><slot /></table>',
            props: [
              'items',
              'fields',
              'striped',
              'hover',
              'responsive',
              'small',
            ],
          },
          'b-badge': {
            template: '<span class="badge" :class="variant"><slot /></span>',
            props: ['variant'],
          },
          'b-collapse': { template: '<div class="collapse"><slot /></div>' },
          'b-form-checkbox': {
            template:
              '<input type="checkbox" :checked="checked" @change="$emit(\'change\', $event.target.checked)" />',
            props: ['checked', 'switch', 'size'],
          },
          GChart: {
            template: '<div class="gchart" :data-type="type" />',
            props: ['type', 'data', 'options'],
          },
          ModEmailDateFilter: {
            template: '<div class="date-filter" />',
            props: ['loading', 'fetchLabel', 'defaultPreset'],
          },
          ModEmailStatCard: {
            template: '<div class="stat-card"><slot /></div>',
            props: [
              'value',
              'label',
              'subtitle',
              'valueColor',
              'accent',
              'active',
              'clickable',
            ],
          },
        },
        directives: {
          'b-toggle': {},
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset store state
    mockEmailTrackingStore.stats = null
    mockEmailTrackingStore.ampStats = null
    mockEmailTrackingStore.statsLoading = false
    mockEmailTrackingStore.statsError = null
    mockEmailTrackingStore.hasStats = false
    mockEmailTrackingStore.formattedStats = null
    mockEmailTrackingStore.formattedAMPStats = null
    mockEmailTrackingStore.hasAMPStats = false
    mockEmailTrackingStore.timeSeries = []
    mockEmailTrackingStore.timeSeriesLoading = false
    mockEmailTrackingStore.timeSeriesError = null
    mockEmailTrackingStore.hasTimeSeries = false
    mockEmailTrackingStore.statsByType = []
    mockEmailTrackingStore.statsByTypeLoading = false
    mockEmailTrackingStore.statsByTypeError = null
    mockEmailTrackingStore.hasStatsByType = false
    mockEmailTrackingStore.clickedLinks = []
    mockEmailTrackingStore.clickedLinksLoading = false
    mockEmailTrackingStore.hasClickedLinks = false
    mockEmailTrackingStore.userEmails = []
    mockEmailTrackingStore.hasUserEmails = false
  })

  describe('rendering', () => {
    it('displays the info message about email tracking', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Email tracking statistics')
    })

    it('shows how does tracking work link', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('How does tracking work?')
    })

    it('renders filter form', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('form').exists()).toBe(true)
    })
  })

  describe('initial state', () => {
    it('initializes with empty emailType', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.emailType).toBe('')
    })

    it('initializes with empty userIdOrEmail', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.userIdOrEmail).toBe('')
    })

    it('initializes with showInfoModal as false', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.showInfoModal).toBe(false)
    })
  })

  describe('email type options', () => {
    it('has correct email type options', () => {
      const wrapper = mountComponent()
      const options = wrapper.vm.emailTypeOptions

      expect(options).toContainEqual({ text: 'All Types', value: '' })
      expect(options).toContainEqual({
        text: 'Chat Notification',
        value: 'ChatNotification',
      })
      expect(options).toContainEqual({ text: 'Welcome', value: 'WelcomeMail' })
      expect(options).toContainEqual({ text: 'Digest', value: 'UnifiedDigest' })
    })
  })

  describe('fetchStats', () => {
    it('calls store setFilters with current filter values', async () => {
      const wrapper = mountComponent()
      wrapper.vm.emailType = 'ChatNotification'

      await wrapper.vm.fetchStats()

      expect(mockEmailTrackingStore.setFilters).toHaveBeenCalled()
    })

    it('calls all fetch methods in parallel', async () => {
      const wrapper = mountComponent()

      await wrapper.vm.fetchStats()

      expect(mockEmailTrackingStore.fetchStats).toHaveBeenCalled()
      expect(mockEmailTrackingStore.fetchTimeSeries).toHaveBeenCalled()
      expect(mockEmailTrackingStore.fetchStatsByType).toHaveBeenCalled()
      expect(mockEmailTrackingStore.fetchClickedLinks).toHaveBeenCalled()
    })
  })

  describe('fetchUserEmails', () => {
    it('does nothing when userIdOrEmail is empty', async () => {
      const wrapper = mountComponent()
      wrapper.vm.userIdOrEmail = ''

      await wrapper.vm.fetchUserEmails()

      expect(mockEmailTrackingStore.fetchUserEmails).not.toHaveBeenCalled()
    })

    it('calls store with parsed int for numeric input', async () => {
      const wrapper = mountComponent()
      wrapper.vm.userIdOrEmail = '12345'

      await wrapper.vm.fetchUserEmails()

      expect(mockEmailTrackingStore.fetchUserEmails).toHaveBeenCalledWith(12345)
    })

    it('calls store with string for email input', async () => {
      const wrapper = mountComponent()
      wrapper.vm.userIdOrEmail = 'test@example.com'

      await wrapper.vm.fetchUserEmails()

      expect(mockEmailTrackingStore.fetchUserEmails).toHaveBeenCalledWith(
        'test@example.com'
      )
    })

    it('trims whitespace from input', async () => {
      const wrapper = mountComponent()
      wrapper.vm.userIdOrEmail = '  test@example.com  '

      await wrapper.vm.fetchUserEmails()

      expect(mockEmailTrackingStore.fetchUserEmails).toHaveBeenCalledWith(
        'test@example.com'
      )
    })
  })

  describe('loadMoreUserEmails', () => {
    it('calls store loadMoreUserEmails', async () => {
      const wrapper = mountComponent()

      await wrapper.vm.loadMoreUserEmails()

      expect(mockEmailTrackingStore.loadMoreUserEmails).toHaveBeenCalled()
    })
  })

  describe('computed properties', () => {
    describe('formattedStats', () => {
      it('returns null when store has no stats', () => {
        mockEmailTrackingStore.formattedStats = null
        const wrapper = mountComponent()
        expect(wrapper.vm.formattedStats).toBeNull()
      })

      it('formats stats correctly', () => {
        mockEmailTrackingStore.formattedStats = {
          totalSent: '100',
          opened: '50',
          clicked: '25',
          bounced: '5',
          openRate: '50.0',
          clickRate: '25.0',
          clickToOpenRate: '50.0',
          bounceRate: '5.0',
        }
        const wrapper = mountComponent()
        const stats = wrapper.vm.formattedStats

        expect(stats.totalSent).toBe(100)
        expect(stats.opened).toBe(50)
        expect(stats.clicked).toBe(25)
        expect(stats.bounced).toBe(5)
      })
    })

    describe('formattedAMPStats', () => {
      it('returns null when store has no AMP stats', () => {
        mockEmailTrackingStore.formattedAMPStats = null
        const wrapper = mountComponent()
        expect(wrapper.vm.formattedAMPStats).toBeNull()
      })

      it('calculates totals correctly', () => {
        mockEmailTrackingStore.formattedAMPStats = {
          totalWithAMP: '50',
          totalWithoutAMP: '50',
          ampOpened: '25',
          nonAMPOpened: '20',
          ampClicked: '10',
          nonAMPClicked: '8',
          ampRenderRate: '20.0',
          ampOpenRate: '50.0',
          ampClickRate: '20.0',
          ampBounceRate: '2.0',
          ampReplyRate: '5.0',
          ampActionRate: '10.0',
          ampResponseRate: '8.0',
          ampReplyViaAMPRate: '3.0',
          ampReplyViaEmailRate: '2.0',
          ampReplyClickRate: '3.0',
          ampOtherClickRate: '4.0',
          nonAMPOpenRate: '40.0',
          nonAMPClickRate: '16.0',
          nonAMPBounceRate: '3.0',
          nonAMPReplyRate: '4.0',
          nonAMPActionRate: '8.0',
          nonAMPResponseRate: '6.0',
          nonAMPReplyClickRate: '2.5',
          nonAMPOtherClickRate: '3.5',
          ampRendered: '10',
          ampPercentage: '50.0',
        }
        const wrapper = mountComponent()
        const stats = wrapper.vm.formattedAMPStats

        expect(stats.totalWithAMP).toBe(50)
        expect(stats.totalWithoutAMP).toBe(50)
        expect(stats.totalEmails).toBe(100)
      })
    })

    describe('ampProportionChartData', () => {
      it('returns null when no AMP stats', () => {
        const wrapper = mountComponent()
        // formattedAMPStats is null
        expect(wrapper.vm.ampProportionChartData).toBeNull()
      })

      it('returns chart data when AMP stats exist', () => {
        mockEmailTrackingStore.formattedAMPStats = {
          totalWithAMP: '50',
          totalWithoutAMP: '50',
          ampOpened: '0',
          nonAMPOpened: '0',
          ampClicked: '0',
          nonAMPClicked: '0',
          ampRenderRate: '0',
          ampOpenRate: '0',
          ampClickRate: '0',
          ampBounceRate: '0',
          ampReplyRate: '0',
          ampActionRate: '0',
          ampResponseRate: '0',
          ampReplyViaAMPRate: '0',
          ampReplyViaEmailRate: '0',
          ampReplyClickRate: '0',
          ampOtherClickRate: '0',
          nonAMPOpenRate: '0',
          nonAMPClickRate: '0',
          nonAMPBounceRate: '0',
          nonAMPReplyRate: '0',
          nonAMPActionRate: '0',
          nonAMPResponseRate: '0',
          nonAMPReplyClickRate: '0',
          nonAMPOtherClickRate: '0',
          ampRendered: '0',
          ampPercentage: '50.0',
        }
        const wrapper = mountComponent()
        const data = wrapper.vm.ampProportionChartData

        expect(data).toEqual([
          ['Type', 'Count'],
          ['AMP Emails', 50],
          ['Non-AMP Emails', 50],
        ])
      })
    })

    describe('clickedLinksFieldsComputed', () => {
      it('returns aggregated fields when aggregateClickedLinks is true', () => {
        mockEmailTrackingStore.aggregateClickedLinks = true
        const wrapper = mountComponent()
        const fields = wrapper.vm.clickedLinksFieldsComputed

        expect(fields[0].key).toBe('normalized_url')
        expect(fields[0].label).toBe('Link Pattern')
      })

      it('returns individual fields when aggregateClickedLinks is false', () => {
        mockEmailTrackingStore.aggregateClickedLinks = false
        const wrapper = mountComponent()
        const fields = wrapper.vm.clickedLinksFieldsComputed

        expect(fields[0].key).toBe('url')
        expect(fields[0].label).toBe('URL')
      })
    })

    describe('ampResponseRateTotal', () => {
      it('returns 0.0 when no AMP stats', () => {
        const wrapper = mountComponent()
        expect(wrapper.vm.ampResponseRateTotal).toBe('0.0')
      })

      it('sums AMP response rates', () => {
        mockEmailTrackingStore.formattedAMPStats = {
          totalWithAMP: '100',
          totalWithoutAMP: '100',
          ampOpened: '0',
          nonAMPOpened: '0',
          ampClicked: '0',
          nonAMPClicked: '0',
          ampRenderRate: '0',
          ampOpenRate: '0',
          ampClickRate: '0',
          ampBounceRate: '0',
          ampReplyRate: '0',
          ampActionRate: '0',
          ampResponseRate: '0',
          ampReplyViaAMPRate: '5.0',
          ampReplyViaEmailRate: '3.0',
          ampReplyClickRate: '2.0',
          ampOtherClickRate: '0',
          nonAMPOpenRate: '0',
          nonAMPClickRate: '0',
          nonAMPBounceRate: '0',
          nonAMPReplyRate: '0',
          nonAMPActionRate: '0',
          nonAMPResponseRate: '0',
          nonAMPReplyClickRate: '0',
          nonAMPOtherClickRate: '0',
          ampRendered: '0',
          ampPercentage: '50.0',
        }
        const wrapper = mountComponent()
        expect(wrapper.vm.ampResponseRateTotal).toBe('10.0')
      })
    })

    describe('nonAMPResponseRateTotal', () => {
      it('returns 0.0 when no AMP stats', () => {
        const wrapper = mountComponent()
        expect(wrapper.vm.nonAMPResponseRateTotal).toBe('0.0')
      })

      it('sums non-AMP response rates', () => {
        mockEmailTrackingStore.formattedAMPStats = {
          totalWithAMP: '100',
          totalWithoutAMP: '100',
          ampOpened: '0',
          nonAMPOpened: '0',
          ampClicked: '0',
          nonAMPClicked: '0',
          ampRenderRate: '0',
          ampOpenRate: '0',
          ampClickRate: '0',
          ampBounceRate: '0',
          ampReplyRate: '0',
          ampActionRate: '0',
          ampResponseRate: '0',
          ampReplyViaAMPRate: '0',
          ampReplyViaEmailRate: '0',
          ampReplyClickRate: '0',
          ampOtherClickRate: '0',
          nonAMPOpenRate: '0',
          nonAMPClickRate: '0',
          nonAMPBounceRate: '0',
          nonAMPReplyRate: '4.0',
          nonAMPActionRate: '0',
          nonAMPResponseRate: '0',
          nonAMPReplyClickRate: '3.0',
          nonAMPOtherClickRate: '0',
          ampRendered: '0',
          ampPercentage: '50.0',
        }
        const wrapper = mountComponent()
        expect(wrapper.vm.nonAMPResponseRateTotal).toBe('7.0')
      })
    })
  })

  describe('chart options', () => {
    it('returns engagement chart options', () => {
      const wrapper = mountComponent()
      const options = wrapper.vm.getEngagementChartOptions()

      expect(options.title).toBe('Opens and Clicks Over Time')
      expect(options.curveType).toBe('function')
      expect(options.legend).toEqual({ position: 'bottom' })
    })

    it('returns type comparison options', () => {
      const wrapper = mountComponent()
      const options = wrapper.vm.getTypeComparisonOptions()

      expect(options.title).toBe('Opens and Clicks by Email Type')
    })

    it('returns volume chart options', () => {
      const wrapper = mountComponent()
      const options = wrapper.vm.getVolumeChartOptions()

      expect(options.title).toBe('Email Volume Over Time')
      expect(options.legend).toEqual({ position: 'none' })
    })
  })

  describe('error display', () => {
    it('shows error message when statsError is set', async () => {
      mockEmailTrackingStore.statsError = 'Test error message'
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('Test error message')
    })
  })

  describe('loading state', () => {
    it('passes loading state to date filter when loading', async () => {
      mockEmailTrackingStore.statsLoading = true
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()

      const filter = wrapper.find('.date-filter')
      expect(filter.exists()).toBe(true)
    })
  })

  describe('no data message', () => {
    it('shows no data message when no stats and not loading', async () => {
      mockEmailTrackingStore.hasStats = false
      mockEmailTrackingStore.statsLoading = false
      mockEmailTrackingStore.statsError = null
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('No email tracking data available')
    })
  })

  describe('email fields', () => {
    it('has correct field definitions', () => {
      const wrapper = mountComponent()
      const fields = wrapper.vm.emailFields

      expect(fields.map((f) => f.key)).toContain('email_type')
      expect(fields.map((f) => f.key)).toContain('subject')
      expect(fields.map((f) => f.key)).toContain('sent_at')
      expect(fields.map((f) => f.key)).toContain('opened_at')
      expect(fields.map((f) => f.key)).toContain('clicked_at')
      expect(fields.map((f) => f.key)).toContain('bounced_at')
      expect(fields.map((f) => f.key)).toContain('unsubscribed_at')
    })
  })
})
