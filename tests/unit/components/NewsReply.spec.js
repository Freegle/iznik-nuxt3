import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref } from 'vue'
import NewsReply from '~/components/NewsReply.vue'

// Mock stores
const mockNewsfeedById = vi.fn()
const mockNewsfeedSend = vi.fn()
const mockNewsfeedLove = vi.fn()
const mockNewsfeedUnlove = vi.fn()
const mockNewsfeedHide = vi.fn()
const mockNewsfeedUnhide = vi.fn()
const mockNewsfeedDelete = vi.fn()

vi.mock('~/stores/newsfeed', () => ({
  useNewsfeedStore: () => ({
    byId: mockNewsfeedById,
    send: mockNewsfeedSend,
    love: mockNewsfeedLove,
    unlove: mockNewsfeedUnlove,
    hide: mockNewsfeedHide,
    unhide: mockNewsfeedUnhide,
    delete: mockNewsfeedDelete,
    tagusers: [{ displayname: 'Alice' }, { displayname: 'Bob' }],
  }),
}))

vi.mock('~/stores/misc', () => ({
  useMiscStore: () => ({
    breakpoint: 'md',
    apiCount: 0,
  }),
}))

const mockAuthUser = ref({
  id: 1,
  displayname: 'Current User',
  profile: { path: '/images/me.jpg' },
  systemrole: 'User',
  settings: { enterNewLine: false },
})

vi.mock('~/stores/auth', () => ({
  useAuthStore: () => ({
    user: mockAuthUser.value,
  }),
}))

// Mock composables
vi.mock('~/composables/useTwem', () => ({
  twem: (text) => text,
  untwem: (text) => text,
}))

vi.mock('~/composables/useTimeFormat', () => ({
  timeago: (date) => '2 hours ago',
  timeagoShort: (date) => '2h',
}))

vi.mock('pluralize', () => ({
  default: (word, count, includeCount) =>
    includeCount ? `${count} ${word}${count !== 1 ? 's' : ''}` : word,
}))

// Mock child components
vi.mock('~/components/ProfileImage', () => ({
  default: {
    name: 'ProfileImage',
    template: '<div class="profile-image"></div>',
    props: ['image', 'isModerator', 'size', 'lazy'],
  },
}))

vi.mock('~/components/ChatButton', () => ({
  default: {
    name: 'ChatButton',
    template: '<button class="chat-button">Message</button>',
    props: [
      'userid',
      'title',
      'variant',
      'size',
      'showIcon',
      'btnClass',
      'titleClass',
    ],
  },
}))

vi.mock('~/components/NewsUserInfo', () => ({
  default: {
    name: 'NewsUserInfo',
    template: '<span class="news-user-info"></span>',
    props: ['id'],
  },
}))

vi.mock('~/components/NewsHighlight', () => ({
  default: {
    name: 'NewsHighlight',
    template: '<span class="news-highlight">{{ text }}</span>',
    props: ['searchWords', 'text', 'maxChars'],
  },
}))

vi.mock('~/components/NewsPreviews', () => ({
  default: {
    name: 'NewsPreviews',
    template: '<div class="news-previews"></div>',
    props: ['previews', 'size'],
  },
}))

vi.mock('~/components/AutoHeightTextarea', () => ({
  default: {
    name: 'AutoHeightTextarea',
    template:
      '<textarea :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" @focus="$emit(\'focus\')"></textarea>',
    props: ['modelValue', 'rows', 'maxRows', 'placeholder'],
    emits: ['update:modelValue', 'focus'],
  },
}))

// Mock defineAsyncComponent components
vi.mock('vue', async (importOriginal) => {
  const mod = await importOriginal()
  return {
    ...mod,
    defineAsyncComponent: (loader) => ({
      name: 'AsyncComponent',
      template: '<div class="async-component"></div>',
      props: ['id'],
      emits: ['hidden'],
    }),
  }
})

describe('NewsReply', () => {
  const mockReply = {
    id: 100,
    userid: 42,
    displayname: 'Test User',
    message: 'This is a test reply',
    added: '2024-01-15T10:00:00Z',
    loved: false,
    loves: 0,
    hidden: false,
    deleted: false,
    profile: { paththumb: '/images/user.jpg' },
    image: null,
    previews: [],
    replyto: 1,
    replies: [],
    showmod: false,
    isCombined: false,
  }

  function createWrapper(props = {}, replyData = mockReply) {
    mockNewsfeedById.mockReturnValue(replyData)

    return mount(NewsReply, {
      props: {
        id: 100,
        threadhead: 1,
        depth: 0,
        ...props,
      },
      global: {
        directives: {
          'observe-visibility': () => {},
        },
        stubs: {
          'b-dropdown': {
            template:
              '<div class="b-dropdown"><slot name="button-content" /><slot /></div>',
            props: ['variant', 'noCaret', 'right'],
          },
          'b-dropdown-item': {
            template:
              '<a class="dropdown-item" @click="$emit(\'click\')"><slot /></a>',
            emits: ['click'],
          },
          'b-input-group': {
            template:
              '<div class="input-group"><slot name="prepend" /><slot /></div>',
          },
          NuxtPicture: {
            template:
              '<picture class="nuxt-picture"><img :src="src" /></picture>',
            props: [
              'format',
              'fit',
              'provider',
              'src',
              'modifiers',
              'alt',
              'width',
            ],
          },
          'v-icon': {
            template: '<i :class="icon" class="v-icon"></i>',
            props: ['icon'],
          },
          OurUploadedImage: {
            template: '<img class="our-uploaded-image" :src="src" />',
            props: ['src', 'modifiers', 'alt', 'width'],
          },
          NewsReplies: {
            template: '<div class="news-replies"></div>',
            props: ['id', 'threadhead', 'scrollTo', 'replyTo', 'depth'],
          },
          OurUploader: {
            template: '<div class="our-uploader"></div>',
            props: ['modelValue', 'type'],
          },
          OurAtTa: {
            template:
              '<div class="our-at-ta"><slot name="prepend" /><slot /></div>',
            props: ['members', 'filterMatch'],
          },
          NewsPhotoModal: true,
          ProfileModal: true,
          NewsLovesModal: true,
          NewsEditModal: true,
          ConfirmModal: true,
          UserName: {
            template: '<span class="user-name"></span>',
            props: ['id', 'intro'],
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockAuthUser.value = {
      id: 1,
      displayname: 'Current User',
      profile: { path: '/images/me.jpg' },
      systemrole: 'User',
      settings: { enterNewLine: false },
    }
  })

  describe('rendering', () => {
    it('renders reply content', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.reply').exists()).toBe(true)
    })

    it('displays user name', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Test User')
    })

    it('displays reply message', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.news-highlight').text()).toContain(
        'This is a test reply'
      )
    })

    it('displays time ago', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('2 hours ago')
    })

    it('shows profile image', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.profile-image').exists()).toBe(true)
    })
  })

  describe('hidden replies', () => {
    it('shows hidden reply for moderators', () => {
      mockAuthUser.value.systemrole = 'Moderator'
      const hiddenReply = { ...mockReply, hidden: true }
      const wrapper = createWrapper({}, hiddenReply)
      expect(wrapper.find('.reply').exists()).toBe(true)
    })

    it('shows hidden reply for reply author', () => {
      mockAuthUser.value.id = 42 // Same as reply userid
      const hiddenReply = { ...mockReply, hidden: true }
      const wrapper = createWrapper({}, hiddenReply)
      expect(wrapper.find('.reply').exists()).toBe(true)
    })

    it('hides reply for other users when hidden', () => {
      const hiddenReply = { ...mockReply, hidden: true }
      const wrapper = createWrapper({}, hiddenReply)
      expect(wrapper.find('.reply').exists()).toBe(false)
    })

    it('shows hidden notice for moderators', () => {
      mockAuthUser.value.systemrole = 'Moderator'
      const hiddenReply = { ...mockReply, hidden: true }
      const wrapper = createWrapper({}, hiddenReply)
      expect(wrapper.text()).toContain('has been hidden')
    })
  })

  describe('action buttons', () => {
    it('shows reply button', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.reply-action').text()).toContain('Reply')
    })

    it('shows love button when not loved and not own reply', () => {
      const wrapper = createWrapper()
      const loveBtn = wrapper
        .findAll('.reply-action')
        .find((b) => b.text().includes('Love') && !b.text().includes('Loved'))
      expect(loveBtn).toBeDefined()
    })

    it('shows loved button when already loved', () => {
      const lovedReply = { ...mockReply, loved: true }
      const wrapper = createWrapper({}, lovedReply)
      expect(wrapper.text()).toContain('Loved')
    })

    it('shows love count when there are loves', () => {
      const lovedReply = { ...mockReply, loves: 5 }
      const wrapper = createWrapper({}, lovedReply)
      expect(wrapper.text()).toContain('5')
    })

    it('hides love button for own replies', () => {
      mockAuthUser.value.id = 42 // Same as reply userid
      const wrapper = createWrapper()
      const loveBtn = wrapper
        .findAll('.reply-action')
        .find((b) => b.text() === 'Love' || b.text().includes('Love'))
      // Love button should not show "Love" for own replies (only "Loved" if loved)
      expect(loveBtn?.text()).not.toBe('Love')
    })

    it('shows chat button for other users', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.chat-button').exists()).toBe(true)
    })

    it('hides chat button for own replies', () => {
      mockAuthUser.value.id = 42
      const wrapper = createWrapper()
      expect(wrapper.find('.chat-button').exists()).toBe(false)
    })
  })

  describe('dropdown menu', () => {
    it('shows dropdown for own reply', () => {
      mockAuthUser.value.id = 42
      const wrapper = createWrapper()
      expect(wrapper.find('.b-dropdown').exists()).toBe(true)
    })

    it('shows dropdown for moderators', () => {
      mockAuthUser.value.systemrole = 'Moderator'
      const wrapper = createWrapper()
      expect(wrapper.find('.b-dropdown').exists()).toBe(true)
    })

    it('shows dropdown for admins', () => {
      mockAuthUser.value.systemrole = 'Admin'
      const wrapper = createWrapper()
      expect(wrapper.find('.b-dropdown').exists()).toBe(true)
    })

    it('hides dropdown for regular users viewing other replies', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.b-dropdown').exists()).toBe(false)
    })
  })

  describe('love/unlove', () => {
    it('calls store love when love button clicked', async () => {
      const wrapper = createWrapper()
      const loveBtn = wrapper
        .findAll('.reply-action')
        .find((b) => b.text().includes('Love') && !b.text().includes('Loved'))
      await loveBtn.trigger('click')
      expect(mockNewsfeedLove).toHaveBeenCalledWith(100, 1)
    })

    it('calls store unlove when unlove button clicked', async () => {
      const lovedReply = { ...mockReply, loved: true }
      const wrapper = createWrapper({}, lovedReply)
      const lovedBtn = wrapper
        .findAll('.reply-action')
        .find((b) => b.text().includes('Loved'))
      await lovedBtn.trigger('click')
      expect(mockNewsfeedUnlove).toHaveBeenCalledWith(100, 1)
    })
  })

  describe('reply box', () => {
    it('shows reply box when reply clicked', async () => {
      const wrapper = createWrapper()
      const replyBtn = wrapper
        .findAll('.reply-action')
        .find((b) => b.text().includes('Reply'))
      await replyBtn.trigger('click')
      await flushPromises()
      expect(wrapper.find('textarea').exists()).toBe(true)
    })

    it('pre-fills with @username when replying', async () => {
      const wrapper = createWrapper()
      const replyBtn = wrapper
        .findAll('.reply-action')
        .find((b) => b.text().includes('Reply'))
      await replyBtn.trigger('click')
      await flushPromises()
      expect(wrapper.find('textarea').element.value).toContain('@Test User')
    })

    it('shows photo button in reply toolbar', async () => {
      const wrapper = createWrapper()
      const replyBtn = wrapper
        .findAll('.reply-action')
        .find((b) => b.text().includes('Reply'))
      await replyBtn.trigger('click')
      await flushPromises()
      expect(wrapper.find('.toolbar-btn').exists()).toBe(true)
    })
  })

  describe('reply image', () => {
    it('shows image when reply has ouruid image', () => {
      const replyWithImage = {
        ...mockReply,
        image: { id: 1, ouruid: 'abc123', path: '/images/photo.jpg' },
      }
      const wrapper = createWrapper({}, replyWithImage)
      expect(wrapper.find('.our-uploaded-image').exists()).toBe(true)
    })

    it('shows nuxt picture for external image', () => {
      const replyWithImage = {
        ...mockReply,
        image: { id: 1, externaluid: 'ext123', path: '/images/photo.jpg' },
      }
      const wrapper = createWrapper({}, replyWithImage)
      expect(wrapper.find('.nuxt-picture').exists()).toBe(true)
    })
  })

  describe('nested replies', () => {
    it('renders nested replies when present', () => {
      const replyWithReplies = {
        ...mockReply,
        replies: [{ id: 101 }],
      }
      const wrapper = createWrapper({}, replyWithReplies)
      expect(wrapper.find('.news-replies').exists()).toBe(true)
    })

    it('does not render nested replies component when none', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.news-replies').exists()).toBe(false)
    })
  })

  describe('previews', () => {
    it('shows previews when present', () => {
      const replyWithPreviews = {
        ...mockReply,
        previews: [{ url: 'https://example.com' }],
      }
      const wrapper = createWrapper({}, replyWithPreviews)
      expect(wrapper.find('.news-previews').exists()).toBe(true)
    })
  })

  describe('combined posts', () => {
    it('shows expand button for combined replies', () => {
      const combinedReply = {
        ...mockReply,
        isCombined: true,
        combinedIds: [101, 102],
      }
      mockAuthUser.value.id = 42 // Author to show menu
      const wrapper = createWrapper({}, combinedReply)
      expect(wrapper.find('.expand-combined-btn').exists()).toBe(true)
    })

    it('emits expand-combined when clicked', async () => {
      const combinedReply = {
        ...mockReply,
        isCombined: true,
        combinedIds: [101, 102],
      }
      mockAuthUser.value.id = 42
      // Must pass replyData prop for expandCombinedPosts to access combinedIds
      const wrapper = createWrapper({ replyData: combinedReply }, combinedReply)
      const expandBtn = wrapper.find('.expand-combined-btn')
      await expandBtn.trigger('click')
      expect(wrapper.emitted('expand-combined')).toBeTruthy()
      expect(wrapper.emitted('expand-combined')[0]).toEqual([[101, 102]])
    })
  })

  describe('scroll to', () => {
    it('highlights when scrollTo matches id', () => {
      const wrapper = createWrapper({ scrollTo: '100' })
      expect(wrapper.find('.bg-info').exists()).toBe(true)
    })

    it('does not highlight when scrollTo does not match', () => {
      const wrapper = createWrapper({ scrollTo: '200' })
      expect(wrapper.find('.bg-info').exists()).toBe(false)
    })
  })

  describe('props', () => {
    it('uses replyData when provided', () => {
      const customReply = { ...mockReply, message: 'Custom reply data' }
      const wrapper = createWrapper({ replyData: customReply })
      expect(wrapper.text()).toContain('Custom reply data')
    })

    it('falls back to store lookup when no replyData', () => {
      const storeReply = { ...mockReply, message: 'From store' }
      // Pass the store reply data as second argument to set the mock correctly
      const wrapper = createWrapper({}, storeReply)
      expect(wrapper.text()).toContain('From store')
    })
  })

  describe('emits', () => {
    it('emits rendered on mount', () => {
      const wrapper = createWrapper()
      expect(wrapper.emitted('rendered')).toBeTruthy()
      expect(wrapper.emitted('rendered')[0]).toEqual([100])
    })
  })
})
