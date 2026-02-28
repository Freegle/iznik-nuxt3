import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ModComments from '~/modtools/components/ModComments.vue'

// Mock composables
vi.mock('~/composables/useMe', () => ({
  useMe: () => ({
    oneOfMyGroups: vi.fn((groupid) => groupid === 1 || groupid === 2),
  }),
}))

// Mock user store
let mockUserData = null
const mockUserStore = {
  byId: vi.fn((id) => mockUserData),
}

vi.mock('~/stores/user', () => ({
  useUserStore: () => mockUserStore,
}))

describe('ModComments', () => {
  const defaultUser = {
    id: 123,
    displayname: 'Test User',
    comments: [
      { id: 1, user1: 'First comment', groupid: 1 },
      { id: 2, user1: 'Second comment', groupid: 3 },
      { id: 3, user1: 'Third comment', groupid: 2 },
    ],
  }

  function createWrapper(userOverrides = {}, extraProps = {}) {
    mockUserData = { ...defaultUser, ...userOverrides }
    return mount(ModComments, {
      props: {
        userid: 123,
        expandComments: false,
        ...extraProps,
      },
      global: {
        stubs: {
          ModComment: {
            template:
              '<div class="mod-comment" :data-id="comment.id">{{ comment.user1 }}</div>',
            props: ['comment', 'user', 'expandComments'],
          },
          'b-button': {
            template:
              '<button :data-variant="variant" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant'],
          },
          'v-icon': {
            template: '<i :data-icon="icon" />',
            props: ['icon'],
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockUserData = null
  })

  describe('rendering', () => {
    it('renders ModComment for visible comments', () => {
      const wrapper = createWrapper()
      // By default only first comment is shown
      expect(wrapper.findAll('.mod-comment')).toHaveLength(1)
    })

    it('shows "Show more" button when multiple comments exist', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Show')
      expect(wrapper.text()).toContain('more')
    })

    it('does not show toggle button with only one comment', () => {
      const wrapper = createWrapper({
        comments: [{ id: 1, user1: 'Only comment', groupid: 1 }],
      })
      expect(wrapper.findAll('button')).toHaveLength(0)
    })
  })

  describe('sortedComments computed', () => {
    it('sorts comments with user groups first', () => {
      const wrapper = createWrapper()
      // groupid 1 and 2 are in oneOfMyGroups, groupid 3 is not
      // So comments with groupid 1 and 2 should come before groupid 3
      const sorted = wrapper.vm.sortedComments
      expect(sorted[0].groupid).toBe(1)
      expect(sorted[1].groupid).toBe(2)
      expect(sorted[2].groupid).toBe(3)
    })

    it('returns empty array when userid is null', () => {
      mockUserData = null
      const wrapper = mount(ModComments, {
        props: { userid: null },
        global: {
          stubs: {
            ModComment: true,
            'b-button': true,
            'v-icon': true,
          },
        },
      })
      expect(wrapper.vm.sortedComments).toEqual([])
    })

    it('returns empty array when user has no comments', () => {
      const wrapper = createWrapper({ comments: null })
      expect(wrapper.vm.sortedComments).toEqual([])
    })

    it('returns empty array when user.comments is undefined', () => {
      const wrapper = createWrapper({ comments: undefined })
      expect(wrapper.vm.sortedComments).toEqual([])
    })
  })

  describe('comments computed', () => {
    it('returns only first comment when showAll is false', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.comments).toHaveLength(1)
    })

    it('returns all comments when showAll is true', async () => {
      const wrapper = createWrapper()
      wrapper.vm.showAll = true
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.comments).toHaveLength(3)
    })

    it('returns empty array when no comments', () => {
      const wrapper = createWrapper({ comments: [] })
      expect(wrapper.vm.comments).toEqual([])
    })
  })

  describe('showMore computed', () => {
    it('returns singular form for 1 more note', () => {
      const wrapper = createWrapper({
        comments: [
          { id: 1, user1: 'First', groupid: 1 },
          { id: 2, user1: 'Second', groupid: 1 },
        ],
      })
      expect(wrapper.vm.showMore).toBe('1 more note')
    })

    it('returns plural form for multiple more notes', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.showMore).toBe('2 more notes')
    })
  })

  describe('show/hide toggle', () => {
    it('clicking "Show more" shows all comments', async () => {
      const wrapper = createWrapper()
      const button = wrapper.find('button')
      await button.trigger('click')
      expect(wrapper.vm.showAll).toBe(true)
      expect(wrapper.findAll('.mod-comment')).toHaveLength(3)
    })

    it('clicking "Hide notes" hides extra comments', async () => {
      const wrapper = createWrapper()
      wrapper.vm.showAll = true
      await wrapper.vm.$nextTick()
      const button = wrapper.find('button')
      await button.trigger('click')
      expect(wrapper.vm.showAll).toBe(false)
      expect(wrapper.findAll('.mod-comment')).toHaveLength(1)
    })

    it('button text changes based on showAll state', async () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Show')
      wrapper.vm.showAll = true
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toContain('Hide')
    })
  })

  describe('events', () => {
    it('emits updateComments when updated event received', () => {
      const wrapper = createWrapper()
      wrapper.vm.updated()
      expect(wrapper.emitted('updateComments')).toBeTruthy()
    })

    it('emits editing when editing event received', () => {
      const wrapper = createWrapper()
      wrapper.vm.editing()
      expect(wrapper.emitted('editing')).toBeTruthy()
    })
  })

  describe('expandComments prop', () => {
    it('passes expandComments prop to ModComment stub', () => {
      const wrapper = createWrapper({}, { expandComments: true })
      // With stubs, we check the stub is rendered
      const modComment = wrapper.find('.mod-comment')
      expect(modComment.exists()).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('handles user with empty comments array', () => {
      const wrapper = createWrapper({ comments: [] })
      expect(wrapper.findAll('.mod-comment')).toHaveLength(0)
      expect(wrapper.findAll('button')).toHaveLength(0)
    })

    it('handles sorting when all comments are from non-user groups', () => {
      const wrapper = createWrapper({
        comments: [
          { id: 1, user1: 'First', groupid: 99 },
          { id: 2, user1: 'Second', groupid: 98 },
        ],
      })
      expect(wrapper.vm.sortedComments).toHaveLength(2)
    })

    it('maintains stable sort order for same group type', () => {
      const wrapper = createWrapper({
        comments: [
          { id: 1, user1: 'First', groupid: 1 },
          { id: 2, user1: 'Second', groupid: 1 },
        ],
      })
      const sorted = wrapper.vm.sortedComments
      // Both are in user's groups, so order should be preserved
      expect(sorted[0].id).toBe(1)
      expect(sorted[1].id).toBe(2)
    })
  })
})
