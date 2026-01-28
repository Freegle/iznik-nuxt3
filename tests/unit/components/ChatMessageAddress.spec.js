import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ChatMessageAddress from '~/components/ChatMessageAddress.vue'

const { mockOtheruser, mockChatmessage, mockMe } = vi.hoisted(() => {
  const { ref } = require('vue')
  return {
    mockOtheruser: ref({ displayname: 'Other User' }),
    mockChatmessage: ref({
      id: 100,
      userid: 2,
      message: '123',
    }),
    mockMe: ref({ id: 1 }),
  }
})

const mockAddressStore = {
  fetch: vi.fn(),
}

const mockChatStore = {
  fetchMessages: vi.fn(),
  send: vi.fn(),
}

vi.mock('~/composables/useChat', () => ({
  useChatMessageBase: () => ({
    otheruser: mockOtheruser,
    chatmessage: mockChatmessage,
    me: mockMe,
  }),
}))

vi.mock('~/stores/address', () => ({
  useAddressStore: () => mockAddressStore,
}))

vi.mock('~/stores/chat', () => ({
  useChatStore: () => mockChatStore,
}))

vi.mock('~/composables/usePAF', () => ({
  constructMultiLine: vi.fn((addr) => {
    if (!addr) return ''
    return `${addr.line1 || ''}\n${addr.line2 || ''}\n${
      addr.postcode || ''
    }`.trim()
  }),
}))

vi.mock('~/composables/useMap', () => ({
  attribution: () => '© OpenStreetMap',
  osmtile: () => 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
}))

vi.mock('~/constants', () => ({
  MAX_MAP_ZOOM: 18,
}))

describe('ChatMessageAddress', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockOtheruser.value = { displayname: 'Other User' }
    mockChatmessage.value = {
      id: 100,
      userid: 2,
      message: '123',
    }
    mockMe.value = { id: 1 }
    mockAddressStore.fetch.mockResolvedValue({
      id: 123,
      line1: '10 Main Street',
      line2: 'Anytown',
      postcode: 'AB12 3CD',
      lat: 51.5074,
      lng: -0.1278,
      instructions: 'Ring the bell twice',
    })
  })

  function createWrapper(props = {}) {
    return mount(ChatMessageAddress, {
      props: {
        chatid: 1,
        id: 100,
        ...props,
      },
      global: {
        stubs: {
          'b-row': {
            template: '<div class="b-row"><slot /></div>',
          },
          'b-col': {
            template:
              '<div class="b-col" :cols="cols" :sm="sm" :offsetSm="offsetSm"><slot /></div>',
            props: ['cols', 'sm', 'offsetSm'],
          },
          'b-card': {
            template:
              '<div class="b-card" :class="borderVariant"><slot /></div>',
            props: ['borderVariant'],
          },
          'b-card-title': {
            template: '<div class="b-card-title"><slot /></div>',
          },
          'b-card-text': {
            template: '<div class="b-card-text"><slot /></div>',
          },
          'b-button': {
            template:
              '<button class="b-button" :class="variant" @click="$emit(\'click\', $event)"><slot /></button>',
            props: ['variant'],
          },
          'l-map': {
            template: '<div class="l-map" :data-zoom="zoom"><slot /></div>',
            props: ['zoom', 'maxZoom', 'center', 'style'],
          },
          'l-tile-layer': {
            template: '<div class="l-tile-layer" />',
            props: ['url', 'attribution'],
          },
          'l-marker': {
            template: '<div class="l-marker" />',
            props: ['latLng', 'interactive'],
          },
          ExternalLink: {
            template: '<a class="external-link" :href="href"><slot /></a>',
            props: ['href'],
          },
          AddressModal: {
            template: '<div class="address-modal" />',
            props: ['choose'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders b-row container', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.b-row').exists()).toBe(true)
    })

    it('renders b-card with success border', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.b-card').exists()).toBe(true)
    })
  })

  describe('props', () => {
    it('requires chatid prop', () => {
      const wrapper = createWrapper({ chatid: 5 })
      expect(wrapper.props('chatid')).toBe(5)
    })

    it('requires id prop', () => {
      const wrapper = createWrapper({ id: 200 })
      expect(wrapper.props('id')).toBe(200)
    })

    it('has default pov of null', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('pov')).toBe(null)
    })

    it('accepts pov prop', () => {
      const wrapper = createWrapper({ pov: 3 })
      expect(wrapper.props('pov')).toBe(3)
    })
  })

  describe('received address (from other user)', () => {
    beforeEach(() => {
      mockChatmessage.value.userid = 2
      mockMe.value = { id: 1 }
    })

    it('shows "sent an address" heading', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('sent an address')
    })

    it('shows other user name', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Other User')
    })
  })

  describe('sent address (from current user)', () => {
    beforeEach(() => {
      mockChatmessage.value.userid = 1
      mockMe.value = { id: 1 }
    })

    it('shows "You sent an address" heading', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('You sent an address')
    })

    it('shows address book text', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('address book')
    })

    it('shows address book help text', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain(
        'Your address book lets you easily send addresses'
      )
    })
  })

  describe('computed properties', () => {
    it('computes maxZoom from constant', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.maxZoom).toBe(18)
    })
  })

  describe('reactive state', () => {
    it('initializes showAddress as false', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.showAddress).toBe(false)
    })

    it('initializes address as null', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.address).toBe(null)
    })
  })

  describe('methods', () => {
    beforeEach(() => {
      mockChatmessage.value.userid = 1
      mockMe.value = { id: 1 }
    })

    it('editAddress fetches addresses and shows modal', async () => {
      const wrapper = createWrapper()
      await wrapper.vm.editAddress()
      expect(mockAddressStore.fetch).toHaveBeenCalled()
      expect(wrapper.vm.showAddress).toBe(true)
    })

    it('addressClosed fetches messages and hides modal', async () => {
      const wrapper = createWrapper()
      wrapper.vm.showAddress = true
      await wrapper.vm.addressClosed()
      expect(mockChatStore.fetchMessages).toHaveBeenCalledWith(1)
      expect(wrapper.vm.showAddress).toBe(false)
    })

    it('sendAddress sends address to chat and hides modal', async () => {
      const wrapper = createWrapper()
      wrapper.vm.showAddress = true
      await wrapper.vm.sendAddress(456)
      expect(mockChatStore.send).toHaveBeenCalledWith(1, null, 456)
      expect(wrapper.vm.showAddress).toBe(false)
    })
  })

  describe('address display', () => {
    it('shows deleted message when address is null', async () => {
      mockAddressStore.fetch.mockResolvedValue(null)
      const wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toContain('deleted')
    })
  })

  describe('AddressModal', () => {
    beforeEach(() => {
      mockChatmessage.value.userid = 1
      mockMe.value = { id: 1 }
    })

    it('renders AddressModal when showAddress is true', async () => {
      const wrapper = createWrapper()
      wrapper.vm.showAddress = true
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.address-modal').exists()).toBe(true)
    })

    it('does not render AddressModal when showAddress is false', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.address-modal').exists()).toBe(false)
    })
  })
})
