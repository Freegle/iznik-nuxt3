import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref } from 'vue'
import ModMicrovolunteeringModal from '~/modtools/components/ModMicrovolunteeringModal.vue'

// Mock hide function that tests can spy on
const mockHide = vi.fn()
const mockShow = vi.fn()

// Override the global useOurModal mock with our custom spy
vi.mock('~/composables/useOurModal', () => ({
  useOurModal: () => ({
    modal: ref(null),
    show: mockShow,
    hide: mockHide,
  }),
}))

describe('ModMicrovolunteeringModal', () => {
  const defaultUser = {
    id: 123,
    displayname: 'Test User',
    email: 'test@example.com',
  }

  const defaultItemIds = [1, 2, 3]

  function mountComponent(userOverrides = {}, itemIdsOverrides = null) {
    return mount(ModMicrovolunteeringModal, {
      props: {
        user: { ...defaultUser, ...userOverrides },
        itemIds: itemIdsOverrides !== null ? itemIdsOverrides : defaultItemIds,
      },
      global: {
        stubs: {
          'client-only': {
            template: '<div class="client-only"><slot /></div>',
          },
          'b-modal': {
            template: `
              <div class="b-modal" :id="id" :title="title" :size="size">
                <slot />
                <slot name="footer" />
              </div>
            `,
            props: ['id', 'title', 'size'],
          },
          'b-button': {
            template:
              '<button :class="variant" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant'],
          },
          ModMicrovolunteering: {
            template: '<div class="mod-microvolunteering" :data-id="id" />',
            props: ['id'],
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders client-only wrapper', async () => {
      const wrapper = mountComponent()
      await flushPromises()
      expect(wrapper.find('.client-only').exists()).toBe(true)
    })

    it('renders b-modal inside client-only', async () => {
      const wrapper = mountComponent()
      await flushPromises()
      expect(wrapper.find('.b-modal').exists()).toBe(true)
    })

    it('renders modal with xl size', async () => {
      const wrapper = mountComponent()
      await flushPromises()
      expect(wrapper.find('.b-modal').attributes('size')).toBe('xl')
    })

    it('renders modal with correct id', async () => {
      const wrapper = mountComponent()
      await flushPromises()
      expect(wrapper.find('.b-modal').attributes('id')).toBe('aboutmemodal')
    })

    it('renders Cancel button in footer', async () => {
      const wrapper = mountComponent()
      await flushPromises()
      const button = wrapper.find('button')
      expect(button.exists()).toBe(true)
      expect(button.text()).toContain('Cancel')
    })

    it('renders Cancel button with white variant', async () => {
      const wrapper = mountComponent()
      await flushPromises()
      const button = wrapper.find('button')
      expect(button.classes()).toContain('white')
    })
  })

  describe('props', () => {
    it('handles empty itemIds array', async () => {
      const wrapper = mountComponent({}, [])
      await flushPromises()
      expect(wrapper.find('.b-modal').exists()).toBe(true)
      expect(wrapper.findAll('.mod-microvolunteering')).toHaveLength(0)
    })
  })

  describe('modal title', () => {
    it('displays user displayname in title', async () => {
      const wrapper = mountComponent({ displayname: 'Jane Doe' })
      await flushPromises()
      expect(wrapper.find('.b-modal').attributes('title')).toBe(
        'Microvolunteering for Jane Doe'
      )
    })

    it('updates title when user changes', async () => {
      const wrapper = mountComponent({ displayname: 'John' })
      await flushPromises()
      expect(wrapper.find('.b-modal').attributes('title')).toContain('John')

      await wrapper.setProps({
        user: { id: 123, displayname: 'Updated Name' },
      })
      await flushPromises()
      expect(wrapper.find('.b-modal').attributes('title')).toContain(
        'Updated Name'
      )
    })
  })

  describe('ModMicrovolunteering items', () => {
    it('renders ModMicrovolunteering for each itemId', async () => {
      const wrapper = mountComponent({}, [1, 2, 3])
      await flushPromises()
      const items = wrapper.findAll('.mod-microvolunteering')
      expect(items).toHaveLength(3)
    })

    it('passes correct id to each ModMicrovolunteering', async () => {
      const wrapper = mountComponent({}, [100, 200, 300])
      await flushPromises()
      const items = wrapper.findAll('.mod-microvolunteering')
      expect(items[0].attributes('data-id')).toBe('100')
      expect(items[1].attributes('data-id')).toBe('200')
      expect(items[2].attributes('data-id')).toBe('300')
    })

    it('uses correct key for each item', async () => {
      const wrapper = mountComponent({}, [1, 2])
      await flushPromises()
      // Items should be rendered without key conflicts
      expect(wrapper.findAll('.mod-microvolunteering')).toHaveLength(2)
    })

    it('handles single itemId', async () => {
      const wrapper = mountComponent({}, [42])
      await flushPromises()
      const items = wrapper.findAll('.mod-microvolunteering')
      expect(items).toHaveLength(1)
      expect(items[0].attributes('data-id')).toBe('42')
    })

    it('handles large number of itemIds', async () => {
      const manyIds = Array.from({ length: 50 }, (_, i) => i + 1)
      const wrapper = mountComponent({}, manyIds)
      await flushPromises()
      expect(wrapper.findAll('.mod-microvolunteering')).toHaveLength(50)
    })
  })

  describe('modal functionality', () => {
    it('exposes show method', async () => {
      const wrapper = mountComponent()
      await flushPromises()
      expect(wrapper.vm.show).toBeDefined()
      expect(typeof wrapper.vm.show).toBe('function')
    })

    it('exposes hide method', async () => {
      const wrapper = mountComponent()
      await flushPromises()
      expect(wrapper.vm.hide).toBeDefined()
      expect(typeof wrapper.vm.hide).toBe('function')
    })

    it('calls hide when Cancel button is clicked', async () => {
      const wrapper = mountComponent()
      await flushPromises()

      const button = wrapper.find('button')
      await button.trigger('click')

      expect(mockHide).toHaveBeenCalled()
    })
  })

  describe('useOurModal composable integration', () => {
    it('uses useOurModal composable', async () => {
      const wrapper = mountComponent()
      await flushPromises()
      expect(wrapper.vm.modal).toBeDefined()
      expect(wrapper.vm.hide).toBeDefined()
      expect(wrapper.vm.show).toBeDefined()
    })

    it('show method is from composable', async () => {
      const wrapper = mountComponent()
      await flushPromises()
      wrapper.vm.show()
      expect(mockShow).toHaveBeenCalled()
    })

    it('hide method is from composable', async () => {
      const wrapper = mountComponent()
      await flushPromises()
      wrapper.vm.hide()
      expect(mockHide).toHaveBeenCalled()
    })
  })

  describe('defineExpose', () => {
    it('exposes show method externally', async () => {
      const wrapper = mountComponent()
      await flushPromises()

      // show should be exposed and callable from parent
      expect(wrapper.vm.show).toBe(mockShow)
    })

    it('exposes hide method externally', async () => {
      const wrapper = mountComponent()
      await flushPromises()

      // hide should be exposed and callable from parent
      expect(wrapper.vm.hide).toBe(mockHide)
    })
  })

  describe('styling and layout', () => {
    it('wraps items with mt-2 class spacing', async () => {
      const wrapper = mountComponent({}, [1])
      await flushPromises()
      // The div wrapper around ModMicrovolunteering has p-0 mt-2 classes
      const itemWrapper = wrapper.find('.mod-microvolunteering').element
        .parentElement
      expect(itemWrapper.classList.contains('mt-2')).toBe(true)
      expect(itemWrapper.classList.contains('p-0')).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('handles user with only id property', async () => {
      const minimalUser = { displayname: 'Minimal' }
      const wrapper = mountComponent(minimalUser)
      await flushPromises()
      expect(wrapper.find('.b-modal').attributes('title')).toBe(
        'Microvolunteering for Minimal'
      )
    })

    it('handles user with empty displayname', async () => {
      const wrapper = mountComponent({ displayname: '' })
      await flushPromises()
      expect(wrapper.find('.b-modal').attributes('title')).toBe(
        'Microvolunteering for '
      )
    })

    it('handles numeric itemIds of various sizes', async () => {
      const wrapper = mountComponent({}, [1, 999999, 123456789])
      await flushPromises()
      const items = wrapper.findAll('.mod-microvolunteering')
      expect(items[0].attributes('data-id')).toBe('1')
      expect(items[1].attributes('data-id')).toBe('999999')
      expect(items[2].attributes('data-id')).toBe('123456789')
    })

    it('re-renders when itemIds prop changes', async () => {
      const wrapper = mountComponent({}, [1, 2])
      await flushPromises()
      expect(wrapper.findAll('.mod-microvolunteering')).toHaveLength(2)

      await wrapper.setProps({ itemIds: [3, 4, 5, 6] })
      await flushPromises()
      expect(wrapper.findAll('.mod-microvolunteering')).toHaveLength(4)
    })

    it('re-renders when user prop changes', async () => {
      const wrapper = mountComponent({ displayname: 'First User' })
      await flushPromises()
      expect(wrapper.find('.b-modal').attributes('title')).toContain(
        'First User'
      )

      await wrapper.setProps({ user: { id: 456, displayname: 'Second User' } })
      await flushPromises()
      expect(wrapper.find('.b-modal').attributes('title')).toContain(
        'Second User'
      )
    })
  })
})
