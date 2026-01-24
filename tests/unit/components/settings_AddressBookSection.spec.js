import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import AddressBookSection from '~/components/settings/AddressBookSection.vue'

const mockFetch = vi.fn()

vi.mock('~/stores/address', () => ({
  useAddressStore: () => ({
    fetch: mockFetch,
  }),
}))

describe('AddressBookSection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function createWrapper() {
    return mount(AddressBookSection, {
      global: {
        stubs: {
          'v-icon': {
            template: '<span class="v-icon" :data-icon="icon" />',
            props: ['icon'],
          },
          'b-button': {
            template:
              '<button :class="variant" @click="$emit(\'click\', $event)"><slot /></button>',
            props: ['variant', 'size'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders settings section container', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.settings-section').exists()).toBe(true)
    })

    it('renders section header', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.section-header').exists()).toBe(true)
    })

    it('displays Address Book title', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('h2').text()).toBe('Address Book')
    })

    it('renders address-book icon', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.v-icon[data-icon="address-book"]').exists()).toBe(
        true
      )
    })

    it('renders lock icon for private badge', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.private-badge').exists()).toBe(true)
      expect(
        wrapper.find('.private-badge .v-icon[data-icon="lock"]').exists()
      ).toBe(true)
    })

    it('displays Private text', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Private')
    })

    it('renders section content', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.section-content').exists()).toBe(true)
    })

    it('renders description text', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.description').exists()).toBe(true)
      expect(wrapper.text()).toContain('Save your address')
      expect(wrapper.text()).toContain('quickly send it to other freeglers')
    })

    it('renders Open Address Book button', () => {
      const wrapper = createWrapper()
      const button = wrapper.find('button')
      expect(button.exists()).toBe(true)
      expect(button.text()).toBe('Open Address Book')
    })

    it('renders button with secondary variant', () => {
      const wrapper = createWrapper()
      const button = wrapper.find('button')
      expect(button.classes()).toContain('secondary')
    })
  })

  describe('addressBook method', () => {
    it('calls addressStore.fetch', async () => {
      mockFetch.mockResolvedValue(undefined)
      const wrapper = createWrapper()
      await wrapper.vm.addressBook()
      expect(mockFetch).toHaveBeenCalled()
    })

    it('emits show-address-modal after fetch', async () => {
      mockFetch.mockResolvedValue(undefined)
      const wrapper = createWrapper()
      await wrapper.vm.addressBook()
      expect(wrapper.emitted('show-address-modal')).toBeTruthy()
    })

    it('emits show-address-modal only once', async () => {
      mockFetch.mockResolvedValue(undefined)
      const wrapper = createWrapper()
      await wrapper.vm.addressBook()
      expect(wrapper.emitted('show-address-modal').length).toBe(1)
    })
  })

  describe('button interaction', () => {
    it('calls addressBook when button clicked', async () => {
      mockFetch.mockResolvedValue(undefined)
      const wrapper = createWrapper()
      const button = wrapper.find('button')
      await button.trigger('click')
      expect(mockFetch).toHaveBeenCalled()
    })

    it('emits show-address-modal when button clicked', async () => {
      mockFetch.mockResolvedValue(undefined)
      const wrapper = createWrapper()
      const button = wrapper.find('button')
      await button.trigger('click')
      expect(wrapper.emitted('show-address-modal')).toBeTruthy()
    })
  })
})
