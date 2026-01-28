import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, Suspense } from 'vue'
import NewsThread from '~/components/NewsThread.vue'

const {
  mockNewsfeed,
  mockTagusers,
  mockMe,
  mockBreakpoint,
  mockChitChatMod,
  mockSupportOrAdmin,
  mockFetch,
  mockSend,
  mockDelete,
  mockUnfollow,
  mockReferTo,
  mockConvertToStory,
  mockHide,
  mockUnhide,
  mockTeamFetch,
  mockMuteOnChitChat,
  mockUnMuteOnChitChat,
} = vi.hoisted(() => {
  const { ref } = require('vue')
  return {
    mockNewsfeed: ref({
      id: 1,
      threadhead: 1,
      userid: 100,
      type: 'Message',
      message: 'Test message content',
      displayname: 'Test User',
      deleted: false,
      hidden: false,
      hiddenby: null,
      closed: false,
      replies: [],
      previews: [],
    }),
    mockTagusers: ref([
      { displayname: 'User One' },
      { displayname: 'User Two' },
    ]),
    mockMe: ref({
      id: 1,
      displayname: 'Current User',
      systemrole: 'User',
      profile: { path: '/me.jpg' },
      settings: { enterNewLine: false },
    }),
    mockBreakpoint: ref('md'),
    mockChitChatMod: ref(false),
    mockSupportOrAdmin: ref(false),
    mockFetch: vi.fn(),
    mockSend: vi.fn(),
    mockDelete: vi.fn(),
    mockUnfollow: vi.fn(),
    mockReferTo: vi.fn(),
    mockConvertToStory: vi.fn(),
    mockHide: vi.fn(),
    mockUnhide: vi.fn(),
    mockTeamFetch: vi.fn(),
    mockMuteOnChitChat: vi.fn(),
    mockUnMuteOnChitChat: vi.fn(),
  }
})

const mockNewsfeedStore = {
  byId: vi.fn((id) => (id === 1 ? mockNewsfeed.value : null)),
  get tagusers() {
    return mockTagusers.value
  },
  fetch: mockFetch,
  send: mockSend,
  delete: mockDelete,
  unfollow: mockUnfollow,
  referTo: mockReferTo,
  convertToStory: mockConvertToStory,
  hide: mockHide,
  unhide: mockUnhide,
}

const mockMiscStore = {
  get breakpoint() {
    return mockBreakpoint.value
  },
}

const mockAuthStore = {
  get user() {
    return mockMe.value
  },
  saveAndGet: vi.fn(),
}

const mockTeamStore = {
  fetch: mockTeamFetch,
}

const mockUserStore = {
  muteOnChitChat: mockMuteOnChitChat,
  unMuteOnChitChat: mockUnMuteOnChitChat,
}

vi.mock('~/stores/newsfeed', () => ({
  useNewsfeedStore: () => mockNewsfeedStore,
}))

vi.mock('~/stores/misc', () => ({
  useMiscStore: () => mockMiscStore,
}))

vi.mock('~/stores/auth', () => ({
  useAuthStore: () => mockAuthStore,
}))

vi.mock('~/stores/team', () => ({
  useTeamStore: () => mockTeamStore,
}))

vi.mock('~/stores/user', () => ({
  useUserStore: () => mockUserStore,
}))

vi.mock('~/composables/useMe', () => {
  const { computed } = require('vue')
  return {
    useMe: () => ({
      // Use actual computed refs that reactively track the mock values
      chitChatMod: computed(() => mockChitChatMod.value),
      supportOrAdmin: computed(() => mockSupportOrAdmin.value),
    }),
  }
})

vi.mock('~/composables/useTwem', () => ({
  untwem: vi.fn((text) => text),
}))

// Mock child components
vi.mock('~/components/AutoHeightTextarea', () => ({
  default: {
    name: 'AutoHeightTextarea',
    template:
      '<textarea class="auto-height-textarea" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" @focus="$emit(\'focus\')"></textarea>',
    props: [
      'modelValue',
      'size',
      'rows',
      'maxRows',
      'maxlength',
      'spellcheck',
      'placeholder',
      'autocapitalize',
    ],
    emits: ['update:modelValue', 'focus'],
  },
}))

vi.mock('~/components/NewsReplies', () => ({
  default: {
    name: 'NewsReplies',
    template: '<div class="news-replies"></div>',
    props: ['id', 'threadhead', 'scrollTo', 'replyTo', 'depth'],
    emits: ['rendered'],
  },
}))

vi.mock('~/components/NewsRefer', () => ({
  default: {
    name: 'NewsRefer',
    template: '<div class="news-refer"></div>',
    props: ['id', 'newsfeed'],
    emits: ['focus-comment', 'hide'],
  },
}))

vi.mock('~/components/NewsMessage', () => ({
  default: {
    name: 'NewsMessage',
    template: '<div class="news-message"></div>',
    props: ['id', 'newsfeed'],
    emits: ['focus-comment', 'hide'],
  },
}))

vi.mock('~/components/NewsAboutMe', () => ({
  default: {
    name: 'NewsAboutMe',
    template: '<div class="news-about-me"></div>',
    props: ['id', 'newsfeed'],
    emits: ['focus-comment', 'hide'],
  },
}))

vi.mock('~/components/NewsCommunityEvent', () => ({
  default: {
    name: 'NewsCommunityEvent',
    template: '<div class="news-community-event"></div>',
    props: ['id', 'newsfeed'],
    emits: ['focus-comment', 'hide'],
  },
}))

vi.mock('~/components/NewsVolunteerOpportunity', () => ({
  default: {
    name: 'NewsVolunteerOpportunity',
    template: '<div class="news-volunteer-opportunity"></div>',
    props: ['id', 'newsfeed'],
    emits: ['focus-comment', 'hide'],
  },
}))

vi.mock('~/components/NewsStory', () => ({
  default: {
    name: 'NewsStory',
    template: '<div class="news-story"></div>',
    props: ['id', 'newsfeed'],
    emits: ['focus-comment', 'hide'],
  },
}))

vi.mock('~/components/NewsAlert', () => ({
  default: {
    name: 'NewsAlert',
    template: '<div class="news-alert"></div>',
    props: ['id', 'newsfeed'],
    emits: ['focus-comment', 'hide'],
  },
}))

vi.mock('~/components/NewsNoticeboard', () => ({
  default: {
    name: 'NewsNoticeboard',
    template: '<div class="news-noticeboard"></div>',
    props: ['id', 'newsfeed'],
    emits: ['focus-comment', 'hide'],
  },
}))

vi.mock('~/components/NewsPreviews', () => ({
  default: {
    name: 'NewsPreviews',
    template: '<div class="news-previews"></div>',
    props: ['previews'],
  },
}))

vi.mock('~/components/ProfileImage', () => ({
  default: {
    name: 'ProfileImage',
    template: '<img class="profile-image" :src="image" />',
    props: ['image', 'isThumbnail', 'size', 'lazy'],
  },
}))

vi.mock('~/components/NoticeMessage', () => ({
  default: {
    name: 'NoticeMessage',
    template: '<div class="notice-message"><slot /></div>',
    props: ['variant'],
  },
}))

// Mock defineAsyncComponent
vi.mock('vue', async (importOriginal) => {
  const mod = await importOriginal()
  return {
    ...mod,
    defineAsyncComponent: (loader) => ({
      name: 'AsyncComponent',
      template: '<div class="async-component"><slot /></div>',
      props: ['id', 'threadhead'],
      emits: ['hidden', 'confirm'],
    }),
  }
})

describe('NewsThread', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockNewsfeed.value = {
      id: 1,
      threadhead: 1,
      userid: 100,
      type: 'Message',
      message: 'Test message content',
      displayname: 'Test User',
      deleted: false,
      hidden: false,
      hiddenby: null,
      closed: false,
      replies: [],
      previews: [],
    }
    mockMe.value = {
      id: 1,
      displayname: 'Current User',
      systemrole: 'User',
      profile: { path: '/me.jpg' },
      settings: { enterNewLine: false },
    }
    mockBreakpoint.value = 'md'
    mockChitChatMod.value = false
    mockSupportOrAdmin.value = false
    mockNewsfeedStore.byId.mockImplementation((id) =>
      id === 1 ? mockNewsfeed.value : null
    )
  })

  async function createWrapper(props = {}) {
    const TestWrapper = defineComponent({
      setup() {
        return () =>
          h(Suspense, null, {
            default: () =>
              h(NewsThread, {
                id: 1,
                ...props,
              }),
            fallback: () => h('div', 'Loading...'),
          })
      },
    })

    const wrapper = mount(TestWrapper, {
      global: {
        stubs: {
          'b-card': {
            template:
              '<div class="b-card" :class="$attrs.class"><slot /><template v-if="$slots.footer"><div class="card-footer"><slot name="footer" /></div></template></div>',
            props: ['noBody'],
          },
          'b-card-body': {
            template: '<div class="b-card-body"><slot /></div>',
            props: ['class'],
          },
          'b-card-text': {
            template: '<div class="b-card-text"><slot /></div>',
          },
          'b-dropdown': {
            template:
              '<div class="b-dropdown"><slot name="button-content" /><div class="dropdown-menu"><slot /></div></div>',
            props: ['lazy', 'right', 'variant', 'noCaret'],
          },
          'b-dropdown-item': {
            template:
              '<button class="dropdown-item" @click="$emit(\'click\')"><slot /></button>',
            props: ['href', 'target', 'bVModal'],
            emits: ['click'],
          },
          'b-input-group': {
            template:
              '<div class="b-input-group"><slot name="prepend" /><slot /></div>',
          },
          'v-icon': {
            template: '<span class="v-icon" :data-icon="icon" />',
            props: ['icon'],
          },
          UserName: {
            template:
              '<span class="user-name" :data-id="id">{{ intro }}</span>',
            props: ['id', 'intro'],
          },
          'notice-message': {
            template: '<div class="notice-message"><slot /></div>',
            props: ['variant'],
          },
          OurUploadedImage: {
            template: '<img class="our-uploaded-image" :src="src" />',
            props: ['src', 'modifiers', 'alt', 'width'],
          },
          NuxtPicture: {
            template: '<img class="nuxt-picture" :src="src" />',
            props: ['format', 'provider', 'src', 'modifiers', 'alt', 'width'],
          },
          OurUploader: {
            template: '<div class="our-uploader" />',
            props: ['modelValue', 'type'],
            emits: ['update:modelValue'],
          },
          OurAtTa: {
            template: '<div class="our-at-ta"><slot /></div>',
            props: ['members', 'filterMatch'],
          },
          NewsEditModal: {
            template: '<div class="news-edit-modal" />',
            props: ['id', 'threadhead'],
          },
          NewsReportModal: {
            template: '<div class="news-report-modal" />',
            props: ['id'],
            emits: ['hidden'],
          },
          ConfirmModal: {
            template:
              '<div class="confirm-modal"><button class="confirm-btn" @click="$emit(\'confirm\')">Confirm</button></div>',
            props: ['title'],
            emits: ['confirm', 'hidden'],
          },
        },
      },
    })

    await flushPromises()
    return wrapper
  }

  describe('rendering', () => {
    it('renders thread container when showThis is true', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.bg-white').exists()).toBe(true)
    })

    it('renders b-card with correct background class', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.b-card').exists()).toBe(true)
    })

    it('applies card__default background for Message type', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.card__default').exists()).toBe(true)
    })

    it('applies card__community-event background for CommunityEvent type', async () => {
      mockNewsfeed.value.type = 'CommunityEvent'
      const wrapper = await createWrapper()
      expect(wrapper.find('.card__community-event').exists()).toBe(true)
    })

    it('applies card__volunteer-opportunity background for VolunteerOpportunity type', async () => {
      mockNewsfeed.value.type = 'VolunteerOpportunity'
      const wrapper = await createWrapper()
      expect(wrapper.find('.card__volunteer-opportunity').exists()).toBe(true)
    })

    it('renders the correct news component for Message type', async () => {
      mockNewsfeed.value.type = 'Message'
      const wrapper = await createWrapper()
      expect(wrapper.find('.news-message').exists()).toBe(true)
    })

    it('renders the correct news component for AboutMe type', async () => {
      mockNewsfeed.value.type = 'AboutMe'
      const wrapper = await createWrapper()
      expect(wrapper.find('.news-about-me').exists()).toBe(true)
    })

    it('renders the correct news component for Story type', async () => {
      mockNewsfeed.value.type = 'Story'
      const wrapper = await createWrapper()
      expect(wrapper.find('.news-story').exists()).toBe(true)
    })

    it('renders the correct news component for Alert type', async () => {
      mockNewsfeed.value.type = 'Alert'
      const wrapper = await createWrapper()
      expect(wrapper.find('.news-alert').exists()).toBe(true)
    })

    it('renders NoticeMessage for unknown type', async () => {
      mockNewsfeed.value.type = 'UnknownType'
      const wrapper = await createWrapper()
      expect(wrapper.find('.notice-message').exists()).toBe(true)
      expect(wrapper.text()).toContain('Unknown item type')
    })

    it('applies strike class when newsfeed is deleted', async () => {
      mockNewsfeed.value.deleted = true
      const wrapper = await createWrapper()
      expect(wrapper.html()).toContain('strike')
    })
  })

  describe('hidden thread display', () => {
    beforeEach(() => {
      mockNewsfeed.value.hidden = true
      mockMe.value.systemrole = 'Moderator'
    })

    it('shows hidden notice for moderators', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('This has been hidden')
    })

    it('shows "by" and UserName when hiddenby is set', async () => {
      mockNewsfeed.value.hiddenby = 50
      const wrapper = await createWrapper()
      expect(wrapper.find('.user-name').exists()).toBe(true)
      expect(wrapper.find('.user-name').attributes('data-id')).toBe('50')
    })

    it('shows "the system" when hiddenby is not set', async () => {
      mockNewsfeed.value.hiddenby = null
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('the system')
    })

    it('does not show hidden notice for regular users', async () => {
      mockMe.value.systemrole = 'User'
      const wrapper = await createWrapper()
      expect(wrapper.text()).not.toContain('This has been hidden')
    })
  })

  describe('dropdown menu', () => {
    it('renders dropdown menu', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.b-dropdown').exists()).toBe(true)
    })

    it('shows "Open in new window" option', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Open in new window')
    })

    it('shows "Unfollow this thread" option', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Unfollow this thread')
    })

    it('shows "Report this thread" option', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Report this thread')
    })

    it('shows "Show combined posts separately" when duplicateCount > 1', async () => {
      const wrapper = await createWrapper({ duplicateCount: 3 })
      expect(wrapper.text()).toContain('Show 3 combined posts separately')
    })

    it('hides "Show combined posts separately" when duplicateCount <= 1', async () => {
      const wrapper = await createWrapper({ duplicateCount: 1 })
      expect(wrapper.text()).not.toContain('combined posts separately')
    })

    it('shows Edit option for post owner', async () => {
      mockNewsfeed.value.userid = 1
      mockMe.value.id = 1
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Edit')
    })

    it('shows Edit option for moderator', async () => {
      mockNewsfeed.value.userid = 100
      mockMe.value.id = 1
      mockMe.value.systemrole = 'Moderator'
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Edit')
    })

    it('hides Edit option for non-owner non-moderator', async () => {
      mockNewsfeed.value.userid = 100
      mockMe.value.id = 1
      mockMe.value.systemrole = 'User'
      const wrapper = await createWrapper()
      const editItems = wrapper
        .findAll('.dropdown-item')
        .filter((item) => item.text() === 'Edit')
      expect(editItems.length).toBe(0)
    })

    it('shows Delete option for post owner', async () => {
      mockNewsfeed.value.userid = 1
      mockMe.value.id = 1
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Delete this thread')
    })
  })

  describe('refer options', () => {
    beforeEach(() => {
      mockMe.value.systemrole = 'Moderator'
      mockNewsfeed.value.type = 'Message'
    })

    it('shows refer options for moderators', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Refer to OFFER')
      expect(wrapper.text()).toContain('Refer to WANTED')
      expect(wrapper.text()).toContain('Refer to TAKEN')
      expect(wrapper.text()).toContain('Refer to RECEIVED')
    })

    it('shows refer options for support/admin', async () => {
      // supportOrAdmin alone allows refer - no mod role needed
      // But the canRefer computed won't be directly accessible from vm
      // because script setup exposes computed refs differently
      // Instead we verify by checking that the dropdown items appear
      mockMe.value.systemrole = 'User'
      mockSupportOrAdmin.value = true
      const wrapper = await createWrapper()
      // When supportOrAdmin is true, the refer options should be visible
      expect(wrapper.text()).toContain('Refer to OFFER')
    })

    it('hides refer options for AboutMe type even for moderators', async () => {
      mockNewsfeed.value.type = 'AboutMe'
      mockSupportOrAdmin.value = false
      const wrapper = await createWrapper()
      expect(wrapper.text()).not.toContain('Refer to OFFER')
    })

    it('hides refer options for regular users', async () => {
      mockMe.value.systemrole = 'User'
      mockSupportOrAdmin.value = false
      const wrapper = await createWrapper()
      expect(wrapper.text()).not.toContain('Refer to OFFER')
    })
  })

  describe('story conversion', () => {
    beforeEach(() => {
      mockMe.value.systemrole = 'Moderator'
    })

    it('shows "Turn into Story" for moderators when type is not Story', async () => {
      mockNewsfeed.value.type = 'Message'
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Turn this into a Story')
    })

    it('hides "Turn into Story" when type is already Story', async () => {
      mockNewsfeed.value.type = 'Story'
      const wrapper = await createWrapper()
      expect(wrapper.text()).not.toContain('Turn this into a Story')
    })

    it('hides "Turn into Story" for regular users', async () => {
      mockMe.value.systemrole = 'User'
      const wrapper = await createWrapper()
      expect(wrapper.text()).not.toContain('Turn this into a Story')
    })
  })

  describe('chitchat mod options', () => {
    beforeEach(() => {
      mockChitChatMod.value = true
    })

    it('shows Hide option for chitchat mod when not hidden', async () => {
      mockNewsfeed.value.hidden = false
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Hide this thread')
    })

    it('shows Unhide option for chitchat mod when hidden', async () => {
      mockNewsfeed.value.hidden = true
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Unhide this thread')
    })

    it('shows Mute user option for chitchat mod when not hidden', async () => {
      mockNewsfeed.value.hidden = false
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Mute user on ChitChat')
    })

    it('shows Unmute user option for chitchat mod when hidden', async () => {
      mockNewsfeed.value.hidden = true
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Unmute user on ChitChat')
    })

    it('hides mod options for non-chitchat mods', async () => {
      mockChitChatMod.value = false
      const wrapper = await createWrapper()
      expect(wrapper.text()).not.toContain('Hide this thread')
      expect(wrapper.text()).not.toContain('Mute user on ChitChat')
    })
  })

  describe('previews', () => {
    it('renders NewsPreviews when previews exist and no html', async () => {
      mockNewsfeed.value.previews = [{ url: 'https://example.com' }]
      mockNewsfeed.value.html = null
      const wrapper = await createWrapper()
      expect(wrapper.find('.news-previews').exists()).toBe(true)
    })

    it('hides NewsPreviews when html is set', async () => {
      mockNewsfeed.value.previews = [{ url: 'https://example.com' }]
      mockNewsfeed.value.html = '<p>HTML content</p>'
      const wrapper = await createWrapper()
      expect(wrapper.find('.news-previews').exists()).toBe(false)
    })

    it('hides NewsPreviews when previews is empty', async () => {
      mockNewsfeed.value.previews = []
      const wrapper = await createWrapper()
      expect(wrapper.find('.news-previews').exists()).toBe(false)
    })
  })

  describe('replies', () => {
    it('renders NewsReplies when replies exist', async () => {
      mockNewsfeed.value.replies = [1, 2, 3]
      const wrapper = await createWrapper()
      expect(wrapper.find('.news-replies').exists()).toBe(true)
    })

    it('hides NewsReplies when no replies', async () => {
      mockNewsfeed.value.replies = []
      const wrapper = await createWrapper()
      expect(wrapper.find('.news-replies').exists()).toBe(false)
    })
  })

  describe('comment input', () => {
    it('renders comment textarea when thread is not closed', async () => {
      mockNewsfeed.value.closed = false
      const wrapper = await createWrapper()
      expect(wrapper.find('.auto-height-textarea').exists()).toBe(true)
    })

    it('shows closed thread message when thread is closed', async () => {
      mockNewsfeed.value.closed = true
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('This thread is now closed')
    })

    it('hides comment input when newsfeed is deleted', async () => {
      mockNewsfeed.value.deleted = true
      const wrapper = await createWrapper()
      expect(wrapper.find('.our-at-ta').exists()).toBe(false)
    })

    it('shows profile image in comment input', async () => {
      mockMe.value.profile = { path: '/avatar.jpg' }
      const wrapper = await createWrapper()
      expect(wrapper.find('.profile-image').exists()).toBe(true)
    })

    it('computes mobile placeholder on xs breakpoint', async () => {
      mockBreakpoint.value = 'xs'
      const wrapper = await createWrapper()
      const comp = wrapper.findComponent(NewsThread)
      expect(comp.vm.commentPlaceholder).toBe('Comment...')
    })

    it('computes desktop placeholder on md breakpoint', async () => {
      mockBreakpoint.value = 'md'
      const wrapper = await createWrapper()
      const comp = wrapper.findComponent(NewsThread)
      expect(comp.vm.commentPlaceholder).toBe('Write a comment...')
    })
  })

  describe('comment toolbar', () => {
    it('shows toolbar when threadcomment has value', async () => {
      const wrapper = await createWrapper()
      const textarea = wrapper.find('.auto-height-textarea')
      await textarea.setValue('Test comment')
      expect(wrapper.find('.comment-toolbar').exists()).toBe(true)
    })

    it('hides toolbar when threadcomment is empty', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.comment-toolbar').exists()).toBe(false)
    })

    it('shows Photo button in toolbar', async () => {
      const wrapper = await createWrapper()
      const textarea = wrapper.find('.auto-height-textarea')
      await textarea.setValue('Test comment')
      expect(wrapper.text()).toContain('Photo')
    })

    it('shows Send button when enterNewLine is true', async () => {
      mockMe.value.settings = { enterNewLine: true }
      const wrapper = await createWrapper()
      const textarea = wrapper.find('.auto-height-textarea')
      await textarea.setValue('Test comment')
      expect(wrapper.text()).toContain('Send')
    })

    it('hides Send button when enterNewLine is false', async () => {
      mockMe.value.settings = { enterNewLine: false }
      const wrapper = await createWrapper()
      const textarea = wrapper.find('.auto-height-textarea')
      await textarea.setValue('Test comment')
      const sendBtn = wrapper
        .findAll('.toolbar-btn')
        .filter((btn) => btn.text().includes('Send'))
      expect(sendBtn.length).toBe(0)
    })
  })

  describe('props handling', () => {
    it('requires id prop', async () => {
      const wrapper = await createWrapper({ id: 42 })
      expect(wrapper.findComponent(NewsThread).props('id')).toBe(42)
    })

    it('has default scrollTo of empty string', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.findComponent(NewsThread).props('scrollTo')).toBe('')
    })

    it('accepts scrollTo prop', async () => {
      const wrapper = await createWrapper({ scrollTo: 'newsfeed-5' })
      expect(wrapper.findComponent(NewsThread).props('scrollTo')).toBe(
        'newsfeed-5'
      )
    })

    it('has default duplicateCount of 0', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.findComponent(NewsThread).props('duplicateCount')).toBe(0)
    })

    it('accepts duplicateCount prop', async () => {
      const wrapper = await createWrapper({ duplicateCount: 5 })
      expect(wrapper.findComponent(NewsThread).props('duplicateCount')).toBe(5)
    })
  })

  describe('methods and actions', () => {
    it('calls newsfeedStore.fetch on mount', async () => {
      await createWrapper()
      expect(mockFetch).toHaveBeenCalledWith(1)
    })

    it('emits rendered on mount', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.findComponent(NewsThread).emitted('rendered')).toBeTruthy()
    })

    it('calls unfollow when Unfollow clicked', async () => {
      const wrapper = await createWrapper()
      const unfollowBtn = wrapper
        .findAll('.dropdown-item')
        .find((item) => item.text().includes('Unfollow'))
      await unfollowBtn.trigger('click')
      expect(mockUnfollow).toHaveBeenCalledWith(1)
    })

    it('shows report modal when Report clicked', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.news-report-modal').exists()).toBe(false)
      const reportBtn = wrapper
        .findAll('.dropdown-item')
        .find((item) => item.text().includes('Report'))
      await reportBtn.trigger('click')
      await flushPromises()
      expect(wrapper.find('.news-report-modal').exists()).toBe(true)
    })

    it('emits expand-duplicates when Show combined posts clicked', async () => {
      const wrapper = await createWrapper({ duplicateCount: 3 })
      const expandBtn = wrapper
        .findAll('.dropdown-item')
        .find((item) => item.text().includes('combined posts'))
      await expandBtn.trigger('click')
      expect(
        wrapper.findComponent(NewsThread).emitted('expand-duplicates')
      ).toBeTruthy()
      expect(
        wrapper.findComponent(NewsThread).emitted('expand-duplicates')[0]
      ).toEqual([1])
    })

    it('calls referTo when Refer to OFFER clicked', async () => {
      mockMe.value.systemrole = 'Moderator'
      const wrapper = await createWrapper()
      const referBtn = wrapper
        .findAll('.dropdown-item')
        .find((item) => item.text().includes('Refer to OFFER'))
      await referBtn.trigger('click')
      expect(mockReferTo).toHaveBeenCalledWith(1, 'Offer')
    })

    it('calls referTo when Refer to WANTED clicked', async () => {
      mockMe.value.systemrole = 'Moderator'
      const wrapper = await createWrapper()
      const referBtn = wrapper
        .findAll('.dropdown-item')
        .find((item) => item.text().includes('Refer to WANTED'))
      await referBtn.trigger('click')
      expect(mockReferTo).toHaveBeenCalledWith(1, 'Wanted')
    })

    it('calls convertToStory when Turn into Story clicked', async () => {
      mockMe.value.systemrole = 'Moderator'
      mockNewsfeed.value.type = 'Message'
      const wrapper = await createWrapper()
      const storyBtn = wrapper
        .findAll('.dropdown-item')
        .find((item) => item.text().includes('Turn this into a Story'))
      await storyBtn.trigger('click')
      expect(mockConvertToStory).toHaveBeenCalledWith(1)
    })

    it('calls hide when Hide clicked', async () => {
      mockChitChatMod.value = true
      mockNewsfeed.value.hidden = false
      const wrapper = await createWrapper()
      const hideBtn = wrapper
        .findAll('.dropdown-item')
        .find((item) => item.text().includes('Hide this thread'))
      await hideBtn.trigger('click')
      expect(mockHide).toHaveBeenCalledWith(1)
    })

    it('calls unhide when Unhide clicked', async () => {
      mockChitChatMod.value = true
      mockNewsfeed.value.hidden = true
      const wrapper = await createWrapper()
      const unhideBtn = wrapper
        .findAll('.dropdown-item')
        .find((item) => item.text().includes('Unhide this thread'))
      await unhideBtn.trigger('click')
      expect(mockUnhide).toHaveBeenCalledWith(1)
    })

    it('calls muteOnChitChat when Mute clicked', async () => {
      mockChitChatMod.value = true
      mockNewsfeed.value.hidden = false
      const wrapper = await createWrapper()
      const muteBtn = wrapper
        .findAll('.dropdown-item')
        .find((item) => item.text().includes('Mute user on ChitChat'))
      await muteBtn.trigger('click')
      expect(mockMuteOnChitChat).toHaveBeenCalledWith(100)
    })

    it('calls unMuteOnChitChat when Unmute clicked', async () => {
      mockChitChatMod.value = true
      mockNewsfeed.value.hidden = true
      const wrapper = await createWrapper()
      const unmuteBtn = wrapper
        .findAll('.dropdown-item')
        .find((item) => item.text().includes('Unmute user on ChitChat'))
      await unmuteBtn.trigger('click')
      expect(mockUnMuteOnChitChat).toHaveBeenCalledWith(100)
    })
  })

  describe('delete functionality', () => {
    beforeEach(() => {
      mockNewsfeed.value.userid = 1
      mockMe.value.id = 1
    })

    it('shows delete modal when Delete clicked', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.confirm-modal').exists()).toBe(false)
      const deleteBtn = wrapper
        .findAll('.dropdown-item')
        .find((item) => item.text().includes('Delete this thread'))
      await deleteBtn.trigger('click')
      await flushPromises()
      expect(wrapper.find('.confirm-modal').exists()).toBe(true)
    })

    it('calls newsfeedStore.delete when confirmed', async () => {
      const wrapper = await createWrapper()
      const deleteBtn = wrapper
        .findAll('.dropdown-item')
        .find((item) => item.text().includes('Delete this thread'))
      await deleteBtn.trigger('click')
      await flushPromises()
      const confirmBtn = wrapper.find('.confirm-btn')
      await confirmBtn.trigger('click')
      expect(mockDelete).toHaveBeenCalledWith(1, 1)
    })
  })

  describe('comment sending', () => {
    it('calls send with message when comment submitted', async () => {
      mockMe.value.settings = { enterNewLine: false }
      const wrapper = await createWrapper()
      const textarea = wrapper.find('.auto-height-textarea')

      await textarea.setValue('Test comment message')
      await textarea.trigger('focus')

      const comp = wrapper.findComponent(NewsThread)
      await comp.vm.sendComment()

      expect(mockSend).toHaveBeenCalledWith('Test comment message', 1, 1, null)
    })

    it('clears textarea after sending', async () => {
      const wrapper = await createWrapper()
      const textarea = wrapper.find('.auto-height-textarea')

      await textarea.setValue('Test comment')
      await textarea.trigger('focus')

      const comp = wrapper.findComponent(NewsThread)
      await comp.vm.sendComment()

      expect(comp.vm.threadcomment).toBe(null)
    })

    it('does not send empty comment', async () => {
      const wrapper = await createWrapper()
      const comp = wrapper.findComponent(NewsThread)
      await comp.vm.sendComment()
      expect(mockSend).not.toHaveBeenCalled()
    })

    it('does not send whitespace-only comment', async () => {
      const wrapper = await createWrapper()
      const textarea = wrapper.find('.auto-height-textarea')
      await textarea.setValue('   ')
      await textarea.trigger('focus')

      const comp = wrapper.findComponent(NewsThread)
      await comp.vm.sendComment()
      expect(mockSend).not.toHaveBeenCalled()
    })
  })

  describe('computed properties', () => {
    it('computes starter as "you" when user is thread author', async () => {
      mockNewsfeed.value.userid = 1
      mockMe.value.id = 1
      const wrapper = await createWrapper()
      const comp = wrapper.findComponent(NewsThread)
      expect(comp.vm.starter).toBe('you')
    })

    it('computes starter as displayname when available', async () => {
      mockNewsfeed.value.userid = 100
      mockNewsfeed.value.displayname = 'John Doe'
      mockMe.value.id = 1
      const wrapper = await createWrapper()
      const comp = wrapper.findComponent(NewsThread)
      expect(comp.vm.starter).toBe('John Doe')
    })

    it('computes starter as "someone" when no displayname', async () => {
      mockNewsfeed.value.userid = 100
      mockNewsfeed.value.displayname = null
      mockMe.value.id = 1
      const wrapper = await createWrapper()
      const comp = wrapper.findComponent(NewsThread)
      expect(comp.vm.starter).toBe('someone')
    })

    it('computes mod as true for Moderator systemrole', async () => {
      mockMe.value.systemrole = 'Moderator'
      const wrapper = await createWrapper()
      const comp = wrapper.findComponent(NewsThread)
      expect(comp.vm.mod).toBe(true)
    })

    it('computes mod as true for Admin systemrole', async () => {
      mockMe.value.systemrole = 'Admin'
      const wrapper = await createWrapper()
      const comp = wrapper.findComponent(NewsThread)
      expect(comp.vm.mod).toBe(true)
    })

    it('computes mod as true for Support systemrole', async () => {
      mockMe.value.systemrole = 'Support'
      const wrapper = await createWrapper()
      const comp = wrapper.findComponent(NewsThread)
      expect(comp.vm.mod).toBe(true)
    })

    it('computes mod as false for User systemrole', async () => {
      mockMe.value.systemrole = 'User'
      const wrapper = await createWrapper()
      const comp = wrapper.findComponent(NewsThread)
      expect(comp.vm.mod).toBeFalsy()
    })

    it('computes tagusers from store', async () => {
      const wrapper = await createWrapper()
      const comp = wrapper.findComponent(NewsThread)
      expect(comp.vm.tagusers).toEqual(['User One', 'User Two'])
    })

    it('computes isNewsComponent as true for valid type', async () => {
      mockNewsfeed.value.type = 'Message'
      const wrapper = await createWrapper()
      const comp = wrapper.findComponent(NewsThread)
      expect(comp.vm.isNewsComponent).toBe(true)
    })

    it('computes isNewsComponent as false for unknown type', async () => {
      mockNewsfeed.value.type = 'InvalidType'
      const wrapper = await createWrapper()
      const comp = wrapper.findComponent(NewsThread)
      expect(comp.vm.isNewsComponent).toBe(false)
    })

    it('computes canRefer based on mod and type', async () => {
      mockMe.value.systemrole = 'Moderator'
      mockNewsfeed.value.type = 'Message'
      const wrapper = await createWrapper()
      const comp = wrapper.findComponent(NewsThread)
      expect(comp.vm.canRefer).toBe(true)
    })

    it('computes canStory based on mod and type', async () => {
      mockMe.value.systemrole = 'Moderator'
      mockNewsfeed.value.type = 'Message'
      const wrapper = await createWrapper()
      const comp = wrapper.findComponent(NewsThread)
      expect(comp.vm.canStory).toBe(true)
    })
  })

  describe('filterMatch function', () => {
    it('matches at start of string (case insensitive)', async () => {
      const wrapper = await createWrapper()
      const comp = wrapper.findComponent(NewsThread)
      expect(comp.vm.filterMatch('John Smith', 'john')).toBe(true)
      expect(comp.vm.filterMatch('John Smith', 'JOHN')).toBe(true)
    })

    it('does not match in middle of string', async () => {
      const wrapper = await createWrapper()
      const comp = wrapper.findComponent(NewsThread)
      expect(comp.vm.filterMatch('John Smith', 'smith')).toBe(false)
    })
  })

  describe('team store fetch', () => {
    it('fetches ChitChat Moderation team for moderators', async () => {
      mockMe.value.systemrole = 'Moderator'
      await createWrapper()
      expect(mockTeamFetch).toHaveBeenCalledWith('ChitChat Moderation')
    })

    it('fetches ChitChat Moderation team for support', async () => {
      mockMe.value.systemrole = 'Support'
      await createWrapper()
      expect(mockTeamFetch).toHaveBeenCalledWith('ChitChat Moderation')
    })

    it('fetches ChitChat Moderation team for admin', async () => {
      mockMe.value.systemrole = 'Admin'
      await createWrapper()
      expect(mockTeamFetch).toHaveBeenCalledWith('ChitChat Moderation')
    })

    it('does not fetch ChitChat Moderation team for regular users', async () => {
      mockMe.value.systemrole = 'User'
      await createWrapper()
      expect(mockTeamFetch).not.toHaveBeenCalled()
    })
  })

  describe('edit modal', () => {
    beforeEach(() => {
      mockNewsfeed.value.userid = 1
      mockMe.value.id = 1
    })

    it('shows edit modal when Edit clicked', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.news-edit-modal').exists()).toBe(false)
      const editBtn = wrapper
        .findAll('.dropdown-item')
        .find((item) => item.text() === 'Edit')
      await editBtn.trigger('click')
      await flushPromises()
      expect(wrapper.find('.news-edit-modal').exists()).toBe(true)
    })
  })

  describe('photo upload', () => {
    it('shows uploader when photoAdd is called', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.our-uploader').exists()).toBe(false)

      const comp = wrapper.findComponent(NewsThread)
      comp.vm.photoAdd()
      await flushPromises()

      expect(wrapper.find('.our-uploader').exists()).toBe(true)
    })
  })

  describe('rendered event', () => {
    it('updates scrollDownTo when rendered id matches scrollTo prop', async () => {
      const wrapper = await createWrapper({ scrollTo: '5' })
      const comp = wrapper.findComponent(NewsThread)
      comp.vm.rendered(5)
      expect(comp.vm.scrollDownTo).toBe('5')
    })

    it('does not update scrollDownTo when ids do not match', async () => {
      const wrapper = await createWrapper({ scrollTo: '5' })
      const comp = wrapper.findComponent(NewsThread)
      comp.vm.rendered(10)
      expect(comp.vm.scrollDownTo).toBe(null)
    })
  })

  describe('edge cases', () => {
    it('handles null newsfeed gracefully', async () => {
      mockNewsfeedStore.byId.mockReturnValue(null)
      const wrapper = await createWrapper()
      expect(wrapper.find('.b-card').exists()).toBe(false)
    })

    it('handles me without profile.path', async () => {
      // The component checks me.profile.path, so setting profile to empty object
      mockMe.value.profile = { path: null }
      const wrapper = await createWrapper()
      expect(wrapper.find('.profile-image').exists()).toBe(false)
    })

    it('handles undefined settings', async () => {
      mockMe.value.settings = undefined
      const wrapper = await createWrapper()
      expect(wrapper.find('.auto-height-textarea').exists()).toBe(true)
    })
  })
})
