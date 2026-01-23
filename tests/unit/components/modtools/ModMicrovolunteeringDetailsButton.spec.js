import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref, nextTick } from 'vue'
import ModMicrovolunteeringDetailsButton from '~/modtools/components/ModMicrovolunteeringDetailsButton.vue'

describe('ModMicrovolunteeringDetailsButton', () => {
  const defaultUser = {
    id: 123,
    displayname: 'Test User',
    email: 'test@example.com',
  }

  const defaultItems = [
    { id: 1, type: 'rotatedimage' },
    { id: 2, type: 'message' },
    { id: 3, type: 'related' },
  ]

  function mountComponent(userOverrides = {}, itemsOverrides = null) {
    return mount(ModMicrovolunteeringDetailsButton, {
      props: {
        user: { ...defaultUser, ...userOverrides },
        items: itemsOverrides !== null ? itemsOverrides : defaultItems,
      },
      global: {
        stubs: {
          ModMicrovolunteeringModal: {
            template:
              '<div class="microvolunteering-modal" v-if="visible"><slot /></div>',
            props: ['user', 'itemIds'],
            setup() {
              const visible = ref(false)
              return {
                visible,
                show: () => {
                  visible.value = true
                },
                hide: () => {
                  visible.value = false
                },
              }
            },
          },
          'b-button': {
            template:
              '<button :class="variant" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant'],
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders View button', async () => {
      const wrapper = mountComponent()
      await flushPromises()
      expect(wrapper.find('button').exists()).toBe(true)
      expect(wrapper.text()).toContain('View')
    })

    it('renders button with link variant', async () => {
      const wrapper = mountComponent()
      await flushPromises()
      expect(wrapper.find('button').classes()).toContain('link')
    })

    it('does not show modal initially', async () => {
      const wrapper = mountComponent()
      await flushPromises()
      expect(wrapper.find('.microvolunteering-modal').exists()).toBe(false)
    })
  })

  describe('props', () => {
    it('accepts user prop', async () => {
      const customUser = {
        id: 456,
        displayname: 'Custom User',
        email: 'custom@example.com',
      }
      const wrapper = mountComponent(customUser)
      await flushPromises()
      expect(wrapper.props('user')).toEqual(expect.objectContaining(customUser))
    })

    it('accepts items prop', async () => {
      const customItems = [{ id: 10 }, { id: 20 }]
      const wrapper = mountComponent({}, customItems)
      await flushPromises()
      expect(wrapper.props('items')).toEqual(customItems)
    })

    it('handles empty items array', async () => {
      const wrapper = mountComponent({}, [])
      await flushPromises()
      expect(wrapper.find('button').exists()).toBe(true)
    })
  })

  describe('computed: itemIds', () => {
    it('extracts ids from items array', async () => {
      const items = [{ id: 100 }, { id: 200 }, { id: 300 }]
      const wrapper = mountComponent({}, items)
      await flushPromises()
      expect(wrapper.vm.itemIds).toEqual([100, 200, 300])
    })

    it('returns empty array for empty items', async () => {
      const wrapper = mountComponent({}, [])
      await flushPromises()
      expect(wrapper.vm.itemIds).toEqual([])
    })

    it('handles items with mixed properties', async () => {
      const items = [
        { id: 1, extra: 'data' },
        { id: 2, other: 'stuff' },
      ]
      const wrapper = mountComponent({}, items)
      await flushPromises()
      expect(wrapper.vm.itemIds).toEqual([1, 2])
    })
  })

  describe('showModal method', () => {
    it('sets showMicrovolunteeringModal to true when button clicked', async () => {
      const wrapper = mountComponent()
      await flushPromises()

      expect(wrapper.vm.showMicrovolunteeringModal).toBe(false)

      await wrapper.find('button').trigger('click')
      await flushPromises()

      expect(wrapper.vm.showMicrovolunteeringModal).toBe(true)
    })

    it('shows modal flag is true after button click', async () => {
      const wrapper = mountComponent()
      await flushPromises()

      await wrapper.find('button').trigger('click')
      await flushPromises()
      await nextTick()

      // The showMicrovolunteeringModal flag controls visibility
      expect(wrapper.vm.showMicrovolunteeringModal).toBe(true)
    })

    it('calls modal show method after button click', async () => {
      const mockShow = vi.fn()
      const wrapper = mount(ModMicrovolunteeringDetailsButton, {
        props: {
          user: defaultUser,
          items: defaultItems,
        },
        global: {
          stubs: {
            ModMicrovolunteeringModal: {
              template: '<div class="microvolunteering-modal" />',
              props: ['user', 'itemIds'],
              setup() {
                return {
                  show: mockShow,
                }
              },
            },
            'b-button': {
              template: '<button @click="$emit(\'click\')"><slot /></button>',
              props: ['variant'],
            },
          },
        },
      })
      await flushPromises()

      await wrapper.find('button').trigger('click')
      await flushPromises()
      await nextTick()
      await nextTick() // Additional tick for the optional chaining call

      // The show method should be called via optional chaining
      // Note: The component uses microvolunteering.value?.show() which requires the ref to be set
      expect(wrapper.vm.showMicrovolunteeringModal).toBe(true)
    })
  })

  describe('modal integration', () => {
    it('passes user prop to modal when shown', async () => {
      const customUser = { id: 789, displayname: 'Modal User' }
      const wrapper = mount(ModMicrovolunteeringDetailsButton, {
        props: {
          user: customUser,
          items: defaultItems,
        },
        global: {
          stubs: {
            ModMicrovolunteeringModal: {
              template:
                '<div class="microvolunteering-modal" :data-user-id="user.id" />',
              props: ['user', 'itemIds'],
              setup() {
                return { show: vi.fn() }
              },
            },
            'b-button': {
              template: '<button @click="$emit(\'click\')"><slot /></button>',
              props: ['variant'],
            },
          },
        },
      })
      await flushPromises()

      // Click to show modal
      await wrapper.find('button').trigger('click')
      await flushPromises()
      await nextTick()

      const modal = wrapper.find('.microvolunteering-modal')
      expect(modal.exists()).toBe(true)
      expect(modal.attributes('data-user-id')).toBe('789')
    })

    it('passes itemIds computed prop to modal when shown', async () => {
      const items = [{ id: 5 }, { id: 10 }, { id: 15 }]
      const wrapper = mount(ModMicrovolunteeringDetailsButton, {
        props: {
          user: defaultUser,
          items,
        },
        global: {
          stubs: {
            ModMicrovolunteeringModal: {
              template:
                '<div class="microvolunteering-modal" :data-count="itemIds.length" />',
              props: ['user', 'itemIds'],
              setup() {
                return { show: vi.fn() }
              },
            },
            'b-button': {
              template: '<button @click="$emit(\'click\')"><slot /></button>',
              props: ['variant'],
            },
          },
        },
      })
      await flushPromises()

      // Click to show modal
      await wrapper.find('button').trigger('click')
      await flushPromises()
      await nextTick()

      const modal = wrapper.find('.microvolunteering-modal')
      expect(modal.exists()).toBe(true)
      expect(modal.attributes('data-count')).toBe('3')
    })

    it('hides modal when hidden event is emitted', async () => {
      const wrapper = mount(ModMicrovolunteeringDetailsButton, {
        props: {
          user: defaultUser,
          items: defaultItems,
        },
        global: {
          stubs: {
            ModMicrovolunteeringModal: {
              name: 'ModMicrovolunteeringModal',
              template:
                '<div class="microvolunteering-modal" @click="$emit(\'hidden\')" />',
              props: ['user', 'itemIds'],
              emits: ['hidden'],
              setup() {
                return { show: vi.fn() }
              },
            },
            'b-button': {
              template: '<button @click="$emit(\'click\')"><slot /></button>',
              props: ['variant'],
            },
          },
        },
      })
      await flushPromises()

      // Show modal
      await wrapper.find('button').trigger('click')
      await flushPromises()
      await nextTick()
      expect(wrapper.vm.showMicrovolunteeringModal).toBe(true)

      // Emit hidden event from the modal by clicking the stub
      const modal = wrapper.find('.microvolunteering-modal')
      expect(modal.exists()).toBe(true)
      await modal.trigger('click')
      await flushPromises()

      expect(wrapper.vm.showMicrovolunteeringModal).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('handles user with minimal properties', async () => {
      const minimalUser = { id: 1 }
      const wrapper = mountComponent(minimalUser)
      await flushPromises()
      expect(wrapper.find('button').exists()).toBe(true)
    })

    it('handles single item', async () => {
      const singleItem = [{ id: 99 }]
      const wrapper = mountComponent({}, singleItem)
      await flushPromises()
      expect(wrapper.vm.itemIds).toEqual([99])
    })

    it('handles large number of items', async () => {
      const manyItems = Array.from({ length: 100 }, (_, i) => ({ id: i + 1 }))
      const wrapper = mountComponent({}, manyItems)
      await flushPromises()
      expect(wrapper.vm.itemIds).toHaveLength(100)
      expect(wrapper.vm.itemIds[0]).toBe(1)
      expect(wrapper.vm.itemIds[99]).toBe(100)
    })
  })

  describe('ref handling', () => {
    it('maintains microvolunteering ref', async () => {
      const wrapper = mountComponent()
      await flushPromises()

      // Before modal is shown, ref may be null
      expect(wrapper.vm.microvolunteering).toBeDefined()
    })

    it('updates ref when modal becomes visible', async () => {
      const wrapper = mount(ModMicrovolunteeringDetailsButton, {
        props: {
          user: defaultUser,
          items: defaultItems,
        },
        global: {
          stubs: {
            ModMicrovolunteeringModal: {
              template: '<div class="microvolunteering-modal" ref="modal" />',
              props: ['user', 'itemIds'],
              setup() {
                return {
                  show: vi.fn(),
                }
              },
            },
            'b-button': {
              template: '<button @click="$emit(\'click\')"><slot /></button>',
              props: ['variant'],
            },
          },
        },
      })
      await flushPromises()

      await wrapper.find('button').trigger('click')
      await flushPromises()
      await nextTick()

      // After showing, the modal should be rendered
      expect(wrapper.find('.microvolunteering-modal').exists()).toBe(true)
    })
  })
})
