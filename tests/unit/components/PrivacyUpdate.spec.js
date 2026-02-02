import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref, Suspense, defineComponent, h } from 'vue'
import PrivacyUpdate from '~/components/PrivacyUpdate.vue'

const mockSaveAndGet = vi.fn()

vi.mock('~/stores/auth', () => ({
  useAuthStore: () => ({
    saveAndGet: mockSaveAndGet,
  }),
}))

// Create a fresh ref for each test
let mockMeRef

vi.mock('~/composables/useMe', () => ({
  useMe: () => ({
    get me() {
      return mockMeRef
    },
  }),
}))

describe('PrivacyUpdate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSaveAndGet.mockResolvedValue({})
  })

  function createWrapper(meValue) {
    // Set the mock ref before creating wrapper
    mockMeRef = ref(meValue)

    // Wrap in Suspense since component has async setup
    const WrapperComponent = defineComponent({
      components: { PrivacyUpdate },
      setup() {
        return () =>
          h(Suspense, null, {
            default: () => h(PrivacyUpdate),
            fallback: () => h('div', 'Loading...'),
          })
      },
    })

    return mount(WrapperComponent, {
      global: {
        stubs: {
          NoticeMessage: {
            template: '<div class="notice-message"><slot /></div>',
            props: ['variant'],
          },
          'nuxt-link': {
            template: '<a :href="to"><slot /></a>',
            props: ['to'],
          },
          'b-button': {
            template: '<button @click="$emit(\'click\')"><slot /></button>',
            props: ['variant', 'size'],
            emits: ['click'],
          },
        },
      },
    })
  }

  describe('component structure', () => {
    it('mounts without errors', async () => {
      const wrapper = createWrapper({
        settings: { lastPrivacySeen: '2020-01-01T00:00:00.000Z' },
      })
      await flushPromises()
      expect(wrapper.html()).toBeTruthy()
    })
  })

  describe('auto-seen on mount', () => {
    it('calls saveAndGet on mount when user has no lastPrivacySeen', async () => {
      createWrapper({
        settings: {},
      })
      await flushPromises()
      expect(mockSaveAndGet).toHaveBeenCalled()
    })

    it('does not call saveAndGet when lastPrivacySeen already set', async () => {
      createWrapper({
        settings: { lastPrivacySeen: '2020-01-01T00:00:00.000Z' },
      })
      await flushPromises()
      expect(mockSaveAndGet).not.toHaveBeenCalled()
    })

    it('does not call saveAndGet when user is null', async () => {
      createWrapper(null)
      await flushPromises()
      expect(mockSaveAndGet).not.toHaveBeenCalled()
    })
  })
})
