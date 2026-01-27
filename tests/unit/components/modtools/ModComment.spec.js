import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import ModComment from '~/modtools/components/ModComment.vue'

// Mock composables
vi.mock('~/composables/useModMembers', () => ({
  setupModMembers: () => ({
    bump: { value: 0 },
    context: { value: null },
  }),
}))

vi.mock('~/composables/useMe', () => ({
  useMe: () => ({
    myid: 999,
    supportOrAdmin: false,
    myGroup: vi.fn((groupid) =>
      groupid === 1 ? { id: 1, namedisplay: 'My Test Group' } : null
    ),
  }),
}))

vi.mock('~/composables/useModMe', () => ({
  useModMe: () => ({
    amAModOn: vi.fn((groupid) => groupid === 1),
  }),
}))

// Mock Pinia stores
const mockGroupStore = {
  get: vi.fn((id) =>
    id === 2 ? { id: 2, namedisplay: 'Fetched Group' } : null
  ),
  fetch: vi.fn(),
}

const mockUserStore = {
  fetchMT: vi.fn(),
  byId: vi.fn(),
  deleteComment: vi.fn(),
}

vi.mock('~/stores/group', () => ({
  useGroupStore: () => mockGroupStore,
}))

vi.mock('~/stores/user', () => ({
  useUserStore: () => mockUserStore,
}))

describe('ModComment', () => {
  const defaultComment = {
    id: 100,
    user1: 'First comment line',
    user2: 'Second comment line',
    user3: null,
    flag: false,
    byuser: { id: 456, displayname: 'Mod User' },
    byuserid: 456,
    date: '2024-01-15T10:00:00Z',
    reviewed: '2024-01-15T10:00:00Z',
    groupid: 1,
  }

  const defaultUser = {
    id: 123,
    userid: 123,
    displayname: 'Test User',
    comments: [defaultComment],
  }

  async function createWrapper(
    commentOverrides = {},
    userOverrides = {},
    extraProps = {}
  ) {
    const wrapper = mount(ModComment, {
      props: {
        comment: { ...defaultComment, ...commentOverrides },
        user: { ...defaultUser, ...userOverrides },
        expandComments: false,
        ...extraProps,
      },
      global: {
        stubs: {
          NoticeMessage: {
            template:
              '<div class="notice-message" :class="variant"><slot /></div>',
            props: ['variant'],
          },
          'v-icon': {
            template: '<i :data-icon="icon" />',
            props: ['icon'],
          },
          'b-button': {
            template:
              '<button :data-variant="variant" :data-size="size" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant', 'size'],
          },
          ReadMore: {
            template: '<span class="read-more">{{ text }}</span>',
            props: ['text', 'maxChars'],
          },
          ConfirmModal: {
            template: '<div class="confirm-modal" />',
          },
          ModCommentEditModal: {
            template: '<div class="edit-modal" />',
            props: ['user', 'comment', 'groupname'],
          },
        },
      },
    })
    await flushPromises()
    return wrapper
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders NoticeMessage when mounted with valid comment', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.notice-message').exists()).toBe(true)
    })

    it('renders NoticeMessage with danger variant', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.notice-message.danger').exists()).toBe(true)
    })

    it('displays user1 comment text', async () => {
      const wrapper = await createWrapper({ user1: 'Important note' })
      expect(wrapper.text()).toContain('Important note')
    })

    it('displays multiple user comment fields (user1 through user10)', async () => {
      const wrapper = await createWrapper({
        user1: 'Line 1',
        user2: 'Line 2',
        user3: 'Line 3',
      })
      expect(wrapper.text()).toContain('Line 1')
      expect(wrapper.text()).toContain('Line 2')
      expect(wrapper.text()).toContain('Line 3')
    })

    it('shows warning icon when flag is true', async () => {
      const wrapper = await createWrapper({ flag: true })
      expect(wrapper.find('i[data-icon="exclamation-triangle"]').exists()).toBe(
        true
      )
    })

    it('does not show warning icon when flag is false', async () => {
      const wrapper = await createWrapper({ flag: false })
      expect(wrapper.find('i[data-icon="exclamation-triangle"]').exists()).toBe(
        false
      )
    })
  })

  describe('byuser display', () => {
    it('shows byuser displayname when present', async () => {
      const wrapper = await createWrapper({
        byuser: { id: 456, displayname: 'Moderator Jane' },
      })
      expect(wrapper.text()).toContain('by')
      expect(wrapper.text()).toContain('Moderator Jane')
    })

    it('does not show byuser section when byuser is null', async () => {
      const wrapper = await createWrapper({ byuser: null })
      expect(wrapper.text()).not.toContain('by -')
    })
  })

  describe('date display', () => {
    it('shows separate created and reviewed dates when different', async () => {
      const wrapper = await createWrapper({
        date: '2024-01-10T10:00:00Z',
        reviewed: '2024-01-15T10:00:00Z',
      })
      expect(wrapper.text()).toContain('Created')
      expect(wrapper.text()).toContain('reviewed')
    })

    it('shows single date with timeadapt when date equals reviewed', async () => {
      const wrapper = await createWrapper({
        date: '2024-01-15T10:00:00Z',
        reviewed: '2024-01-15T10:00:00Z',
      })
      expect(wrapper.text()).toContain('adapted:')
      expect(wrapper.text()).not.toContain('Created')
    })
  })

  describe('groupname computed property', () => {
    it('returns group namedisplay when found via myGroup', async () => {
      const wrapper = await createWrapper({ groupid: 1 })
      expect(wrapper.text()).toContain('My Test Group')
    })

    it('returns fallback #groupid when group not found', async () => {
      const wrapper = await createWrapper({ groupid: 99 })
      expect(wrapper.text()).toContain('#99')
    })

    it('uses groupStore.get when myGroup returns null', async () => {
      const wrapper = await createWrapper({ groupid: 2 })
      expect(wrapper.text()).toContain('Fetched Group')
    })

    it('does not show groupname section when groupid is null', async () => {
      const wrapper = await createWrapper({ groupid: null })
      expect(wrapper.text()).not.toContain(' on ')
    })
  })

  describe('edit/delete buttons visibility', () => {
    it('shows buttons when user is mod on comment group', async () => {
      const wrapper = await createWrapper({ groupid: 1 })
      expect(wrapper.text()).toContain('Edit')
      expect(wrapper.text()).toContain('Delete')
    })

    it('shows buttons when user created the comment', async () => {
      const wrapper = await createWrapper({ groupid: 99, byuserid: 999 })
      expect(wrapper.text()).toContain('Edit')
      expect(wrapper.text()).toContain('Delete')
    })

    it('hides buttons when user has no permission', async () => {
      const wrapper = await createWrapper({ groupid: 99, byuserid: 456 })
      expect(wrapper.text()).not.toContain('Edit')
      expect(wrapper.text()).not.toContain('Delete')
    })
  })

  describe('deleteIt method', () => {
    it('sets showConfirmDelete to true when delete clicked', async () => {
      const wrapper = await createWrapper({ groupid: 1 })
      const deleteButton = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Delete'))
      await deleteButton.trigger('click')
      expect(wrapper.find('.confirm-modal').exists()).toBe(true)
    })
  })

  describe('editIt method', () => {
    it('shows edit modal and emits editing event', async () => {
      const wrapper = await createWrapper({ groupid: 1 })
      const editButton = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Edit'))
      await editButton.trigger('click')
      expect(wrapper.find('.edit-modal').exists()).toBe(true)
      expect(wrapper.emitted('editing')).toBeTruthy()
    })
  })

  describe('deleteConfirmed method', () => {
    it('calls userStore.deleteComment with comment id', async () => {
      const wrapper = await createWrapper({ groupid: 1, id: 555 })

      mockUserStore.byId.mockReturnValue({
        ...defaultUser,
        comments: [],
      })

      await wrapper.vm.deleteConfirmed()
      expect(mockUserStore.deleteComment).toHaveBeenCalledWith(555)
    })
  })

  describe('expandComments prop', () => {
    it('renders ReadMore component when comment text exists', async () => {
      const wrapper = await createWrapper(
        { user1: 'Test text' },
        {},
        { expandComments: false }
      )
      expect(wrapper.find('.read-more').exists()).toBe(true)
    })

    it('renders ReadMore with expandComments true', async () => {
      const wrapper = await createWrapper(
        { user1: 'Test text' },
        {},
        { expandComments: true }
      )
      expect(wrapper.find('.read-more').exists()).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('handles user without userid property (uses id instead)', async () => {
      mockUserStore.byId.mockReturnValue({
        id: 123,
        displayname: 'Test User',
        comments: [defaultComment],
      })

      const wrapper = await createWrapper({}, { userid: undefined, id: 123 })
      await wrapper.vm.updateComments()

      expect(mockUserStore.fetchMT).toHaveBeenCalledWith({
        id: 123,
        emailhistory: true,
      })
    })

    it('handles null comment fields gracefully', async () => {
      const wrapper = await createWrapper({
        user1: null,
        user2: null,
        user3: null,
      })
      expect(wrapper.find('.notice-message').exists()).toBe(true)
    })

    it('fetches group when groupid present but not found locally', async () => {
      await createWrapper({ groupid: 999 })
      expect(mockGroupStore.fetch).toHaveBeenCalledWith(999)
    })
  })
})
