import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import NewsLoveComment from '~/components/NewsLoveComment.vue'

const { mockMyId } = vi.hoisted(() => {
  const { ref } = require('vue')
  return {
    mockMyId: ref(1),
  }
})

const mockNewsfeedStore = {
  love: vi.fn().mockResolvedValue(undefined),
  unlove: vi.fn().mockResolvedValue(undefined),
}

vi.mock('~/stores/newsfeed', () => ({
  useNewsfeedStore: () => mockNewsfeedStore,
}))

vi.mock('~/composables/useMe', () => ({
  useMe: () => ({
    myid: mockMyId,
  }),
}))

describe('NewsLoveComment', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockMyId.value = 1
  })

  function createWrapper(props = {}) {
    return mount(NewsLoveComment, {
      props: {
        newsfeed: {
          id: 123,
          threadhead: 100,
          userid: 2,
          loved: false,
          loves: 0,
          closed: false,
        },
        ...props,
      },
      global: {
        stubs: {
          SpinButton: {
            template:
              '<button class="spin-button" :class="variant" @click="$emit(\'handle\', () => {})"><slot /></button>',
            props: ['variant', 'size', 'iconName', 'doneIcon', 'iconClass'],
            emits: ['handle'],
          },
          'b-button': {
            template:
              '<button class="b-button" :class="variant" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant', 'size'],
            emits: ['click'],
          },
          'v-icon': {
            template: '<span class="v-icon" :data-icon="icon" />',
            props: ['icon'],
          },
          NewsLovesModal: {
            template: '<div class="loves-modal" />',
            props: ['id'],
            emits: ['hidden'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders when newsfeed exists', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.d-flex').exists()).toBe(true)
    })
  })

  describe('love button', () => {
    it('shows Love button when not loved and not own post', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Love this')
    })

    it('hides Love button when post is loved', () => {
      const wrapper = createWrapper({
        newsfeed: {
          id: 123,
          threadhead: 100,
          userid: 2,
          loved: true,
          loves: 1,
          closed: false,
        },
      })
      expect(wrapper.text()).not.toContain('Love this')
    })

    it('hides Love button for own post', () => {
      const wrapper = createWrapper({
        newsfeed: {
          id: 123,
          threadhead: 100,
          userid: 1,
          loved: false,
          loves: 0,
          closed: false,
        },
      })
      expect(wrapper.text()).not.toContain('Love this')
    })

    it('calls love store method on click', async () => {
      const wrapper = createWrapper()

      const loveButtons = wrapper.findAll('.spin-button')
      const loveButton = loveButtons.find((b) => b.text().includes('Love this'))
      await loveButton.trigger('click')
      await flushPromises()

      expect(mockNewsfeedStore.love).toHaveBeenCalledWith(123, 100)
    })
  })

  describe('unlove button', () => {
    it('shows Unlove button when post is loved', () => {
      const wrapper = createWrapper({
        newsfeed: {
          id: 123,
          threadhead: 100,
          userid: 2,
          loved: true,
          loves: 1,
          closed: false,
        },
      })
      expect(wrapper.text()).toContain('Unlove')
    })

    it('calls unlove store method on click', async () => {
      const wrapper = createWrapper({
        newsfeed: {
          id: 123,
          threadhead: 100,
          userid: 2,
          loved: true,
          loves: 1,
          closed: false,
        },
      })

      const unloveButton = wrapper
        .findAll('.spin-button')
        .find((b) => b.text().includes('Unlove'))
      await unloveButton.trigger('click')
      await flushPromises()

      expect(mockNewsfeedStore.unlove).toHaveBeenCalledWith(123, 100)
    })
  })

  describe('reply button', () => {
    it('shows Reply button when not closed', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Reply')
    })

    it('hides Reply button when closed', () => {
      const wrapper = createWrapper({
        newsfeed: {
          id: 123,
          threadhead: 100,
          userid: 2,
          loved: false,
          loves: 0,
          closed: true,
        },
      })
      expect(wrapper.text()).not.toContain('Reply')
    })

    it('emits focus-comment on click', async () => {
      const wrapper = createWrapper()

      const replyButton = wrapper
        .findAll('.b-button')
        .find((b) => b.text().includes('Reply'))
      await replyButton.trigger('click')

      expect(wrapper.emitted('focus-comment')).toHaveLength(1)
    })
  })

  describe('loves count button', () => {
    it('shows loves count when loves > 0', () => {
      const wrapper = createWrapper({
        newsfeed: {
          id: 123,
          threadhead: 100,
          userid: 2,
          loved: false,
          loves: 5,
          closed: false,
        },
      })
      expect(wrapper.text()).toContain('5')
    })

    it('hides loves count when loves is 0', () => {
      const wrapper = createWrapper({
        newsfeed: {
          id: 123,
          threadhead: 100,
          userid: 2,
          loved: false,
          loves: 0,
          closed: false,
        },
      })
      const loveCountButton = wrapper.find('.showlove')
      expect(loveCountButton.exists()).toBe(false)
    })

    it('shows heart icon in loves count', () => {
      const wrapper = createWrapper({
        newsfeed: {
          id: 123,
          threadhead: 100,
          userid: 2,
          loved: false,
          loves: 3,
          closed: false,
        },
      })
      const showlove = wrapper.find('.showlove')
      expect(showlove.find('.v-icon[data-icon="heart"]').exists()).toBe(true)
    })
  })

  describe('loves modal', () => {
    it('does not show modal initially', () => {
      const wrapper = createWrapper({
        newsfeed: {
          id: 123,
          threadhead: 100,
          userid: 2,
          loved: false,
          loves: 3,
          closed: false,
        },
      })
      expect(wrapper.find('.loves-modal').exists()).toBe(false)
    })

    it('shows modal when love count is clicked', async () => {
      const wrapper = createWrapper({
        newsfeed: {
          id: 123,
          threadhead: 100,
          userid: 2,
          loved: false,
          loves: 3,
          closed: false,
        },
      })

      await wrapper.find('.showlove').trigger('click')
      expect(wrapper.find('.loves-modal').exists()).toBe(true)
    })
  })

  describe('accessibility', () => {
    it('sets aria-label on loves button', () => {
      const wrapper = createWrapper({
        newsfeed: {
          id: 123,
          threadhead: 100,
          userid: 2,
          loved: false,
          loves: 5,
          closed: false,
        },
      })
      const showlove = wrapper.find('.showlove')
      expect(showlove.attributes('aria-label')).toContain('5 loves')
    })
  })
})
