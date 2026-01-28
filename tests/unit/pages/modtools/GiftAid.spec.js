import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'

import GiftAid from '~/modtools/pages/giftaid.vue'

// Mock $api
const mockApi = {
  giftaid: {
    list: vi.fn().mockResolvedValue([]),
    search: vi.fn().mockResolvedValue([]),
  },
}

// Mock useNuxtApp before importing the component
vi.mock('#app', () => ({
  useNuxtApp: () => ({
    $api: mockApi,
  }),
}))

// Mock donation store
const mockDonationStore = {
  add: vi.fn().mockResolvedValue(123),
}

// Mock user store
const mockUserStore = {
  fetchMT: vi.fn().mockResolvedValue({}),
  byId: vi.fn().mockReturnValue(null),
}

vi.mock('~/stores/donations', () => ({
  useDonationStore: () => mockDonationStore,
}))

vi.mock('~/stores/user', () => ({
  useUserStore: () => mockUserStore,
}))

describe('GiftAid Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockApi.giftaid.list.mockResolvedValue([])
    mockApi.giftaid.search.mockResolvedValue([])
    mockUserStore.byId.mockReturnValue(null)
  })

  function mountComponent() {
    return mount(GiftAid, {
      global: {
        stubs: {
          'b-container': { template: '<div class="container"><slot /></div>' },
          'b-card': {
            template: '<div class="card"><slot /></div>',
            props: ['noBody'],
          },
          'b-card-body': { template: '<div class="card-body"><slot /></div>' },
          'b-input-group': {
            template:
              '<div class="input-group"><slot /><slot name="append" /></div>',
          },
          'b-form-input': {
            template:
              '<input class="form-input" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" @keyup="$emit(\'keyup\', $event)" />',
            props: ['modelValue', 'type', 'placeholder'],
          },
          'b-form-textarea': {
            template:
              '<textarea class="form-textarea" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)"></textarea>',
            props: ['modelValue', 'rows'],
          },
          SpinButton: {
            template:
              '<button class="spin-button" @click="$emit(\'handle\', () => {})"><slot /></button>',
            props: ['variant', 'iconName', 'label', 'disabled'],
          },
          NoticeMessage: {
            template:
              '<div class="notice-message" :class="variant"><slot /></div>',
            props: ['variant'],
          },
          ModHelpGiftAid: { template: '<div class="help-giftaid"></div>' },
          ModGiftAid: {
            template: '<div class="mod-giftaid" :data-id="giftaid.id"></div>',
            props: ['giftaid'],
          },
          OurDatePicker: {
            template:
              '<input class="date-picker" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
            props: ['modelValue', 'lang', 'type', 'format', 'placeholder'],
          },
          ExternalLink: {
            template: '<a class="external-link"><slot /></a>',
            props: ['href'],
          },
          'v-icon': { template: '<i :data-icon="icon"></i>', props: ['icon'] },
        },
        mocks: {
          $api: mockApi,
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders ModHelpGiftAid component', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.help-giftaid').exists()).toBe(true)
    })

    it('renders search section', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('search for existing Gift Aid')
    })

    it('renders donation recording section', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('record a donation')
    })

    it('renders CSV upload section', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('paste in a CSV file')
    })

    it('shows no gift aid message when giftaids array is empty', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('No gift aid to review')
    })
  })

  describe('mounted lifecycle', () => {
    it('fetches gift aid list on mount', async () => {
      mountComponent()
      await flushPromises()

      expect(mockApi.giftaid.list).toHaveBeenCalled()
    })

    it('sorts giftaids with easy ones first (postcode or full name)', async () => {
      mockApi.giftaid.list.mockResolvedValue([
        { id: 1, fullname: 'John', postcode: null },
        { id: 2, fullname: 'Jane Doe', postcode: 'AB1 2CD' },
        { id: 3, fullname: 'Bob Smith', postcode: null },
      ])

      const wrapper = mountComponent()
      await flushPromises()

      // Items with postcode or space in name should be first
      expect(wrapper.vm.giftaids[0].id).toBe(2) // has postcode
      expect(wrapper.vm.giftaids[1].id).toBe(3) // has space in name
      expect(wrapper.vm.giftaids[2].id).toBe(1) // neither
    })
  })

  describe('search functionality', () => {
    it('has search input', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.search).toBeNull()
    })

    it('calls giftaid.search when doSearch is invoked', async () => {
      const wrapper = mountComponent()
      wrapper.vm.search = 'test search'

      const callback = vi.fn()
      await wrapper.vm.doSearch(callback)

      expect(mockApi.giftaid.search).toHaveBeenCalledWith('test search')
      expect(callback).toHaveBeenCalled()
    })

    it('updates results after search', async () => {
      mockApi.giftaid.search.mockResolvedValue([
        { id: 1, fullname: 'Test User', email: 'test@example.com' },
      ])

      const wrapper = mountComponent()
      wrapper.vm.search = 'test'

      await wrapper.vm.doSearch(() => {})

      expect(wrapper.vm.results).toHaveLength(1)
      expect(wrapper.vm.results[0].fullname).toBe('Test User')
    })

    it('triggers search on Enter key via keyup event', async () => {
      const wrapper = mountComponent()

      // Set search value via the input
      const input = wrapper.find('.form-input')
      await input.setValue('test query')

      // Trigger keyup with Enter key
      await input.trigger('keyup', { keyCode: 13 })
      await flushPromises()

      // Should have called the search API
      expect(mockApi.giftaid.search).toHaveBeenCalledWith('test query')
    })

    it('does not trigger search on other keys', () => {
      const wrapper = mountComponent()
      vi.clearAllMocks()

      const event = { keyCode: 65 } // 'A' key
      wrapper.vm.checkSearch(event)

      expect(mockApi.giftaid.search).not.toHaveBeenCalled()
    })
  })

  describe('record donation', () => {
    it('has required fields for recording donation', () => {
      const wrapper = mountComponent()

      expect(wrapper.vm.userid).toBeNull()
      expect(wrapper.vm.amount).toBeNull()
      expect(wrapper.vm.date).toBeInstanceOf(Date)
    })

    it('calls donationStore.add when all fields are filled', () => {
      const wrapper = mountComponent()
      wrapper.vm.userid = 123
      wrapper.vm.amount = 10.5
      wrapper.vm.date = new Date('2024-01-15')

      const callback = vi.fn()
      wrapper.vm.recordDonation(callback)

      expect(mockDonationStore.add).toHaveBeenCalledWith(
        123,
        10.5,
        expect.any(String) // ISO date string
      )
      expect(callback).toHaveBeenCalled()
    })

    it('does not call donationStore.add when userid is missing', () => {
      const wrapper = mountComponent()
      wrapper.vm.userid = null
      wrapper.vm.amount = 10
      wrapper.vm.date = new Date()

      wrapper.vm.recordDonation(() => {})

      expect(mockDonationStore.add).not.toHaveBeenCalled()
    })

    it('allows zero amount (for badge-only)', () => {
      const wrapper = mountComponent()
      wrapper.vm.userid = 123
      wrapper.vm.amount = 0
      wrapper.vm.date = new Date()

      wrapper.vm.recordDonation(() => {})

      expect(mockDonationStore.add).toHaveBeenCalled()
    })
  })

  describe('CSV validation', () => {
    it('has CSV-related state', () => {
      const wrapper = mountComponent()

      expect(wrapper.vm.csv).toBeNull()
      expect(wrapper.vm.csvError).toBeNull()
      expect(wrapper.vm.csvTrace).toBeNull()
      expect(wrapper.vm.showSubmitCSV).toBe(false)
      expect(wrapper.vm.disableSubmitCSV).toBe(false)
      expect(wrapper.vm.csvDonations).toEqual([])
    })

    it('shows error when CSV is not comma separated', async () => {
      const wrapper = mountComponent()
      wrapper.vm.csv = 'Date;Amt;Name'

      await wrapper.vm.validateCSVDonations(() => {})

      expect(wrapper.vm.csvError).toContain('comma separated')
    })

    it('shows error when no data found', async () => {
      const wrapper = mountComponent()
      wrapper.vm.csv = ''

      await wrapper.vm.validateCSVDonations(() => {})

      expect(wrapper.vm.csvError).toContain('No data found')
    })

    it('shows error when wrong number of columns', async () => {
      const wrapper = mountComponent()
      wrapper.vm.csv = 'Date,Amt,Name'

      await wrapper.vm.validateCSVDonations(() => {})

      expect(wrapper.vm.csvError).toContain('Expecting 8 columns')
    })

    it('shows error when Date header is missing', async () => {
      const wrapper = mountComponent()
      wrapper.vm.csv =
        'Wrong,Amt,Name on Xero,ID / GA from Mod Tools,email,212 Reg,GA?,Name & Ref'

      await wrapper.vm.validateCSVDonations(() => {})

      expect(wrapper.vm.csvError).toContain(
        "Expecting first column in first row to be 'Date'"
      )
    })

    it('shows error when Amt header is missing', async () => {
      const wrapper = mountComponent()
      wrapper.vm.csv =
        'Date,Wrong,Name on Xero,ID / GA from Mod Tools,email,212 Reg,GA?,Name & Ref'

      await wrapper.vm.validateCSVDonations(() => {})

      expect(wrapper.vm.csvError).toContain(
        "Expecting second column in first row to be 'Amt'"
      )
    })
  })

  describe('displaying results', () => {
    it('renders ModGiftAid components for each giftaid', async () => {
      mockApi.giftaid.list.mockResolvedValue([
        { id: 1, fullname: 'User 1', postcode: 'AB1' },
        { id: 2, fullname: 'User 2', postcode: 'CD2' },
      ])

      const wrapper = mountComponent()
      await flushPromises()

      const giftaidComponents = wrapper.findAll('.mod-giftaid')
      expect(giftaidComponents).toHaveLength(2)
    })
  })
})
