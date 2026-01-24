import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import dayjs from 'dayjs'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import ActivityGraph from '~/components/ActivityGraph.vue'

// Set up dayjs plugins needed by the component
dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore)

const mockDashboardData = {
  Activity: [
    { date: '2024-01-01', count: 100 },
    { date: '2024-01-02', count: 150 },
    { date: '2024-01-03', count: 200 },
  ],
  ApprovedMessageCount: [
    { date: '2024-01-01', count: 50 },
    { date: '2024-01-02', count: 75 },
  ],
  ApprovedMemberCount: [
    { date: '2024-01-01', count: 1000 },
    { date: '2024-01-02', count: 1010 },
  ],
  ActiveUsers: [
    { date: '2024-01-01', count: 500 },
    { date: '2024-01-02', count: 520 },
  ],
  Replies: [
    { date: '2024-01-01', count: 30 },
    { date: '2024-01-02', count: 35 },
  ],
  MessageBreakdown: { Offer: 60, Wanted: 40 },
}

const mockApi = {
  dashboard: {
    fetch: vi.fn().mockResolvedValue(mockDashboardData),
  },
}

vi.mock('#app', () => ({
  useNuxtApp: () => ({
    $api: mockApi,
  }),
}))

vi.mock('vue-google-charts', () => ({
  GChart: {
    template: '<div class="gchart" :data-type="type"><slot /></div>',
    props: ['type', 'data', 'options'],
  },
}))

describe('ActivityGraph', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockApi.dashboard.fetch.mockResolvedValue({ ...mockDashboardData })
  })

  function createWrapper(props = {}) {
    return mount(ActivityGraph, {
      props: {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31'),
        ...props,
      },
      global: {
        stubs: {
          'b-card': {
            template: '<div class="b-card"><slot /></div>',
            props: ['variant'],
          },
          'b-card-text': {
            template: '<div class="b-card-text"><slot /></div>',
          },
          'b-form-select': {
            template:
              '<select class="b-form-select" :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.text }}</option></select>',
            props: ['modelValue', 'options'],
            emits: ['update:modelValue'],
          },
          GChart: {
            template: '<div class="gchart" :data-type="type" />',
            props: ['type', 'data', 'options'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders card container', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.find('.b-card').exists()).toBe(true)
    })

    it('shows loading state initially', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Loading...')
    })

    it('renders GChart after loading', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.find('.gchart').exists()).toBe(true)
    })
  })

  describe('graph title', () => {
    it('shows Activity as default title', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.find('h3').text()).toContain('Activity')
    })

    it('shows group name when provided', async () => {
      const wrapper = createWrapper({ groupName: 'Test Group' })
      await flushPromises()
      expect(wrapper.text()).toContain('on Test Group')
    })
  })

  describe('graph type descriptions', () => {
    it('shows Activity description', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.text()).toContain('OFFERing something')
    })

    it('shows correct description for different graph types', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      // Change graph type to Replies using the select
      const selects = wrapper.findAll('.b-form-select')
      const graphTypeSelect = selects[selects.length - 1]
      await graphTypeSelect.setValue('Replies')
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('replying to an OFFER or a WANTED')
    })
  })

  describe('graph type options', () => {
    it('includes Activity option', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.text()).toContain('Activity')
    })

    it('includes OFFERS+WANTEDs option', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.text()).toContain('OFFERS+WANTEDs')
    })

    it('includes Successful posts when successful prop is true', async () => {
      const wrapper = createWrapper({ successful: true })
      await flushPromises()
      expect(wrapper.text()).toContain('Successful posts')
    })

    it('includes OFFERs when offers prop is true', async () => {
      const wrapper = createWrapper({ offers: true })
      await flushPromises()
      expect(wrapper.text()).toContain('Just OFFERs')
    })

    it('includes WANTEDs when wanteds prop is true', async () => {
      const wrapper = createWrapper({ wanteds: true })
      await flushPromises()
      expect(wrapper.text()).toContain('Just WANTEDs')
    })

    it('includes Weight estimates when weights prop is true', async () => {
      const wrapper = createWrapper({ weights: true })
      await flushPromises()
      expect(wrapper.text()).toContain('Weight estimates')
    })

    it('includes Donations when donations prop is true', async () => {
      const wrapper = createWrapper({ donations: true })
      await flushPromises()
      expect(wrapper.text()).toContain('PayPal or Stripe Donations')
    })
  })

  describe('unit options', () => {
    it('renders unit select', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      const selects = wrapper.findAll('.b-form-select')
      expect(selects.length).toBeGreaterThan(0)
    })

    it('includes day, week, month, year options', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      const text = wrapper.text()
      expect(text).toContain('Day')
      expect(text).toContain('Week')
      expect(text).toContain('Month')
      expect(text).toContain('Year')
    })
  })

  describe('data fetching', () => {
    it('fetches dashboard data on mount', async () => {
      createWrapper()
      await flushPromises()
      expect(mockApi.dashboard.fetch).toHaveBeenCalled()
    })

    it('passes correct parameters to fetch', async () => {
      createWrapper({ groupid: 123, systemwide: false })
      await flushPromises()
      expect(mockApi.dashboard.fetch).toHaveBeenCalledWith(
        expect.objectContaining({
          group: 123,
          systemwide: false,
        })
      )
    })

    it('refetches when start date changes', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(mockApi.dashboard.fetch).toHaveBeenCalledTimes(1)

      await wrapper.setProps({ start: new Date('2024-02-01') })
      await flushPromises()
      expect(mockApi.dashboard.fetch).toHaveBeenCalledTimes(2)
    })

    it('refetches when end date changes', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(mockApi.dashboard.fetch).toHaveBeenCalledTimes(1)

      await wrapper.setProps({ end: new Date('2024-02-28') })
      await flushPromises()
      expect(mockApi.dashboard.fetch).toHaveBeenCalledTimes(2)
    })

    it('refetches when groupid changes', async () => {
      const wrapper = createWrapper({ groupid: 1 })
      await flushPromises()
      expect(mockApi.dashboard.fetch).toHaveBeenCalledTimes(1)

      await wrapper.setProps({ groupid: 2 })
      await flushPromises()
      expect(mockApi.dashboard.fetch).toHaveBeenCalledTimes(2)
    })
  })

  describe('no data state', () => {
    it('shows no data message when no data to show', async () => {
      mockApi.dashboard.fetch.mockResolvedValue({
        Activity: [],
        MessageBreakdown: { Offer: 0, Wanted: 0 },
      })
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.text()).toContain('No data for this period')
    })
  })

  describe('chart type', () => {
    it('uses LineChart for ActiveUsers', async () => {
      const wrapper = createWrapper({ activeusers: true, groupid: 123 })
      await flushPromises()

      // Find the graph type select (second select) and change to ActiveUsers
      const selects = wrapper.findAll('.b-form-select')
      const graphTypeSelect = selects[selects.length - 1]
      await graphTypeSelect.setValue('ActiveUsers')
      await wrapper.vm.$nextTick()

      const chart = wrapper.find('.gchart')
      expect(chart.attributes('data-type')).toBe('LineChart')
    })

    it('uses LineChart for ApprovedMemberCount', async () => {
      const wrapper = createWrapper({ approvedmembers: true, groupid: 123 })
      await flushPromises()

      // Find the graph type select (second select) and change to ApprovedMemberCount
      const selects = wrapper.findAll('.b-form-select')
      const graphTypeSelect = selects[selects.length - 1]
      await graphTypeSelect.setValue('ApprovedMemberCount')
      await wrapper.vm.$nextTick()

      const chart = wrapper.find('.gchart')
      expect(chart.attributes('data-type')).toBe('LineChart')
    })

    it('uses LineChart for daily units', async () => {
      // Use short date range which defaults to day units
      const wrapper = createWrapper({
        start: new Date('2024-01-01'),
        end: new Date('2024-01-15'),
      })
      await flushPromises()

      const chart = wrapper.find('.gchart')
      expect(chart.attributes('data-type')).toBe('LineChart')
    })

    it('uses ColumnChart for non-daily units', async () => {
      // Use longer date range which defaults to non-day units
      const wrapper = createWrapper({
        start: new Date('2024-01-01'),
        end: new Date('2024-06-30'),
      })
      await flushPromises()

      const chart = wrapper.find('.gchart')
      expect(chart.attributes('data-type')).toBe('ColumnChart')
    })
  })

  describe('default units calculation', () => {
    it('uses day for short duration (LineChart)', async () => {
      const wrapper = createWrapper({
        start: new Date('2024-01-01'),
        end: new Date('2024-01-15'),
      })
      await flushPromises()
      // Day units should use LineChart
      const chart = wrapper.find('.gchart')
      expect(chart.attributes('data-type')).toBe('LineChart')
    })

    it('uses week for medium duration (ColumnChart)', async () => {
      const wrapper = createWrapper({
        start: new Date('2024-01-01'),
        end: new Date('2024-02-15'),
      })
      await flushPromises()
      // Non-day units should use ColumnChart
      const chart = wrapper.find('.gchart')
      expect(chart.attributes('data-type')).toBe('ColumnChart')
    })

    it('uses month for longer duration (ColumnChart)', async () => {
      const wrapper = createWrapper({
        start: new Date('2024-01-01'),
        end: new Date('2024-12-31'),
      })
      await flushPromises()
      // Non-day units should use ColumnChart
      const chart = wrapper.find('.gchart')
      expect(chart.attributes('data-type')).toBe('ColumnChart')
    })

    it('uses year for very long duration (ColumnChart)', async () => {
      const wrapper = createWrapper({
        start: new Date('2020-01-01'),
        end: new Date('2024-12-31'),
      })
      await flushPromises()
      // Non-day units should use ColumnChart
      const chart = wrapper.find('.gchart')
      expect(chart.attributes('data-type')).toBe('ColumnChart')
    })
  })

  describe('ActiveUsers and ApprovedMemberCount visibility', () => {
    it('shows ActiveUsers option for individual group', async () => {
      const wrapper = createWrapper({ activeusers: true, groupid: 123 })
      await flushPromises()
      expect(wrapper.text()).toContain('Active Freeglers')
    })

    it('shows ApprovedMemberCount option for individual group', async () => {
      const wrapper = createWrapper({ approvedmembers: true, groupid: 123 })
      await flushPromises()
      expect(wrapper.text()).toContain('Freeglers')
    })

    it('shows options for systemwide (-2)', async () => {
      const wrapper = createWrapper({
        activeusers: true,
        approvedmembers: true,
        groupid: -2,
      })
      await flushPromises()
      expect(wrapper.text()).toContain('Active Freeglers')
      expect(wrapper.text()).toContain('Freeglers')
    })

    it('does not show ActiveUsers without groupid', async () => {
      const wrapper = createWrapper({ activeusers: true, groupid: null })
      await flushPromises()
      expect(wrapper.text()).not.toContain('Active Freeglers')
    })
  })
})
