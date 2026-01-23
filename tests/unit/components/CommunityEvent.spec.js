import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import CommunityEvent from '~/components/CommunityEvent.vue'

// Mock useCommunityEventStore
const mockCommunityEventStore = {
  // Add store properties as needed
}
vi.mock('~/stores/communityevent', () => ({
  useCommunityEventStore: () => mockCommunityEventStore,
}))
// Mock useUserStore
const mockUserStore = {
  // Add store properties as needed
}
vi.mock('~/stores/user', () => ({
  useUserStore: () => mockUserStore,
}))
// Mock useGroupStore
const mockGroupStore = {
  // Add store properties as needed
}
vi.mock('~/stores/group', () => ({
  useGroupStore: () => mockGroupStore,
}))
// Mock userStore
const mockrStore = {
  // Add store properties as needed
}
vi.mock('~/stores/r', () => ({
  userStore: () => mockrStore,
}))

describe('CommunityEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function mountComponent(props = {}) {
    return mount(CommunityEvent, {
      props: {
        // summary: undefined,
        // type: undefined,
        // required: undefined,
        ...props,
      },
      global: {
        stubs: {
          'b-button': true,
          'b-modal': true,
          'b-row': { template: '<div><slot /></div>' },
          'b-col': { template: '<div><slot /></div>' },
          'v-icon': true,
          'nuxt-link': { template: '<a><slot /></a>', props: ['to'] },
        },
      },
    })
  }

  describe('rendering', () => {
    it('mounts without error', () => {
      const wrapper = mountComponent()
      
      expect(wrapper.exists()).toBe(true)
    })
  })

})
