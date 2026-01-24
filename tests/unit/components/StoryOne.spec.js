import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, Suspense } from 'vue'
import StoryOne from '~/components/StoryOne.vue'

const { mockStory, mockUser, mockUserLocation, mockGroup } = vi.hoisted(() => {
  return {
    mockStory: {
      id: 1,
      headline: 'Great exchange!',
      story: 'I gave away a lovely sofa and the person was very happy.',
      date: '2024-01-15T10:00:00Z',
      userid: 100,
      likes: 5,
      liked: false,
      image: {
        path: '/images/story1.jpg',
      },
    },
    mockUser: {
      id: 100,
      displayname: 'John Smith',
    },
    mockUserLocation: {
      display: 'London',
      groupname: 'Freegle London',
    },
    mockGroup: {
      id: 200,
      namedisplay: 'Freegle Manchester',
      nameshort: 'Manchester',
    },
  }
})

const mockStoryStore = {
  fetch: vi.fn().mockResolvedValue(mockStory),
  love: vi.fn().mockResolvedValue(undefined),
  unlove: vi.fn().mockResolvedValue(undefined),
}

const mockUserStore = {
  fetch: vi.fn().mockResolvedValue(mockUser),
  fetchPublicLocation: vi.fn().mockResolvedValue(mockUserLocation),
}

const mockAuthStore = {
  user: { id: 1 },
}

const mockGroupStore = {
  fetch: vi.fn().mockResolvedValue(mockGroup),
}

vi.mock('~/stores/stories', () => ({
  useStoryStore: () => mockStoryStore,
}))

vi.mock('~/stores/user', () => ({
  useUserStore: () => mockUserStore,
}))

vi.mock('~/stores/auth', () => ({
  useAuthStore: () => mockAuthStore,
}))

vi.mock('~/stores/group', () => ({
  useGroupStore: () => mockGroupStore,
}))

vi.mock('~/composables/useTimeFormat', () => ({
  timeago: vi.fn().mockReturnValue('2 days ago'),
}))

describe('StoryOne', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockStoryStore.fetch.mockResolvedValue(mockStory)
    mockUserStore.fetch.mockResolvedValue(mockUser)
    mockUserStore.fetchPublicLocation.mockResolvedValue(mockUserLocation)
    mockGroupStore.fetch.mockResolvedValue(mockGroup)
    mockAuthStore.user = { id: 1 }
  })

  async function createWrapper(props = {}) {
    const TestWrapper = defineComponent({
      setup() {
        return () =>
          h(Suspense, null, {
            default: () => h(StoryOne, { id: 1, ...props }),
            fallback: () => h('div', 'Loading...'),
          })
      },
    })

    const wrapper = mount(TestWrapper, {
      global: {
        stubs: {
          'nuxt-link': {
            template: '<a :href="to"><slot /></a>',
            props: ['to', 'noPrefetch'],
          },
          'b-button': {
            template:
              '<button class="b-button" :class="variant" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant', 'size'],
            emits: ['click'],
          },
          'b-img': {
            template:
              '<img class="b-img" :src="src" @click="$emit(\'click\')" />',
            props: ['src', 'lazy', 'fluid', 'rounded', 'center'],
            emits: ['click'],
          },
          'b-modal': {
            template: '<div v-if="modelValue" class="b-modal"><slot /></div>',
            props: [
              'modelValue',
              'scrollable',
              'title',
              'size',
              'noStacking',
              'okOnly',
            ],
          },
          'v-icon': {
            template: '<span class="v-icon" :data-icon="icon" />',
            props: ['icon'],
          },
          ReadMore: {
            template: '<div class="read-more">{{ text }}</div>',
            props: ['text', 'maxChars'],
          },
          StoryShareModal: {
            template: '<div class="story-share-modal" />',
            props: ['id'],
            emits: ['hidden'],
          },
        },
      },
    })

    await flushPromises()
    return wrapper
  }

  describe('rendering', () => {
    it('renders story card', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.story-card').exists()).toBe(true)
    })

    it('shows story headline', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Great exchange!')
    })

    it('shows story text', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.read-more').exists()).toBe(true)
    })

    it('shows likes count', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('5')
    })

    it('shows story image when present', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.b-img').exists()).toBe(true)
    })

    it('shows time ago', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('2 days ago')
    })

    it('shows user display name', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('John Smith')
    })

    it('shows user location', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('London')
    })

    it('shows story ID link', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('#1')
    })
  })

  describe('group display', () => {
    it('shows group name when groupId provided', async () => {
      const wrapper = await createWrapper({ groupId: 200 })
      expect(wrapper.text()).toContain('Freegle Manchester')
    })

    it('fetches group when groupId provided', async () => {
      await createWrapper({ groupId: 200 })
      expect(mockGroupStore.fetch).toHaveBeenCalledWith(200)
    })

    it('does not fetch group when groupId not provided', async () => {
      await createWrapper()
      expect(mockGroupStore.fetch).not.toHaveBeenCalled()
    })
  })

  describe('love/unlove buttons', () => {
    it('shows Love button when logged in and not liked', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Love')
    })

    it('shows Unlove button when logged in and liked', async () => {
      mockStoryStore.fetch.mockResolvedValue({ ...mockStory, liked: true })
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Unlove')
    })

    it('hides love buttons when not logged in', async () => {
      mockAuthStore.user = null
      const wrapper = await createWrapper()
      const buttons = wrapper.findAll('.b-button')
      const loveButton = buttons.find(
        (b) => b.text().includes('Love') && !b.text().includes('Unlove')
      )
      expect(loveButton).toBeUndefined()
    })

    it('calls love on Love button click', async () => {
      const wrapper = await createWrapper()
      const loveBtn = wrapper
        .findAll('.b-button')
        .find((b) => b.text().includes('Love') && !b.text().includes('Unlove'))
      await loveBtn.trigger('click')
      expect(mockStoryStore.love).toHaveBeenCalledWith(1)
    })

    it('calls unlove on Unlove button click', async () => {
      mockStoryStore.fetch.mockResolvedValue({ ...mockStory, liked: true })
      const wrapper = await createWrapper()
      const unloveBtn = wrapper
        .findAll('.b-button')
        .find((b) => b.text().includes('Unlove'))
      await unloveBtn.trigger('click')
      expect(mockStoryStore.unlove).toHaveBeenCalledWith(1)
    })
  })

  describe('share button', () => {
    it('shows share button', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('[data-icon="share-alt"]').exists()).toBe(true)
    })

    it('opens share modal on click', async () => {
      const wrapper = await createWrapper()
      const shareBtn = wrapper
        .findAll('.b-button')
        .find((b) => b.find('[data-icon="share-alt"]').exists())
      await shareBtn.trigger('click')
      await flushPromises()
      expect(wrapper.find('.story-share-modal').exists()).toBe(true)
    })
  })

  describe('photo modal', () => {
    it('opens photo modal on image click', async () => {
      const wrapper = await createWrapper()
      await wrapper.find('.b-img').trigger('click')
      await flushPromises()
      expect(wrapper.find('.b-modal').exists()).toBe(true)
    })
  })

  describe('story without image', () => {
    it('does not show image when story has no image', async () => {
      mockStoryStore.fetch.mockResolvedValue({ ...mockStory, image: null })
      const wrapper = await createWrapper()
      expect(wrapper.find('.story-card__photo').exists()).toBe(false)
    })
  })

  describe('links', () => {
    it('headline links to story page', async () => {
      const wrapper = await createWrapper()
      const link = wrapper.find('.story-card__headline')
      expect(link.attributes('href')).toBe('/story/1')
    })

    it('ID links to story page', async () => {
      const wrapper = await createWrapper()
      const link = wrapper.find('.story-card__id')
      expect(link.attributes('href')).toBe('/story/1')
    })
  })

  describe('data fetching', () => {
    it('fetches story on mount', async () => {
      await createWrapper()
      expect(mockStoryStore.fetch).toHaveBeenCalledWith(1)
    })

    it('fetches user on mount', async () => {
      await createWrapper()
      expect(mockUserStore.fetch).toHaveBeenCalledWith(100)
    })

    it('fetches user location on mount', async () => {
      await createWrapper()
      expect(mockUserStore.fetchPublicLocation).toHaveBeenCalledWith(100)
    })
  })
})
