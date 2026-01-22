import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ModChatReviewUser from '~/modtools/components/ModChatReviewUser.vue'

describe('ModChatReviewUser', () => {
  const defaultProps = {
    user: {
      id: 123,
      displayname: 'Test User',
      emails: [
        { email: 'test@example.com', preferred: true, ourdomain: false },
      ],
      comments: [],
    },
    groupid: 456,
  }

  function mountComponent(props = {}) {
    return mount(ModChatReviewUser, {
      props: { ...defaultProps, ...props },
      global: {
        stubs: {
          'b-button': {
            template: '<button @click="$emit(\'click\')"><slot /></button>',
          },
          'v-icon': {
            template: '<span class="icon" />',
            props: ['icon', 'scale'],
          },
          ExternalLink: {
            template: '<a :href="href"><slot /></a>',
            props: ['href'],
          },
          ModClipboard: {
            template: '<span class="clipboard" />',
            props: ['value'],
          },
          ModComment: {
            template: '<div class="comment" />',
            props: ['comment', 'user'],
          },
          ModCommentAddModal: {
            template: '<div class="add-modal" />',
            props: ['user', 'groupid'],
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders user displayname', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Test User')
    })

    it('renders user id', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('123')
    })

    it('renders tag when provided', () => {
      const wrapper = mountComponent({ tag: 'From: ' })
      expect(wrapper.text()).toContain('From:')
    })

    it('does not render tag when not provided', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).not.toContain('From:')
    })

    it('renders TN user id when present', () => {
      const wrapper = mountComponent({
        user: {
          ...defaultProps.user,
          tnuserid: 789,
        },
      })
      expect(wrapper.text()).toContain('TN user id')
      expect(wrapper.text()).toContain('789')
    })

    it('renders LoveJunk user id when present', () => {
      const wrapper = mountComponent({
        user: {
          ...defaultProps.user,
          ljuserid: 999,
        },
      })
      expect(wrapper.text()).toContain('LoveJunk user id')
      expect(wrapper.text()).toContain('999')
    })

    it('renders Add note button', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Add note')
    })

    it('renders comments when user has comments', () => {
      const wrapper = mountComponent({
        user: {
          ...defaultProps.user,
          comments: [
            { id: 1, user1: 'Comment 1' },
            { id: 2, user1: 'Comment 2' },
          ],
        },
      })
      expect(wrapper.findAll('.comment')).toHaveLength(2)
    })
  })

  describe('email computed property', () => {
    it('returns email when user has emails', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.email).toBe('test@example.com')
    })

    it('returns null when user has no emails', () => {
      const wrapper = mountComponent({
        user: {
          ...defaultProps.user,
          emails: [],
        },
      })
      expect(wrapper.vm.email).toBe(null)
    })

    it('skips ourdomain emails', () => {
      const wrapper = mountComponent({
        user: {
          ...defaultProps.user,
          emails: [
            {
              email: 'internal@ourdomain.com',
              preferred: true,
              ourdomain: true,
            },
            {
              email: 'external@example.com',
              preferred: false,
              ourdomain: false,
            },
          ],
        },
      })
      expect(wrapper.vm.email).toBe('external@example.com')
    })

    it('prefers preferred email', () => {
      const wrapper = mountComponent({
        user: {
          ...defaultProps.user,
          emails: [
            { email: 'first@example.com', preferred: false, ourdomain: false },
            {
              email: 'preferred@example.com',
              preferred: true,
              ourdomain: false,
            },
          ],
        },
      })
      expect(wrapper.vm.email).toBe('preferred@example.com')
    })

    it('displays email with mailto link', () => {
      const wrapper = mountComponent()
      const link = wrapper.find('a[href="mailto:test@example.com"]')
      expect(link.exists()).toBe(true)
      expect(link.text()).toBe('test@example.com')
    })
  })

  describe('methods', () => {
    it('addAComment sets showAddCommentModal to true', async () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.showAddCommentModal).toBe(false)
      wrapper.vm.addAComment()
      expect(wrapper.vm.showAddCommentModal).toBe(true)
    })

    it('updateComments emits reload', () => {
      const wrapper = mountComponent()
      wrapper.vm.updateComments()
      expect(wrapper.emitted('reload')).toHaveLength(1)
    })

    it('clicking Add note button shows modal', async () => {
      const wrapper = mountComponent()
      await wrapper.find('button').trigger('click')
      expect(wrapper.vm.showAddCommentModal).toBe(true)
    })
  })

  describe('props', () => {
    it('accepts user prop', () => {
      const wrapper = mountComponent()
      expect(wrapper.props('user').id).toBe(123)
    })

    it('accepts groupid prop', () => {
      const wrapper = mountComponent()
      expect(wrapper.props('groupid')).toBe(456)
    })

    it('has default null for tag prop', () => {
      const wrapper = mountComponent()
      expect(wrapper.props('tag')).toBe(null)
    })
  })
})
