import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import AddressBookSection from '~/components/settings/AddressBookSection.vue'

const mockAddressStore = {
  fetch: vi.fn().mockResolvedValue([]),
}

vi.mock('~/stores/address', () => ({
  useAddressStore: () => mockAddressStore,
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
              '<button class="b-button" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant', 'size'],
            emits: ['click'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders settings section', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.settings-section').exists()).toBe(true)
    })

    it('shows section header with Address Book title', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Address Book')
    })

    it('shows address-book icon', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('[data-icon="address-book"]').exists()).toBe(true)
    })

    it('shows private badge with lock icon', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.private-badge').exists()).toBe(true)
      expect(wrapper.find('[data-icon="lock"]').exists()).toBe(true)
      expect(wrapper.text()).toContain('Private')
    })

    it('shows description text', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Save your address')
    })

    it('shows Open Address Book button', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Open Address Book')
    })
  })

  describe('button interaction', () => {
    it('fetches addresses on button click', async () => {
      const wrapper = createWrapper()
      await wrapper.find('.b-button').trigger('click')
      await flushPromises()
      expect(mockAddressStore.fetch).toHaveBeenCalled()
    })

    it('emits show-address-modal after fetching', async () => {
      const wrapper = createWrapper()
      await wrapper.find('.b-button').trigger('click')
      await flushPromises()
      expect(wrapper.emitted('show-address-modal')).toBeTruthy()
    })
  })
})
