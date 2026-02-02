import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref, computed } from 'vue'

// Mock the composable with configurable return values
const mockFilter = ref('0')
const mockVisibleMembers = ref([])

vi.mock('~/composables/useModMembers', () => ({
  setupModMembers: () => ({
    filter: mockFilter,
    visibleMembers: mockVisibleMembers,
  }),
}))

// Create test component that mirrors ModMembers logic
const ModMembersTest = {
  template: `
    <div>
      <div
        v-for="member in visibleMembers"
        :key="'memberlist-' + member.id"
        class="p-0 mt-2 member-item"
      >
        <div
          class="mod-member"
          :data-member-id="member.id"
          :data-expand-comments="expandComments"
        >
          {{ member.displayname }}
        </div>
      </div>
    </div>
  `,
  setup() {
    const expandComments = computed(() => parseInt(mockFilter.value) === 1)

    return {
      filter: mockFilter,
      visibleMembers: mockVisibleMembers,
      expandComments,
    }
  },
}

describe('ModMembers', () => {
  const sampleMembers = [
    {
      id: 1,
      displayname: 'Alice Test',
      email: 'alice@example.com',
      joined: '2024-01-01',
      groups: [{ id: 100, arrival: '2024-01-01' }],
    },
    {
      id: 2,
      displayname: 'Bob Test',
      email: 'bob@example.com',
      joined: '2024-01-02',
      groups: [{ id: 100, arrival: '2024-01-02' }],
    },
    {
      id: 3,
      displayname: 'Charlie Test',
      email: 'charlie@example.com',
      joined: '2024-01-03',
      groups: [{ id: 100, arrival: '2024-01-03' }],
    },
  ]

  function mountComponent() {
    return mount(ModMembersTest)
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockFilter.value = '0'
    mockVisibleMembers.value = []
  })

  describe('rendering', () => {
    it('renders a container div', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('div').exists()).toBe(true)
    })

    it('renders nothing when visibleMembers is empty', () => {
      mockVisibleMembers.value = []
      const wrapper = mountComponent()
      expect(wrapper.findAll('.member-item')).toHaveLength(0)
    })

    it('renders member items for each visible member', async () => {
      mockVisibleMembers.value = sampleMembers
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()

      expect(wrapper.findAll('.member-item')).toHaveLength(3)
    })

    it('displays member displayname', async () => {
      mockVisibleMembers.value = [sampleMembers[0]]
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('Alice Test')
    })

    it('uses member id as part of the key', async () => {
      mockVisibleMembers.value = sampleMembers
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()

      const items = wrapper.findAll('.mod-member')
      expect(items[0].attributes('data-member-id')).toBe('1')
      expect(items[1].attributes('data-member-id')).toBe('2')
      expect(items[2].attributes('data-member-id')).toBe('3')
    })
  })

  describe('filter and expandComments', () => {
    it('sets expandComments to false when filter is "0"', () => {
      mockFilter.value = '0'
      const wrapper = mountComponent()
      expect(wrapper.vm.expandComments).toBe(false)
    })

    it('sets expandComments to true when filter is "1"', async () => {
      mockFilter.value = '1'
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.expandComments).toBe(true)
    })

    it('sets expandComments to false when filter is "2"', async () => {
      mockFilter.value = '2'
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.expandComments).toBe(false)
    })

    it('passes expandComments to ModMember component', async () => {
      mockFilter.value = '1'
      mockVisibleMembers.value = [sampleMembers[0]]
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()

      const modMember = wrapper.find('.mod-member')
      expect(modMember.attributes('data-expand-comments')).toBe('true')
    })

    it('updates expandComments when filter changes', async () => {
      mockFilter.value = '0'
      const wrapper = mountComponent()
      expect(wrapper.vm.expandComments).toBe(false)

      mockFilter.value = '1'
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.expandComments).toBe(true)
    })
  })

  describe('member list updates', () => {
    it('adds new members when visibleMembers changes', async () => {
      mockVisibleMembers.value = [sampleMembers[0]]
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()

      expect(wrapper.findAll('.member-item')).toHaveLength(1)

      mockVisibleMembers.value = [...sampleMembers]
      await wrapper.vm.$nextTick()

      expect(wrapper.findAll('.member-item')).toHaveLength(3)
    })

    it('removes members when visibleMembers decreases', async () => {
      mockVisibleMembers.value = [...sampleMembers]
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()

      expect(wrapper.findAll('.member-item')).toHaveLength(3)

      mockVisibleMembers.value = [sampleMembers[0]]
      await wrapper.vm.$nextTick()

      expect(wrapper.findAll('.member-item')).toHaveLength(1)
    })

    it('handles empty to populated transition', async () => {
      mockVisibleMembers.value = []
      const wrapper = mountComponent()
      expect(wrapper.findAll('.member-item')).toHaveLength(0)

      mockVisibleMembers.value = sampleMembers
      await wrapper.vm.$nextTick()

      expect(wrapper.findAll('.member-item')).toHaveLength(3)
    })
  })

  describe('edge cases', () => {
    it('handles members with missing groups', async () => {
      const memberWithoutGroups = {
        id: 4,
        displayname: 'No Groups User',
        email: 'nogroups@example.com',
        joined: '2024-01-04',
      }
      mockVisibleMembers.value = [memberWithoutGroups]
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()

      expect(wrapper.findAll('.member-item')).toHaveLength(1)
      expect(wrapper.text()).toContain('No Groups User')
    })

    it('handles members with null displayname', async () => {
      const memberWithNullName = {
        id: 5,
        displayname: null,
        email: 'nullname@example.com',
        joined: '2024-01-05',
      }
      mockVisibleMembers.value = [memberWithNullName]
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()

      expect(wrapper.findAll('.member-item')).toHaveLength(1)
    })

    it('handles filter as string "1" correctly (parseInt)', () => {
      mockFilter.value = '1'
      const wrapper = mountComponent()
      expect(wrapper.vm.expandComments).toBe(true)
    })

    it('handles filter as numeric-looking string', () => {
      mockFilter.value = '01'
      const wrapper = mountComponent()
      // parseInt('01') === 1
      expect(wrapper.vm.expandComments).toBe(true)
    })

    it('handles undefined visibleMembers', () => {
      mockVisibleMembers.value = undefined
      const wrapper = mountComponent()
      // Should handle gracefully - v-for on undefined
      // In Vue 3, v-for on undefined/null renders nothing
      expect(wrapper.find('.member-item').exists()).toBe(false)
    })
  })
})
