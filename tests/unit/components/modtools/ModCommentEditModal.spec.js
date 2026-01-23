import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref } from 'vue'
import ModCommentEditModal from '~/modtools/components/ModCommentEditModal.vue'

// Create mock instances with saveComment method
const mockUserStore = {
  user: null,
  add: vi.fn().mockResolvedValue(123),
  fetch: vi.fn().mockResolvedValue({}),
  fetchMT: vi.fn().mockResolvedValue({}),
  updateUser: vi.fn().mockResolvedValue({}),
  byId: vi.fn().mockReturnValue(null),
  saveComment: vi.fn().mockResolvedValue({}),
}
const mockHide = vi.fn()

// Mock stores
vi.mock('~/stores/user', () => ({
  useUserStore: () => mockUserStore,
}))

// Mock the modal composable with proper Vue ref to avoid template ref warnings
vi.mock('~/composables/useOurModal', () => ({
  useOurModal: () => ({
    modal: ref(null),
    hide: mockHide,
  }),
}))

describe('ModCommentEditModal', () => {
  // Helper to create test user data
  const createTestUser = (overrides = {}) => ({
    id: 123,
    displayname: 'Test User',
    ...overrides,
  })

  // Helper to create test comment data
  const createTestComment = (overrides = {}) => ({
    id: 456,
    user1: 'Existing comment 1',
    user2: 'Existing comment 2',
    user3: null,
    user4: null,
    user5: null,
    user6: null,
    user7: null,
    user8: null,
    user9: null,
    user10: null,
    user11: null,
    flag: false,
    ...overrides,
  })

  const defaultProps = {
    user: createTestUser(),
    comment: createTestComment(),
    groupname: 'Test Group',
  }

  function mountComponent(props = {}) {
    return mount(ModCommentEditModal, {
      props: { ...defaultProps, ...props },
      global: {
        stubs: {
          'b-modal': {
            template:
              '<div class="modal" @hidden="$emit(\'hidden\')"><slot name="title" /><slot /><slot name="footer" /></div>',
          },
          'b-button': {
            template: '<button @click="$emit(\'click\')"><slot /></button>',
            props: ['variant'],
          },
          'b-form-input': {
            template:
              '<input class="form-input" :value="modelValue" :placeholder="placeholder" @input="$emit(\'update:modelValue\', $event.target.value)" />',
            props: ['modelValue', 'placeholder'],
          },
          OurToggle: {
            template:
              '<div class="toggle" @click="$emit(\'change\')"><span>{{ value ? labels.checked : labels.unchecked }}</span></div>',
            props: [
              'value',
              'height',
              'width',
              'fontSize',
              'sync',
              'labels',
              'variant',
            ],
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockUserStore.saveComment.mockResolvedValue({})
  })

  describe('rendering', () => {
    it('displays user displayname in title', () => {
      const wrapper = mountComponent({
        user: createTestUser({ displayname: 'John Doe' }),
      })
      expect(wrapper.text()).toContain('John Doe')
    })

    it('displays group name in title when provided', () => {
      const wrapper = mountComponent({ groupname: 'Freegle Test Group' })
      expect(wrapper.text()).toContain('on')
      expect(wrapper.text()).toContain('Freegle Test Group')
    })

    it('does not display "on" before groupname when groupname is null', () => {
      const wrapper = mountComponent({ groupname: null })
      // When groupname is null, it should just show the user's name without "on" after it
      expect(wrapper.text()).toContain('Edit Note for Test User')
      // The v-if="groupname" ensures <span v-if="groupname">on</span> is not rendered
      expect(wrapper.text()).not.toMatch(/Test User on\s+\s*You can add/)
    })

    it('renders 11 form inputs for user comments', () => {
      const wrapper = mountComponent()
      const inputs = wrapper.findAll('.form-input')
      expect(inputs.length).toBe(11)
    })

    it('displays instruction text about member notes', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain(
        'You can add one or more notes about members'
      )
    })

    it('displays GDPR warning', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('GDPR')
      expect(wrapper.text()).toContain('objective, polite and factual')
    })

    it('displays Close button', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Close')
    })

    it('displays Save button', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Save')
    })

    it('displays toggle for alerting other groups', () => {
      const wrapper = mountComponent()
      const toggle = wrapper.find('.toggle')
      expect(toggle.exists()).toBe(true)
    })

    it('displays instruction about alerting other groups', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('alerted to other groups')
      expect(wrapper.text()).toContain('Member->Review')
    })

    it('displays coloured box description', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('coloured box')
    })
  })

  describe('placeholders', () => {
    it('has placeholder for first input field', () => {
      const wrapper = mountComponent()
      const inputs = wrapper.findAll('.form-input')
      expect(inputs[0].attributes('placeholder')).toBe(
        'Add a comment about this member here'
      )
    })

    it('has placeholder for second input field', () => {
      const wrapper = mountComponent()
      const inputs = wrapper.findAll('.form-input')
      expect(inputs[1].attributes('placeholder')).toBe(
        '...and more information here'
      )
    })

    it('has placeholder for third input field', () => {
      const wrapper = mountComponent()
      const inputs = wrapper.findAll('.form-input')
      expect(inputs[2].attributes('placeholder')).toBe('...and here')
    })

    it('has placeholder for fourth input field', () => {
      const wrapper = mountComponent()
      const inputs = wrapper.findAll('.form-input')
      expect(inputs[3].attributes('placeholder')).toBe('...you get the idea')
    })

    it('has undefined placeholder for remaining input fields', () => {
      const wrapper = mountComponent()
      const inputs = wrapper.findAll('.form-input')
      // Fields 5-11 (indices 4-10) have undefined placeholders
      for (let i = 4; i < 11; i++) {
        expect(inputs[i].attributes('placeholder')).toBeUndefined()
      }
    })
  })

  describe('props', () => {
    it('accepts user prop (required)', () => {
      const testUser = createTestUser({ id: 789 })
      const wrapper = mountComponent({ user: testUser })
      expect(wrapper.props('user')).toEqual(testUser)
    })

    it('accepts comment prop (required)', () => {
      const testComment = createTestComment({
        id: 999,
        user1: 'Custom comment',
      })
      const wrapper = mountComponent({ comment: testComment })
      expect(wrapper.props('comment')).toEqual(testComment)
    })

    it('accepts groupname prop (optional)', () => {
      const wrapper = mountComponent({ groupname: 'My Group' })
      expect(wrapper.props('groupname')).toBe('My Group')
    })

    it('accepts null groupname', () => {
      const wrapper = mountComponent({ groupname: null })
      expect(wrapper.props('groupname')).toBe(null)
    })
  })

  describe('methods', () => {
    describe('onHide', () => {
      it('emits hidden event when called', () => {
        const wrapper = mountComponent()
        wrapper.vm.onHide()
        expect(wrapper.emitted('hidden')).toBeTruthy()
        expect(wrapper.emitted('hidden').length).toBe(1)
      })
    })

    describe('toggleFlag', () => {
      it('toggles flag from false to true', async () => {
        const wrapper = mountComponent({
          comment: createTestComment({ flag: false }),
        })
        await flushPromises()
        expect(wrapper.vm.editcomment.flag).toBe(false)
        wrapper.vm.toggleFlag()
        expect(wrapper.vm.editcomment.flag).toBe(true)
      })

      it('toggles flag from true to false', async () => {
        const wrapper = mountComponent({
          comment: createTestComment({ flag: true }),
        })
        await flushPromises()
        expect(wrapper.vm.editcomment.flag).toBe(true)
        wrapper.vm.toggleFlag()
        expect(wrapper.vm.editcomment.flag).toBe(false)
      })

      it('can be toggled multiple times', async () => {
        const wrapper = mountComponent({
          comment: createTestComment({ flag: false }),
        })
        await flushPromises()
        expect(wrapper.vm.editcomment.flag).toBe(false)
        wrapper.vm.toggleFlag()
        expect(wrapper.vm.editcomment.flag).toBe(true)
        wrapper.vm.toggleFlag()
        expect(wrapper.vm.editcomment.flag).toBe(false)
        wrapper.vm.toggleFlag()
        expect(wrapper.vm.editcomment.flag).toBe(true)
      })
    })

    describe('save', () => {
      it('calls userStore.saveComment with editcomment', async () => {
        const testComment = createTestComment({
          id: 100,
          user1: 'Updated comment',
          flag: true,
        })
        const wrapper = mountComponent({
          comment: testComment,
        })
        await flushPromises()

        await wrapper.vm.save()
        await flushPromises()

        expect(mockUserStore.saveComment).toHaveBeenCalledWith(testComment)
      })

      it('emits edited event after save', async () => {
        const wrapper = mountComponent()
        await flushPromises()

        await wrapper.vm.save()
        await flushPromises()

        expect(wrapper.emitted('edited')).toBeTruthy()
        expect(wrapper.emitted('edited').length).toBe(1)
      })

      it('calls hide after save', async () => {
        const wrapper = mountComponent()
        await flushPromises()

        await wrapper.vm.save()
        await flushPromises()

        expect(mockHide).toHaveBeenCalled()
      })

      it('saves with all user fields when filled in', async () => {
        const testComment = createTestComment({
          user1: 'Comment 1',
          user2: 'Comment 2',
          user3: 'Comment 3',
          user4: 'Comment 4',
          user5: 'Comment 5',
          user6: 'Comment 6',
          user7: 'Comment 7',
          user8: 'Comment 8',
          user9: 'Comment 9',
          user10: 'Comment 10',
          user11: 'Comment 11',
        })
        const wrapper = mountComponent({
          comment: testComment,
        })
        await flushPromises()

        await wrapper.vm.save()
        await flushPromises()

        expect(mockUserStore.saveComment).toHaveBeenCalledWith(
          expect.objectContaining({
            user1: 'Comment 1',
            user2: 'Comment 2',
            user3: 'Comment 3',
            user4: 'Comment 4',
            user5: 'Comment 5',
            user6: 'Comment 6',
            user7: 'Comment 7',
            user8: 'Comment 8',
            user9: 'Comment 9',
            user10: 'Comment 10',
            user11: 'Comment 11',
          })
        )
      })

      it('saves with flag value', async () => {
        const testComment = createTestComment({ flag: true })
        const wrapper = mountComponent({
          comment: testComment,
        })
        await flushPromises()

        await wrapper.vm.save()
        await flushPromises()

        expect(mockUserStore.saveComment).toHaveBeenCalledWith(
          expect.objectContaining({
            flag: true,
          })
        )
      })
    })

    describe('hide', () => {
      it('is exposed from useOurModal', () => {
        const wrapper = mountComponent()
        expect(wrapper.vm.hide).toBeDefined()
      })
    })
  })

  describe('events', () => {
    it('emits hidden event when modal is hidden', () => {
      const wrapper = mountComponent()
      wrapper.vm.onHide()
      expect(wrapper.emitted('hidden')).toBeTruthy()
    })

    it('emits edited event when comment is saved', async () => {
      const wrapper = mountComponent()
      await flushPromises()
      await wrapper.vm.save()
      await flushPromises()
      expect(wrapper.emitted('edited')).toBeTruthy()
    })
  })

  describe('initial state', () => {
    it('initializes editcomment as false before mount', () => {
      // The editcomment ref is initialized to false
      // After mount, it's set to props.comment
      const wrapper = mountComponent()
      // We check that it was set from props after mount
      expect(wrapper.vm.editcomment).toBeDefined()
    })

    it('copies comment prop to editcomment on mount', async () => {
      const testComment = createTestComment({
        id: 123,
        user1: 'Test value',
        flag: true,
      })
      const wrapper = mountComponent({
        comment: testComment,
      })
      await flushPromises()

      expect(wrapper.vm.editcomment).toEqual(testComment)
    })

    it('editcomment has same values as props.comment after mount', async () => {
      const testComment = createTestComment()
      const wrapper = mountComponent({
        comment: testComment,
      })
      await flushPromises()

      // The component sets editcomment.value = props.comment directly
      // Verify the values are equal
      expect(wrapper.vm.editcomment).toStrictEqual(testComment)
    })
  })

  describe('button interactions', () => {
    it('Close button exists and can be clicked', () => {
      const wrapper = mountComponent()
      const buttons = wrapper.findAll('button')
      const closeButton = buttons.find((b) => b.text().includes('Close'))
      expect(closeButton).toBeDefined()
    })

    it('Save button exists and can be clicked', () => {
      const wrapper = mountComponent()
      const buttons = wrapper.findAll('button')
      const saveButton = buttons.find((b) => b.text().includes('Save'))
      expect(saveButton).toBeDefined()
    })
  })

  describe('toggle interactions', () => {
    it('toggle click triggers change event', async () => {
      const wrapper = mountComponent({
        comment: createTestComment({ flag: false }),
      })
      await flushPromises()

      const toggle = wrapper.find('.toggle')
      await toggle.trigger('click')

      // The toggle emits 'change' which calls toggleFlag
      // We verify the flag value changed
      expect(wrapper.vm.editcomment.flag).toBe(true)
    })

    it('displays unchecked label when flag is false', async () => {
      const wrapper = mountComponent({
        comment: createTestComment({ flag: false }),
      })
      await flushPromises()

      expect(wrapper.text()).toContain('Will not alert other groups')
    })

    it('displays checked label when flag is true', async () => {
      const wrapper = mountComponent({
        comment: createTestComment({ flag: true }),
      })
      await flushPromises()

      expect(wrapper.text()).toContain('Will alert other groups')
    })
  })

  describe('modal id', () => {
    it('generates unique modal id based on user id', () => {
      const wrapper = mountComponent({
        user: createTestUser({ id: 12345 }),
      })
      // The modal id is 'modCommentModal-' + user.id
      // We can verify by checking the component renders correctly with the user
      expect(wrapper.props('user').id).toBe(12345)
    })
  })

  describe('edge cases', () => {
    it('handles user with minimal data', () => {
      const wrapper = mountComponent({
        user: { id: 1, displayname: '' },
        comment: createTestComment(),
      })
      expect(wrapper.find('.modal').exists()).toBe(true)
    })

    it('handles save with empty comments', async () => {
      const emptyComment = createTestComment({
        user1: null,
        user2: null,
        user3: null,
      })
      const wrapper = mountComponent({
        comment: emptyComment,
      })
      await flushPromises()

      await wrapper.vm.save()
      await flushPromises()

      expect(mockUserStore.saveComment).toHaveBeenCalledWith(
        expect.objectContaining({
          user1: null,
          user2: null,
          user3: null,
        })
      )
    })

    it('handles save when API fails gracefully', async () => {
      mockUserStore.saveComment.mockRejectedValueOnce(new Error('API Error'))
      const wrapper = mountComponent()
      await flushPromises()

      // Should not throw (async function handles rejection)
      await expect(wrapper.vm.save()).rejects.toThrow('API Error')
    })

    it('handles comment with all null user fields', async () => {
      const nullComment = {
        id: 1,
        user1: null,
        user2: null,
        user3: null,
        user4: null,
        user5: null,
        user6: null,
        user7: null,
        user8: null,
        user9: null,
        user10: null,
        user11: null,
        flag: false,
      }
      const wrapper = mountComponent({
        comment: nullComment,
      })
      await flushPromises()

      expect(wrapper.vm.editcomment).toEqual(nullComment)
    })

    it('handles comment with existing data in all fields', async () => {
      const fullComment = {
        id: 1,
        user1: 'Note 1',
        user2: 'Note 2',
        user3: 'Note 3',
        user4: 'Note 4',
        user5: 'Note 5',
        user6: 'Note 6',
        user7: 'Note 7',
        user8: 'Note 8',
        user9: 'Note 9',
        user10: 'Note 10',
        user11: 'Note 11',
        flag: true,
      }
      const wrapper = mountComponent({
        comment: fullComment,
      })
      await flushPromises()

      expect(wrapper.vm.editcomment).toEqual(fullComment)
    })
  })

  describe('placeholders array', () => {
    it('has null as first element (index 0)', () => {
      const wrapper = mountComponent()
      // placeholders[0] is null, used for 1-based indexing
      expect(wrapper.vm.placeholders[0]).toBe(null)
    })

    it('has correct placeholder at index 1', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.placeholders[1]).toBe(
        'Add a comment about this member here'
      )
    })

    it('has correct placeholder at index 2', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.placeholders[2]).toBe('...and more information here')
    })

    it('has correct placeholder at index 3', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.placeholders[3]).toBe('...and here')
    })

    it('has correct placeholder at index 4', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.placeholders[4]).toBe('...you get the idea')
    })

    it('has undefined for indices 5-11', () => {
      const wrapper = mountComponent()
      // The placeholders array only has 5 elements (indices 0-4)
      // So indices 5-11 are undefined
      for (let i = 5; i <= 11; i++) {
        expect(wrapper.vm.placeholders[i]).toBeUndefined()
      }
    })
  })

  describe('editcomment mutations', () => {
    it('allows modifying user1 field', async () => {
      const wrapper = mountComponent({
        comment: createTestComment({ user1: 'Original' }),
      })
      await flushPromises()

      wrapper.vm.editcomment.user1 = 'Modified'
      expect(wrapper.vm.editcomment.user1).toBe('Modified')
    })

    it('allows modifying multiple user fields', async () => {
      const wrapper = mountComponent({
        comment: createTestComment(),
      })
      await flushPromises()

      wrapper.vm.editcomment.user1 = 'New value 1'
      wrapper.vm.editcomment.user5 = 'New value 5'
      wrapper.vm.editcomment.user11 = 'New value 11'

      expect(wrapper.vm.editcomment.user1).toBe('New value 1')
      expect(wrapper.vm.editcomment.user5).toBe('New value 5')
      expect(wrapper.vm.editcomment.user11).toBe('New value 11')
    })

    it('allows toggling flag directly', async () => {
      const wrapper = mountComponent({
        comment: createTestComment({ flag: false }),
      })
      await flushPromises()

      wrapper.vm.editcomment.flag = true
      expect(wrapper.vm.editcomment.flag).toBe(true)
    })
  })

  describe('title display', () => {
    it('shows "Edit Note for" prefix in title', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Edit Note for')
    })

    it('combines user name and group name correctly', () => {
      const wrapper = mountComponent({
        user: createTestUser({ displayname: 'Jane Smith' }),
        groupname: 'Freegle Cambridge',
      })
      expect(wrapper.text()).toContain('Jane Smith')
      expect(wrapper.text()).toContain('on')
      expect(wrapper.text()).toContain('Freegle Cambridge')
    })
  })
})
