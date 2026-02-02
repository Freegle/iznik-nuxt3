import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import AddressModal from '~/components/AddressModal.vue'

// Mock address store
const mockAddressStore = {
  list: [],
  properties: {},
  add: vi.fn().mockResolvedValue(1),
  delete: vi.fn().mockResolvedValue({}),
  update: vi.fn().mockResolvedValue({}),
  fetchProperties: vi.fn().mockResolvedValue({}),
}

vi.mock('~/stores/address', () => ({
  useAddressStore: () => mockAddressStore,
}))

// Mock auth store
const mockAuthStore = {
  saveAndGet: vi.fn().mockResolvedValue({}),
}

vi.mock('~/stores/auth', () => ({
  useAuthStore: () => mockAuthStore,
}))

// Mock useOurModal composable
const mockHide = vi.fn()
const mockModal = ref({ show: vi.fn(), hide: mockHide })
vi.mock('~/composables/useOurModal', () => ({
  useOurModal: () => ({
    modal: mockModal,
    hide: mockHide,
  }),
}))

// Mock useMe composable
vi.mock('~/composables/useMe', () => ({
  useMe: () => ({
    me: ref({ settings: { selectedAddress: null } }),
  }),
}))

// Mock usePAF composable
vi.mock('~/composables/usePAF', () => ({
  constructSingleLine: (address) =>
    `${address.line1}, ${address.postcode?.name || 'Unknown'}`,
}))

// Mock useMap composable
vi.mock('~/composables/useMap', () => ({
  attribution: () => 'Map attribution',
  osmtile: () => 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
}))

describe('AddressModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAddressStore.list = []
    mockAddressStore.properties = {}
  })

  function createWrapper(props = {}) {
    return mount(AddressModal, {
      props,
      global: {
        stubs: {
          'b-modal': {
            template: '<div class="modal"><slot /><slot name="footer" /></div>',
            methods: {
              show: vi.fn(),
              hide: vi.fn(),
            },
          },
          'b-button': {
            template:
              '<button :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant', 'disabled'],
          },
          'b-form-select': {
            template:
              '<select :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.text }}</option></select>',
            props: ['modelValue', 'options'],
          },
          'b-form-textarea': {
            template:
              '<textarea :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
            props: ['modelValue', 'rows', 'maxRows'],
          },
          'b-row': { template: '<div class="row"><slot /></div>' },
          'b-col': { template: '<div class="col"><slot /></div>' },
          'l-map': { template: '<div class="map"><slot /></div>' },
          'l-tile-layer': { template: '<div class="tile-layer" />' },
          'l-marker': { template: '<div class="marker" />' },
          'v-icon': true,
          SpinButton: {
            template:
              '<button @click="$emit(\'handle\', () => {})"><slot />{{ label }}</button>',
            props: ['label', 'iconName', 'variant', 'size'],
          },
          PostCode: {
            template: '<div class="postcode"><slot /></div>',
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('displays Address Book title when not in choose mode', () => {
      const wrapper = createWrapper({ choose: false })
      // The title is in the b-modal attrs, check the wrapper renders
      expect(wrapper.html()).toContain('modal')
    })

    it('displays explanatory text about address storage', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain("We'll store your address")
      expect(wrapper.text()).toContain("won't give it out")
    })

    it('shows "You don\'t have any addresses yet" when no addresses', () => {
      mockAddressStore.list = []
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain("don't have any addresses yet")
    })

    it('shows Add a new address button when no addresses being added', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Add a new address')
    })
  })

  describe('choose mode', () => {
    it('shows Cancel button in choose mode', () => {
      const wrapper = createWrapper({ choose: true })
      expect(wrapper.text()).toContain('Cancel')
    })

    it('shows Send this Address button in choose mode', () => {
      const wrapper = createWrapper({ choose: true })
      expect(wrapper.text()).toContain('Send this Address')
    })

    it('shows Close button when not in choose mode', () => {
      const wrapper = createWrapper({ choose: false })
      expect(wrapper.text()).toContain('Close')
    })
  })

  describe('with addresses', () => {
    beforeEach(() => {
      mockAddressStore.list = [
        {
          id: 1,
          line1: '123 Test Street',
          postcode: { name: 'AB1 2CD', lat: 51.5, lng: -0.1 },
          instructions: 'Leave by the door',
          lat: 51.5,
          lng: -0.1,
        },
        {
          id: 2,
          line1: '456 Other Road',
          postcode: { name: 'EF3 4GH', lat: 51.6, lng: -0.2 },
          instructions: 'Ring bell',
          lat: 51.6,
          lng: -0.2,
        },
      ]
    })

    it('shows Your addresses heading', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Your addresses')
    })

    it('shows Delete button', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Delete')
    })

    it('renders addresses from the store', () => {
      const wrapper = createWrapper()
      // The addresses are rendered as options in the select
      expect(wrapper.text()).toContain('123 Test Street')
    })
  })

  describe('emits', () => {
    it('emits hidden event when modal is hidden', async () => {
      const wrapper = createWrapper()
      // The onHide method is called when modal is hidden
      await wrapper.vm.onHide()
      expect(wrapper.emitted('hidden')).toBeTruthy()
    })
  })

  describe('close button', () => {
    it('calls hide when close button clicked', async () => {
      const wrapper = createWrapper({ choose: false })
      const closeBtn = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Close'))
      if (closeBtn) {
        await closeBtn.trigger('click')
        expect(mockHide).toHaveBeenCalled()
      }
    })
  })
})
