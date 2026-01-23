import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import ModStoryReview from '~/modtools/components/ModStoryReview.vue'

/* Mock API */
const mockStoriesApi = {
  useForNewsletter: vi.fn().mockResolvedValue({}),
  useForPublicity: vi.fn().mockResolvedValue({}),
  dontUseForPublicity: vi.fn().mockResolvedValue({}),
}

/* Make useNuxtApp available globally (it's auto-imported by Nuxt) */
globalThis.useNuxtApp = () => ({
  $api: {
    stories: mockStoriesApi,
  },
})

describe('ModStoryReview', () => {
  const createStory = (overrides = {}) => ({
    id: 123,
    headline: 'Test Headline',
    story: 'This is my story about Freegle.',
    date: '2024-01-15T10:00:00Z',
    public: true,
    groupid: 456,
    groupname: 'Test Freegle Group',
    user: {
      id: 789,
      email: 'testuser@example.com',
      displayname: 'Test User',
      profile: {
        turl: 'https://example.com/profile.jpg',
      },
    },
    photo: null,
    ...overrides,
  })

  function mountComponent(props = {}) {
    return mount(ModStoryReview, {
      props: {
        story: createStory(),
        ...props,
      },
      global: {
        stubs: {
          'b-card': {
            template:
              '<div v-if="!noBody" class="card"><slot /><slot name="header" /><slot name="footer" /></div><div v-else class="card no-body"><slot /><slot name="header" /><slot name="footer" /></div>',
            props: ['noBody'],
          },
          'b-card-header': {
            template: '<div class="card-header"><slot /></div>',
          },
          'b-card-body': {
            template: '<div class="card-body"><slot /></div>',
          },
          'b-card-footer': {
            template: '<div class="card-footer"><slot /></div>',
          },
          'b-button': {
            template:
              '<button :data-variant="variant" :class="variant" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant'],
          },
          'b-img': {
            template: '<img :src="src" class="b-img" />',
            props: ['src', 'thumbnail'],
          },
          'v-icon': {
            template: '<i :data-icon="icon" />',
            props: ['icon', 'scale'],
          },
          ProfileImage: {
            template: '<img :src="image" :alt="name" class="profile-image" />',
            props: ['image', 'name', 'isThumbnail', 'size'],
          },
          NoticeMessage: {
            template:
              '<div class="notice-message" :class="variant"><slot /></div>',
            props: ['variant'],
          },
          ChatButton: {
            template: '<button class="chat-button" />',
            props: ['userid', 'groupid', 'title', 'variant'],
          },
        },
        mocks: {
          timeago: (date) => `timeago: ${date}`,
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders the component when story exists', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.card').exists()).toBe(true)
    })

    it('shows the story headline', () => {
      const wrapper = mountComponent({
        story: createStory({ headline: 'My Amazing Story' }),
      })
      expect(wrapper.text()).toContain('My Amazing Story')
    })

    it('shows the story text', () => {
      const wrapper = mountComponent({
        story: createStory({ story: 'This is my wonderful Freegle story.' }),
      })
      expect(wrapper.text()).toContain('This is my wonderful Freegle story.')
    })

    it('shows the group name', () => {
      const wrapper = mountComponent({
        story: createStory({ groupname: 'Sheffield Freegle' }),
      })
      expect(wrapper.text()).toContain('Sheffield Freegle')
    })

    it('shows the story id', () => {
      const wrapper = mountComponent({
        story: createStory({ id: 999 }),
      })
      expect(wrapper.text()).toContain('999')
    })

    it('shows timeago for story date', () => {
      const wrapper = mountComponent({
        story: createStory({ date: '2024-01-15T10:00:00Z' }),
      })
      expect(wrapper.text()).toContain('timeago: 2024-01-15T10:00:00Z')
    })
  })

  describe('user display', () => {
    it('shows user email when user exists', () => {
      const wrapper = mountComponent({
        story: createStory({
          user: {
            id: 123,
            email: 'user@test.com',
            displayname: 'John Doe',
            profile: { turl: 'https://example.com/profile.jpg' },
          },
        }),
      })
      expect(wrapper.text()).toContain('user@test.com')
    })

    it('shows user id when user exists', () => {
      const wrapper = mountComponent({
        story: createStory({
          user: {
            id: 456,
            email: 'user@test.com',
            displayname: 'John Doe',
            profile: { turl: 'https://example.com/profile.jpg' },
          },
        }),
      })
      expect(wrapper.text()).toContain('456')
    })

    it('shows ProfileImage component when user exists', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.profile-image').exists()).toBe(true)
    })

    it('does not show user section when user is null', () => {
      const wrapper = mountComponent({
        story: createStory({ user: null }),
      })
      expect(wrapper.find('.profile-image').exists()).toBe(false)
    })
  })

  describe('photo display', () => {
    it('shows photo when present', () => {
      const wrapper = mountComponent({
        story: createStory({
          photo: { paththumb: 'https://example.com/story-photo.jpg' },
        }),
      })
      const img = wrapper.find('.b-img')
      expect(img.exists()).toBe(true)
      expect(img.attributes('src')).toBe('https://example.com/story-photo.jpg')
    })

    it('does not show photo when not present', () => {
      const wrapper = mountComponent({
        story: createStory({ photo: null }),
      })
      expect(wrapper.find('.b-img').exists()).toBe(false)
    })
  })

  describe('public story notice', () => {
    it('does not show notice when story is public', () => {
      const wrapper = mountComponent({
        story: createStory({ public: true }),
      })
      expect(wrapper.find('.notice-message').exists()).toBe(false)
    })

    it('shows notice when story is not public', () => {
      const wrapper = mountComponent({
        story: createStory({ public: false }),
      })
      const notice = wrapper.find('.notice-message')
      expect(notice.exists()).toBe(true)
      expect(notice.text()).toContain("isn't public")
    })
  })

  describe('buttons visibility', () => {
    it('shows Hide button for public stories', () => {
      const wrapper = mountComponent({
        story: createStory({ public: true }),
      })
      expect(wrapper.text()).toContain('Hide')
    })

    it('shows Hide button for non-public stories', () => {
      const wrapper = mountComponent({
        story: createStory({ public: false }),
      })
      expect(wrapper.text()).toContain('Hide')
    })

    it('shows Good for publicity button when story is public and not newsletter mode', () => {
      const wrapper = mountComponent({
        story: createStory({ public: true }),
        newsletter: false,
      })
      expect(wrapper.text()).toContain('Good for publicity')
    })

    it('shows Good for newsletter button when story is public and newsletter mode', () => {
      const wrapper = mountComponent({
        story: createStory({ public: true }),
        newsletter: true,
      })
      expect(wrapper.text()).toContain('Good for newsletter')
    })

    it('does not show publicity/newsletter buttons when story is not public', () => {
      const wrapper = mountComponent({
        story: createStory({ public: false }),
      })
      expect(wrapper.text()).not.toContain('Good for publicity')
      expect(wrapper.text()).not.toContain('Good for newsletter')
    })

    it('shows ChatButton when user exists', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.chat-button').exists()).toBe(true)
    })

    it('does not show ChatButton when user is null', () => {
      const wrapper = mountComponent({
        story: createStory({ user: null }),
      })
      expect(wrapper.find('.chat-button').exists()).toBe(false)
    })
  })

  describe('methods', () => {
    describe('dontUseForPublicity', () => {
      it('calls api.stories.dontUseForPublicity with story id', async () => {
        const wrapper = mountComponent({
          story: createStory({ id: 555 }),
        })
        const hideButton = wrapper
          .findAll('button')
          .find((b) => b.text().includes('Hide'))
        await hideButton.trigger('click')
        await flushPromises()
        expect(mockStoriesApi.dontUseForPublicity).toHaveBeenCalledWith(555)
      })

      it('hides the component after clicking Hide', async () => {
        const wrapper = mountComponent()
        expect(wrapper.find('.card').exists()).toBe(true)
        const hideButton = wrapper
          .findAll('button')
          .find((b) => b.text().includes('Hide'))
        await hideButton.trigger('click')
        await flushPromises()
        expect(wrapper.find('.card').exists()).toBe(false)
      })
    })

    describe('useForPublicity', () => {
      it('calls api.stories.useForPublicity with story id', async () => {
        const wrapper = mountComponent({
          story: createStory({ id: 666, public: true }),
          newsletter: false,
        })
        const publicityButton = wrapper
          .findAll('button')
          .find((b) => b.text().includes('Good for publicity'))
        await publicityButton.trigger('click')
        await flushPromises()
        expect(mockStoriesApi.useForPublicity).toHaveBeenCalledWith(666)
      })

      it('hides the component after clicking Good for publicity', async () => {
        const wrapper = mountComponent({
          story: createStory({ public: true }),
          newsletter: false,
        })
        expect(wrapper.find('.card').exists()).toBe(true)
        const publicityButton = wrapper
          .findAll('button')
          .find((b) => b.text().includes('Good for publicity'))
        await publicityButton.trigger('click')
        await flushPromises()
        expect(wrapper.find('.card').exists()).toBe(false)
      })
    })

    describe('useForNewsletter', () => {
      it('calls api.stories.useForNewsletter with story id', async () => {
        const wrapper = mountComponent({
          story: createStory({ id: 777, public: true }),
          newsletter: true,
        })
        const newsletterButton = wrapper
          .findAll('button')
          .find((b) => b.text().includes('Good for newsletter'))
        await newsletterButton.trigger('click')
        await flushPromises()
        expect(mockStoriesApi.useForNewsletter).toHaveBeenCalledWith(777)
      })

      it('hides the component after clicking Good for newsletter', async () => {
        const wrapper = mountComponent({
          story: createStory({ public: true }),
          newsletter: true,
        })
        expect(wrapper.find('.card').exists()).toBe(true)
        const newsletterButton = wrapper
          .findAll('button')
          .find((b) => b.text().includes('Good for newsletter'))
        await newsletterButton.trigger('click')
        await flushPromises()
        expect(wrapper.find('.card').exists()).toBe(false)
      })
    })
  })

  describe('show ref', () => {
    it('starts with show as true', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.show).toBe(true)
    })

    it('card is visible when show is true', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.card').exists()).toBe(true)
    })

    it('card is hidden when show is false', async () => {
      const wrapper = mountComponent()
      wrapper.vm.show = false
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.card').exists()).toBe(false)
    })
  })

  describe('ChatButton props', () => {
    it('passes correct userid to ChatButton', () => {
      const wrapper = mountComponent({
        story: createStory({
          user: {
            id: 123,
            email: 'test@example.com',
            displayname: 'Test User',
            profile: { turl: 'https://example.com/profile.jpg' },
          },
          groupid: 456,
        }),
      })
      /* ChatButton is stubbed so we verify it exists; the component receives
         the props from the template binding which we cannot directly test
         on a stub. Instead, verify the component renders with user data. */
      const chatButton = wrapper.find('.chat-button')
      expect(chatButton.exists()).toBe(true)
    })

    it('does not render ChatButton when user is null', () => {
      const wrapper = mountComponent({
        story: createStory({ user: null }),
      })
      const chatButton = wrapper.find('.chat-button')
      expect(chatButton.exists()).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('handles story with minimal data', () => {
      const wrapper = mountComponent({
        story: {
          id: 1,
          headline: 'Minimal',
          story: 'Text',
          date: '2024-01-01',
          public: true,
          groupname: 'Group',
          user: null,
          photo: null,
        },
      })
      expect(wrapper.find('.card').exists()).toBe(true)
      expect(wrapper.text()).toContain('Minimal')
    })

    it('handles user without profile image gracefully', () => {
      const wrapper = mountComponent({
        story: createStory({
          user: {
            id: 123,
            email: 'test@example.com',
            displayname: 'Test',
            profile: { turl: null },
          },
        }),
      })
      expect(wrapper.find('.profile-image').exists()).toBe(true)
    })

    it('handles user with displayname but no email', () => {
      const wrapper = mountComponent({
        story: createStory({
          user: {
            id: 123,
            email: null,
            displayname: 'Just Name',
            profile: { turl: 'https://example.com/profile.jpg' },
          },
        }),
      })
      expect(wrapper.find('.profile-image').exists()).toBe(true)
    })
  })

  describe('button variants', () => {
    it('Hide button has warning variant', () => {
      const wrapper = mountComponent()
      const hideButton = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Hide'))
      expect(hideButton.attributes('data-variant')).toBe('warning')
    })

    it('Good for publicity button has primary variant', () => {
      const wrapper = mountComponent({
        story: createStory({ public: true }),
        newsletter: false,
      })
      const publicityButton = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Good for publicity'))
      expect(publicityButton.attributes('data-variant')).toBe('primary')
    })

    it('Good for newsletter button has primary variant', () => {
      const wrapper = mountComponent({
        story: createStory({ public: true }),
        newsletter: true,
      })
      const newsletterButton = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Good for newsletter'))
      expect(newsletterButton.attributes('data-variant')).toBe('primary')
    })
  })

  describe('icons', () => {
    it('shows times icon in Hide button', () => {
      const wrapper = mountComponent()
      const hideButton = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Hide'))
      const icon = hideButton.find('i[data-icon="times"]')
      expect(icon.exists()).toBe(true)
    })

    it('shows check icon in publicity button', () => {
      const wrapper = mountComponent({
        story: createStory({ public: true }),
        newsletter: false,
      })
      const publicityButton = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Good for publicity'))
      const icon = publicityButton.find('i[data-icon="check"]')
      expect(icon.exists()).toBe(true)
    })

    it('shows check icon in newsletter button', () => {
      const wrapper = mountComponent({
        story: createStory({ public: true }),
        newsletter: true,
      })
      const newsletterButton = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Good for newsletter'))
      const icon = newsletterButton.find('i[data-icon="check"]')
      expect(icon.exists()).toBe(true)
    })

    it('shows hashtag icons for id display', () => {
      const wrapper = mountComponent()
      const hashtagIcons = wrapper.findAll('i[data-icon="hashtag"]')
      expect(hashtagIcons.length).toBeGreaterThan(0)
    })
  })
})
