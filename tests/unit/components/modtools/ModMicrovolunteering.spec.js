import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import ModMicrovolunteering from '~/modtools/components/ModMicrovolunteering.vue'

// Mock the microvolunteering store
const mockMicroVolunteeringStore = {
  byId: vi.fn(),
}

vi.mock('~/stores/microvolunteering', () => ({
  useMicroVolunteeringStore: () => mockMicroVolunteeringStore,
}))

describe('ModMicrovolunteering', () => {
  // Sample microvolunteering items for testing
  const rotatedImageItem = {
    id: 1,
    timestamp: '2024-01-15T10:00:00Z',
    result: 'Reject',
    rotatedimage: {
      msgid: 123,
      thumb: 'https://example.com/thumb.jpg',
    },
    message: null,
    item1: null,
    item2: null,
  }

  const approvedRotatedImageItem = {
    id: 2,
    timestamp: '2024-01-15T11:00:00Z',
    result: 'Approve',
    rotatedimage: {
      msgid: 124,
      thumb: 'https://example.com/thumb2.jpg',
    },
    message: null,
    item1: null,
    item2: null,
  }

  const messageApproveItem = {
    id: 3,
    timestamp: '2024-01-15T12:00:00Z',
    result: 'Approve',
    rotatedimage: null,
    message: {
      id: 200,
      subject: 'OFFER: Sofa',
    },
    item1: null,
    item2: null,
  }

  const messageRejectCouldBeBetterItem = {
    id: 4,
    timestamp: '2024-01-15T13:00:00Z',
    result: 'Reject',
    rotatedimage: null,
    message: {
      id: 201,
      subject: 'WANTED: Chair',
    },
    msgcategory: 'CouldBeBetter',
    comments: null,
    item1: null,
    item2: null,
  }

  const messageRejectShouldntBeHereItem = {
    id: 5,
    timestamp: '2024-01-15T14:00:00Z',
    result: 'Reject',
    rotatedimage: null,
    message: {
      id: 202,
      subject: 'OFFER: Car',
    },
    msgcategory: 'ShouldntBeHere',
    comments: null,
    item1: null,
    item2: null,
  }

  const messageRejectWithCommentsItem = {
    id: 6,
    timestamp: '2024-01-15T15:00:00Z',
    result: 'Reject',
    rotatedimage: null,
    message: {
      id: 203,
      subject: 'OFFER: Table',
    },
    msgcategory: 'CouldBeBetter',
    comments: 'This looks like spam',
    item1: null,
    item2: null,
  }

  const relatedItemsItem = {
    id: 7,
    timestamp: '2024-01-15T16:00:00Z',
    result: null,
    rotatedimage: null,
    message: null,
    item1: { name: 'chair' },
    item2: { name: 'table' },
  }

  function mountComponent(id = 1) {
    return mount(ModMicrovolunteering, {
      props: {
        id,
      },
      global: {
        stubs: {
          'b-card': {
            template:
              '<div class="b-card"><slot /><slot name="header" /><slot name="footer" /></div>',
            props: ['noBody'],
          },
          'b-card-body': {
            template: '<div class="b-card-body"><slot /></div>',
          },
          'b-img': {
            template: '<img :src="src" :class="{ thumbnail }" class="b-img" />',
            props: ['thumbnail', 'src'],
          },
          NuxtLink: {
            template: '<a :href="to" class="nuxt-link"><slot /></a>',
            props: ['to'],
          },
          'v-icon': {
            template: '<i :class="icon" class="v-icon" />',
            props: ['icon', 'scale'],
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders id prop value', async () => {
      mockMicroVolunteeringStore.byId.mockReturnValue(rotatedImageItem)
      const wrapper = mountComponent(1)
      await flushPromises()
      expect(wrapper.text()).toContain('1')
    })

    it('shows "NO ITEM" when item not found', async () => {
      mockMicroVolunteeringStore.byId.mockReturnValue(null)
      const wrapper = mountComponent(999)
      await flushPromises()
      expect(wrapper.text()).toContain('NO ITEM')
    })

    it('renders b-card when item exists', async () => {
      mockMicroVolunteeringStore.byId.mockReturnValue(rotatedImageItem)
      const wrapper = mountComponent(1)
      await flushPromises()
      expect(wrapper.find('.b-card').exists()).toBe(true)
    })

    it('does not render b-card when item is null', async () => {
      mockMicroVolunteeringStore.byId.mockReturnValue(null)
      const wrapper = mountComponent(999)
      await flushPromises()
      expect(wrapper.find('.b-card').exists()).toBe(false)
    })

    it('displays formatted timestamp', async () => {
      mockMicroVolunteeringStore.byId.mockReturnValue(rotatedImageItem)
      const wrapper = mountComponent(1)
      await flushPromises()
      expect(wrapper.text()).toContain('formatted:2024-01-15T10:00:00Z')
    })
  })

  describe('rotated image actions', () => {
    it('shows "no need to rotate photo" for approved rotation', async () => {
      mockMicroVolunteeringStore.byId.mockReturnValue(approvedRotatedImageItem)
      const wrapper = mountComponent(2)
      await flushPromises()
      expect(wrapper.text()).toContain('no need to rotate photo')
    })

    it('shows "rotated photo" for rejected rotation', async () => {
      mockMicroVolunteeringStore.byId.mockReturnValue(rotatedImageItem)
      const wrapper = mountComponent(1)
      await flushPromises()
      expect(wrapper.text()).toContain('rotated photo')
    })

    it('shows "(current photo shown)" note for rejected rotation', async () => {
      mockMicroVolunteeringStore.byId.mockReturnValue(rotatedImageItem)
      const wrapper = mountComponent(1)
      await flushPromises()
      expect(wrapper.text()).toContain('(current photo shown)')
    })

    it('renders thumbnail image for rotated image item', async () => {
      mockMicroVolunteeringStore.byId.mockReturnValue(rotatedImageItem)
      const wrapper = mountComponent(1)
      await flushPromises()
      const img = wrapper.find('.b-img')
      expect(img.exists()).toBe(true)
      expect(img.attributes('src')).toBe('https://example.com/thumb.jpg')
    })

    it('links to message for rotated image item', async () => {
      mockMicroVolunteeringStore.byId.mockReturnValue(rotatedImageItem)
      const wrapper = mountComponent(1)
      await flushPromises()
      const link = wrapper.find('a.nuxt-link')
      expect(link.exists()).toBe(true)
      expect(link.attributes('href')).toBe('/message/123')
    })
  })

  describe('message review actions', () => {
    it('shows "thinks message looks ok" for approved message', async () => {
      mockMicroVolunteeringStore.byId.mockReturnValue(messageApproveItem)
      const wrapper = mountComponent(3)
      await flushPromises()
      expect(wrapper.text()).toContain('thinks message looks ok')
    })

    it('shows "thinks this message could be better" for CouldBeBetter category', async () => {
      mockMicroVolunteeringStore.byId.mockReturnValue(
        messageRejectCouldBeBetterItem
      )
      const wrapper = mountComponent(4)
      await flushPromises()
      expect(wrapper.text()).toContain('thinks this message could be better')
    })

    it('shows "thinks this message shouldn\'t be on Freegle" for ShouldntBeHere category', async () => {
      mockMicroVolunteeringStore.byId.mockReturnValue(
        messageRejectShouldntBeHereItem
      )
      const wrapper = mountComponent(5)
      await flushPromises()
      expect(wrapper.text()).toContain(
        "thinks this message shouldn't be on Freegle"
      )
    })

    it('shows "with comment:" when comments exist', async () => {
      mockMicroVolunteeringStore.byId.mockReturnValue(
        messageRejectWithCommentsItem
      )
      const wrapper = mountComponent(6)
      await flushPromises()
      expect(wrapper.text()).toContain('with comment:')
    })

    it('renders message link with id and subject', async () => {
      mockMicroVolunteeringStore.byId.mockReturnValue(messageApproveItem)
      const wrapper = mountComponent(3)
      await flushPromises()
      const link = wrapper.find('a.nuxt-link')
      expect(link.exists()).toBe(true)
      expect(link.attributes('href')).toBe('/message/200')
      expect(wrapper.text()).toContain('200')
      expect(wrapper.text()).toContain('OFFER: Sofa')
    })

    it('renders hashtag icon for message items', async () => {
      mockMicroVolunteeringStore.byId.mockReturnValue(messageApproveItem)
      const wrapper = mountComponent(3)
      await flushPromises()
      expect(wrapper.find('.v-icon').exists()).toBe(true)
    })
  })

  describe('related items actions', () => {
    it('shows "marked as related" for item1/item2 items', async () => {
      mockMicroVolunteeringStore.byId.mockReturnValue(relatedItemsItem)
      const wrapper = mountComponent(7)
      await flushPromises()
      expect(wrapper.text()).toContain('marked as related')
    })

    it('displays both item names', async () => {
      mockMicroVolunteeringStore.byId.mockReturnValue(relatedItemsItem)
      const wrapper = mountComponent(7)
      await flushPromises()
      expect(wrapper.text()).toContain('chair')
      expect(wrapper.text()).toContain('and')
      expect(wrapper.text()).toContain('table')
    })
  })

  describe('computed property: item', () => {
    it('calls store.byId with the id prop', async () => {
      mockMicroVolunteeringStore.byId.mockReturnValue(rotatedImageItem)
      mountComponent(42)
      await flushPromises()
      expect(mockMicroVolunteeringStore.byId).toHaveBeenCalledWith(42)
    })

    it('reacts to prop changes', async () => {
      mockMicroVolunteeringStore.byId.mockReturnValue(rotatedImageItem)
      const wrapper = mountComponent(1)
      await flushPromises()

      mockMicroVolunteeringStore.byId.mockReturnValue(messageApproveItem)
      await wrapper.setProps({ id: 3 })
      await flushPromises()

      expect(mockMicroVolunteeringStore.byId).toHaveBeenCalledWith(3)
    })
  })

  describe('CSS styling considerations', () => {
    it('applies thumb class to rotated image', async () => {
      mockMicroVolunteeringStore.byId.mockReturnValue(rotatedImageItem)
      const wrapper = mountComponent(1)
      await flushPromises()
      const img = wrapper.find('.b-img')
      expect(img.classes()).toContain('thumb')
    })

    it('has layout container with grid classes', async () => {
      mockMicroVolunteeringStore.byId.mockReturnValue(rotatedImageItem)
      const wrapper = mountComponent(1)
      await flushPromises()
      expect(wrapper.find('.layout').exists()).toBe(true)
    })

    it('has date section with small class', async () => {
      mockMicroVolunteeringStore.byId.mockReturnValue(rotatedImageItem)
      const wrapper = mountComponent(1)
      await flushPromises()
      expect(wrapper.find('.date.small').exists()).toBe(true)
    })

    it('has action section with font-italic class', async () => {
      mockMicroVolunteeringStore.byId.mockReturnValue(rotatedImageItem)
      const wrapper = mountComponent(1)
      await flushPromises()
      expect(wrapper.find('.action.font-italic').exists()).toBe(true)
    })

    it('has object section', async () => {
      mockMicroVolunteeringStore.byId.mockReturnValue(rotatedImageItem)
      const wrapper = mountComponent(1)
      await flushPromises()
      expect(wrapper.find('.object').exists()).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('handles item with no action type (empty object section)', async () => {
      const emptyItem = {
        id: 8,
        timestamp: '2024-01-15T17:00:00Z',
        result: null,
        rotatedimage: null,
        message: null,
        item1: null,
        item2: null,
      }
      mockMicroVolunteeringStore.byId.mockReturnValue(emptyItem)
      const wrapper = mountComponent(8)
      await flushPromises()
      expect(wrapper.find('.b-card').exists()).toBe(true)
      expect(wrapper.find('.object').exists()).toBe(true)
    })

    it('handles message without msgcategory', async () => {
      const messageNoCategory = {
        id: 9,
        timestamp: '2024-01-15T18:00:00Z',
        result: 'Reject',
        rotatedimage: null,
        message: {
          id: 300,
          subject: 'Test message',
        },
        msgcategory: null,
        comments: null,
        item1: null,
        item2: null,
      }
      mockMicroVolunteeringStore.byId.mockReturnValue(messageNoCategory)
      const wrapper = mountComponent(9)
      await flushPromises()
      // Should not show specific category message when msgcategory is null
      expect(wrapper.text()).not.toContain(
        'thinks this message could be better'
      )
      expect(wrapper.text()).not.toContain(
        "thinks this message shouldn't be on Freegle"
      )
    })
  })
})
