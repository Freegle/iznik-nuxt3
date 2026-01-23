import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import VolunteerOpportunityModal from '~/components/VolunteerOpportunityModal.vue'

// Mock useVolunteeringStore
const mockVolunteeringStore = {
  // Add store properties as needed
}
vi.mock('~/stores/volunteering', () => ({
  useVolunteeringStore: () => mockVolunteeringStore,
}))
// Mock useComposeStore
const mockComposeStore = {
  // Add store properties as needed
}
vi.mock('~/stores/compose', () => ({
  useComposeStore: () => mockComposeStore,
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
// Mock useAuthStore
const mockAuthStore = {
  // Add store properties as needed
}
vi.mock('~/stores/auth', () => ({
  useAuthStore: () => mockAuthStore,
}))
// Mock useImageStore
const mockImageStore = {
  // Add store properties as needed
}
vi.mock('~/stores/image', () => ({
  useImageStore: () => mockImageStore,
}))
// Mock userStore
const mockrStore = {
  // Add store properties as needed
}
vi.mock('~/stores/r', () => ({
  userStore: () => mockrStore,
}))
// Mock useOurModal
const mockModal = { value: null }
const mockShow = vi.fn()
const mockHide = vi.fn()
vi.mock('~/composables/useOurModal', () => ({
  useOurModal: () => ({ modal: mockModal, show: mockShow, hide: mockHide }),
}))

describe('VolunteerOpportunityModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function mountComponent(props = {}) {
    return mount(VolunteerOpportunityModal, {
      props: {
        // id: undefined,
        // type: undefined,
        // required: undefined,
        // default: undefined,
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
