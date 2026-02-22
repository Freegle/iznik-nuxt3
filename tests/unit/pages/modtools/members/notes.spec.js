import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { ref } from 'vue'
import NotesPage from '~/modtools/pages/members/notes/[[id]].vue'

// Mock comment store
const mockCommentStore = {
  sortedList: [],
  context: null,
  fetch: vi.fn().mockResolvedValue({}),
  clear: vi.fn(),
}

vi.mock('~/stores/comment', () => ({
  useCommentStore: () => mockCommentStore,
}))

// Mock useMe composable
const mockMyid = ref(1)

vi.mock('~/composables/useMe', () => ({
  useMe: () => ({
    myid: mockMyid,
  }),
}))

describe('members/notes/[[id]].vue page', () => {
  function mountComponent() {
    return mount(NotesPage, {
      global: {
        plugins: [createPinia()],
        stubs: {
          'client-only': {
            template: '<div><slot /></div>',
          },
          ScrollToTop: {
            template: '<div class="scroll-to-top" />',
          },
          ModHelpComments: {
            template: '<div class="mod-help-comments" />',
          },
          ModGroupSelect: {
            template: '<div class="mod-group-select" />',
            props: ['modelValue', 'modonly', 'all'],
          },
          ModCommentUser: {
            template:
              '<div class="mod-comment-user" :data-comment-id="comment.id" />',
            props: ['comment'],
          },
          NoticeMessage: {
            template: '<div class="notice-message"><slot /></div>',
            props: ['variant'],
          },
          'b-img': {
            template: '<img />',
            props: ['src', 'alt', 'lazy'],
          },
          'infinite-loading': {
            template:
              '<div class="infinite-loading"><slot name="no-results" /><slot name="no-more" /><slot name="spinner" /></div>',
            props: ['forceUseInfiniteWrapper', 'distance', 'identifier'],
            emits: ['infinite'],
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    mockCommentStore.sortedList = []
    mockCommentStore.context = null
    mockMyid.value = 1
  })

  describe('rendering', () => {
    it('shows empty message when no comments and not busy', async () => {
      mockCommentStore.sortedList = []
      const wrapper = mountComponent()
      wrapper.vm.busy = false
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toContain('no comments to show')
    })

    it('renders comment components for visible comments', async () => {
      mockCommentStore.sortedList = [
        { id: 1, groupid: null, flag: false, byuser: { id: 2 } },
        { id: 2, groupid: null, flag: false, byuser: { id: 3 } },
      ]
      const wrapper = mountComponent()
      wrapper.vm.show = 10
      await wrapper.vm.$nextTick()
      expect(wrapper.findAll('.mod-comment-user')).toHaveLength(2)
    })
  })

  describe('initial state', () => {
    it('clears comment store on mount', async () => {
      mountComponent()
      await flushPromises()
      expect(mockCommentStore.clear).toHaveBeenCalled()
    })
  })

  describe('computed properties', () => {
    it('comments returns sortedList from store', () => {
      mockCommentStore.sortedList = [{ id: 1 }, { id: 2 }]
      const wrapper = mountComponent()
      expect(wrapper.vm.comments).toHaveLength(2)
    })

    it('filteredComments returns all when no groupid filter', () => {
      mockCommentStore.sortedList = [
        { id: 1, groupid: 10 },
        { id: 2, groupid: 20 },
      ]
      const wrapper = mountComponent()
      wrapper.vm.groupid = null
      expect(wrapper.vm.filteredComments).toHaveLength(2)
    })

    it('filteredComments filters by groupid', () => {
      mockCommentStore.sortedList = [
        { id: 1, groupid: 10 },
        { id: 2, groupid: 20 },
      ]
      const wrapper = mountComponent()
      wrapper.vm.groupid = 10
      expect(wrapper.vm.filteredComments).toHaveLength(1)
      expect(wrapper.vm.filteredComments[0].id).toBe(1)
    })

    it('filteredComments includes flagged comments regardless of group', () => {
      mockCommentStore.sortedList = [
        { id: 1, groupid: 10, flag: true },
        { id: 2, groupid: 20, flag: false },
      ]
      const wrapper = mountComponent()
      wrapper.vm.groupid = 20
      const filtered = wrapper.vm.filteredComments
      expect(filtered).toHaveLength(2)
    })

    it('filteredComments includes my own comments regardless of group', () => {
      mockMyid.value = 5
      mockCommentStore.sortedList = [
        { id: 1, groupid: 10, flag: false, byuser: { id: 5 } },
        { id: 2, groupid: 20, flag: false, byuser: { id: 3 } },
      ]
      const wrapper = mountComponent()
      wrapper.vm.groupid = 20
      const filtered = wrapper.vm.filteredComments
      expect(filtered).toHaveLength(2)
    })

    it('visibleComments limits to show value', () => {
      mockCommentStore.sortedList = [
        { id: 1, groupid: null },
        { id: 2, groupid: null },
        { id: 3, groupid: null },
      ]
      const wrapper = mountComponent()
      wrapper.vm.groupid = null
      wrapper.vm.show = 2
      expect(wrapper.vm.visibleComments).toHaveLength(2)
    })
  })

  describe('watchers', () => {
    it('clears and resets when groupid changes', async () => {
      const wrapper = mountComponent()
      await flushPromises()
      const initialBump = wrapper.vm.bump
      vi.clearAllMocks()

      wrapper.vm.groupid = 123
      await wrapper.vm.$nextTick()

      expect(mockCommentStore.clear).toHaveBeenCalled()
      expect(wrapper.vm.context).toBe(null)
      expect(wrapper.vm.bump).toBe(initialBump + 1)
    })
  })

  describe('methods', () => {
    describe('loadMore', () => {
      it('increments show when more comments available', async () => {
        mockCommentStore.sortedList = [
          { id: 1, groupid: null },
          { id: 2, groupid: null },
        ]
        const wrapper = mountComponent()
        wrapper.vm.groupid = null
        wrapper.vm.show = 1
        const mockState = { loaded: vi.fn(), complete: vi.fn() }

        await wrapper.vm.loadMore(mockState)

        expect(wrapper.vm.show).toBe(2)
        expect(mockState.loaded).toHaveBeenCalled()
      })

      it('fetches more comments when show equals comments length', async () => {
        mockCommentStore.sortedList = [{ id: 1, groupid: null }]
        const wrapper = mountComponent()
        wrapper.vm.groupid = null
        wrapper.vm.show = 1
        const mockState = { loaded: vi.fn(), complete: vi.fn() }

        await wrapper.vm.loadMore(mockState)

        expect(mockCommentStore.fetch).toHaveBeenCalledWith({
          context: null,
          groupid: null,
        })
      })

      it('completes when no new comments returned', async () => {
        mockCommentStore.sortedList = []
        const wrapper = mountComponent()
        wrapper.vm.groupid = null
        wrapper.vm.show = 0
        const mockState = { loaded: vi.fn(), complete: vi.fn() }

        await wrapper.vm.loadMore(mockState)

        expect(mockState.complete).toHaveBeenCalled()
        expect(wrapper.vm.complete).toBe(true)
      })

      it('handles fetch errors gracefully', async () => {
        mockCommentStore.fetch.mockRejectedValueOnce(new Error('Network error'))
        const wrapper = mountComponent()
        wrapper.vm.show = 0
        const mockState = { loaded: vi.fn(), complete: vi.fn() }

        await wrapper.vm.loadMore(mockState)

        expect(mockState.complete).toHaveBeenCalled()
        expect(wrapper.vm.busy).toBe(false)
      })
    })
  })
})
