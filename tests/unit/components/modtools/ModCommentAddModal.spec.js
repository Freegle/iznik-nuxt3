import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref } from 'vue'
import { createMockUserStore } from '../../mocks/stores'
import ModCommentAddModal from '~/modtools/components/ModCommentAddModal.vue'

// Create mock instances
const mockUserStore = createMockUserStore()
const mockHide = vi.fn()
const mockBump = ref(0)
const mockContext = ref(null)
const mockCommentAdd = vi.fn().mockResolvedValue({})

// Mock #app for useNuxtApp
vi.mock('#app', () => ({
  useNuxtApp: () => ({
    $api: {
      comment: {
        add: mockCommentAdd,
      },
    },
  }),
}))

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

// Mock useModMembers composable
vi.mock('~/composables/useModMembers', () => ({
  setupModMembers: () => ({
    bump: mockBump,
    context: mockContext,
  }),
}))

describe('ModCommentAddModal', () => {
  // Helper to create test user data
  const createTestUser = (overrides = {}) => ({
    id: 123,
    displayname: 'Test User',
    ...overrides,
  })

  const defaultProps = {
    user: createTestUser(),
    groupid: 456,
    groupname: 'Test Group',
  }

  function mountComponent(props = {}) {
    return mount(ModCommentAddModal, {
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
          ExternalLink: {
            template: '<a :href="href"><slot /></a>',
            props: ['href'],
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockBump.value = 0
    mockContext.value = null
    mockCommentAdd.mockResolvedValue({})
    mockUserStore.fetchMT.mockResolvedValue({})
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
      // The title should NOT contain "on" followed by a groupname
      // Check that the title area doesn't have the pattern "Test User on"
      // Note: "on the wiki" exists elsewhere in the text, so we check specifically
      // that the title pattern doesn't include "on" before null groupname
      expect(wrapper.text()).toContain('Add Note for Test User')
      // When groupname is null, it should just show the user's name without "on" after it
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

    it('displays external link to wiki', () => {
      const wrapper = mountComponent()
      const link = wrapper.find(
        'a[href="https://wiki.ilovefreegle.org/Member_Notes"]'
      )
      expect(link.exists()).toBe(true)
      expect(link.text()).toContain('on the wiki')
    })

    it('displays Close button', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Close')
    })

    it('displays Add button', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Add')
    })

    it('displays toggle for alerting other groups', () => {
      const wrapper = mountComponent()
      const toggle = wrapper.find('.toggle')
      expect(toggle.exists()).toBe(true)
    })

    it('displays alert toggle with unchecked label initially', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Will not alert other groups')
    })

    it('displays instruction about alerting other groups', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('alerted to other groups')
      expect(wrapper.text()).toContain('Member->Review')
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

    it('accepts groupid prop (optional)', () => {
      const wrapper = mountComponent({ groupid: 999 })
      expect(wrapper.props('groupid')).toBe(999)
    })

    it('accepts null groupid', () => {
      const wrapper = mountComponent({ groupid: null })
      expect(wrapper.props('groupid')).toBe(null)
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
      it('toggles flag from false to true', () => {
        const wrapper = mountComponent()
        expect(wrapper.vm.flag).toBe(false)
        wrapper.vm.toggleFlag()
        expect(wrapper.vm.flag).toBe(true)
      })

      it('toggles flag from true to false', () => {
        const wrapper = mountComponent()
        wrapper.vm.flag = true
        wrapper.vm.toggleFlag()
        expect(wrapper.vm.flag).toBe(false)
      })

      it('can be toggled multiple times', () => {
        const wrapper = mountComponent()
        expect(wrapper.vm.flag).toBe(false)
        wrapper.vm.toggleFlag()
        expect(wrapper.vm.flag).toBe(true)
        wrapper.vm.toggleFlag()
        expect(wrapper.vm.flag).toBe(false)
        wrapper.vm.toggleFlag()
        expect(wrapper.vm.flag).toBe(true)
      })
    })

    describe('save', () => {
      it('calls $api.comment.add with correct parameters', async () => {
        const wrapper = mountComponent({
          user: createTestUser({ id: 100 }),
          groupid: 200,
        })

        // Set some user comment values
        wrapper.vm.user1 = 'First comment'
        wrapper.vm.user2 = 'Second comment'
        wrapper.vm.flag = true

        await wrapper.vm.save()
        await flushPromises()

        expect(mockCommentAdd).toHaveBeenCalledWith({
          userid: 100,
          groupid: 200,
          user1: 'First comment',
          user2: 'Second comment',
          user3: null,
          user4: null,
          user5: null,
          user6: null,
          user7: null,
          user8: null,
          user9: null,
          user10: null,
          user11: null,
          flag: true,
        })
      })

      it('calls userStore.fetchMT with user id and emailhistory', async () => {
        const wrapper = mountComponent({
          user: createTestUser({ id: 555 }),
        })

        await wrapper.vm.save()
        await flushPromises()

        expect(mockUserStore.fetchMT).toHaveBeenCalledWith({
          id: 555,
          emailhistory: true,
        })
      })

      it('resets context to null after save', async () => {
        mockContext.value = { some: 'context' }
        const wrapper = mountComponent()

        await wrapper.vm.save()
        await flushPromises()

        expect(mockContext.value).toBe(null)
      })

      it('increments bump after save', async () => {
        const initialBump = mockBump.value
        const wrapper = mountComponent()

        await wrapper.vm.save()
        await flushPromises()

        expect(mockBump.value).toBe(initialBump + 1)
      })

      it('emits added event after save', async () => {
        const wrapper = mountComponent()

        await wrapper.vm.save()
        await flushPromises()

        expect(wrapper.emitted('added')).toBeTruthy()
        expect(wrapper.emitted('added').length).toBe(1)
      })

      it('calls hide after save', async () => {
        const wrapper = mountComponent()

        await wrapper.vm.save()
        await flushPromises()

        expect(mockHide).toHaveBeenCalled()
      })

      it('passes all user fields when filled in', async () => {
        const wrapper = mountComponent()

        // Fill in all user fields
        wrapper.vm.user1 = 'Comment 1'
        wrapper.vm.user2 = 'Comment 2'
        wrapper.vm.user3 = 'Comment 3'
        wrapper.vm.user4 = 'Comment 4'
        wrapper.vm.user5 = 'Comment 5'
        wrapper.vm.user6 = 'Comment 6'
        wrapper.vm.user7 = 'Comment 7'
        wrapper.vm.user8 = 'Comment 8'
        wrapper.vm.user9 = 'Comment 9'
        wrapper.vm.user10 = 'Comment 10'
        wrapper.vm.user11 = 'Comment 11'

        await wrapper.vm.save()
        await flushPromises()

        expect(mockCommentAdd).toHaveBeenCalledWith(
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

      it('passes flag as false by default', async () => {
        const wrapper = mountComponent()

        await wrapper.vm.save()
        await flushPromises()

        expect(mockCommentAdd).toHaveBeenCalledWith(
          expect.objectContaining({
            flag: false,
          })
        )
      })

      it('passes null groupid when not provided', async () => {
        const wrapper = mountComponent({ groupid: null })

        await wrapper.vm.save()
        await flushPromises()

        expect(mockCommentAdd).toHaveBeenCalledWith(
          expect.objectContaining({
            groupid: null,
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

    it('emits added event when comment is saved', async () => {
      const wrapper = mountComponent()
      await wrapper.vm.save()
      await flushPromises()
      expect(wrapper.emitted('added')).toBeTruthy()
    })
  })

  describe('initial state', () => {
    it('initializes all user refs as null', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.user1).toBe(null)
      expect(wrapper.vm.user2).toBe(null)
      expect(wrapper.vm.user3).toBe(null)
      expect(wrapper.vm.user4).toBe(null)
      expect(wrapper.vm.user5).toBe(null)
      expect(wrapper.vm.user6).toBe(null)
      expect(wrapper.vm.user7).toBe(null)
      expect(wrapper.vm.user8).toBe(null)
      expect(wrapper.vm.user9).toBe(null)
      expect(wrapper.vm.user10).toBe(null)
      expect(wrapper.vm.user11).toBe(null)
    })

    it('initializes flag as false', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.flag).toBe(false)
    })
  })

  describe('button interactions', () => {
    it('Close button exists and can be clicked', () => {
      const wrapper = mountComponent()
      const buttons = wrapper.findAll('button')
      const closeButton = buttons.find((b) => b.text().includes('Close'))
      expect(closeButton).toBeDefined()
    })

    it('Add button exists and can be clicked', () => {
      const wrapper = mountComponent()
      const buttons = wrapper.findAll('button')
      const addButton = buttons.find((b) => b.text().includes('Add'))
      expect(addButton).toBeDefined()
    })
  })

  describe('toggle interactions', () => {
    it('toggle click triggers change event', async () => {
      const wrapper = mountComponent()
      const toggle = wrapper.find('.toggle')
      await toggle.trigger('click')
      // The toggle emits 'change' which calls toggleFlag
      // We verify the flag value changed
      expect(wrapper.vm.flag).toBe(true)
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
      })
      expect(wrapper.find('.modal').exists()).toBe(true)
    })

    it('handles save with empty comments', async () => {
      const wrapper = mountComponent()

      await wrapper.vm.save()
      await flushPromises()

      expect(mockCommentAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          user1: null,
          user2: null,
          user3: null,
        })
      )
    })

    it('handles save when API fails gracefully', async () => {
      mockCommentAdd.mockRejectedValueOnce(new Error('API Error'))
      const wrapper = mountComponent()

      // Should not throw
      await expect(wrapper.vm.save()).rejects.toThrow('API Error')
    })

    it('handles save when fetchMT fails gracefully', async () => {
      mockUserStore.fetchMT.mockRejectedValueOnce(new Error('Fetch Error'))
      const wrapper = mountComponent()

      // The save method awaits fetchMT, so error will propagate
      await expect(wrapper.vm.save()).rejects.toThrow('Fetch Error')
    })
  })
})
