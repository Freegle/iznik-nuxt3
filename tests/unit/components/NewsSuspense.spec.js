import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import NewsSuspense from '~/components/NewsSuspense.vue'

// Mock newsfeed store
const mockByIdFn = vi.fn()

vi.mock('~/stores/newsfeed', () => ({
  useNewsfeedStore: () => ({
    byId: mockByIdFn,
  }),
}))

describe('NewsSuspense', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function createWrapper(props = {}) {
    return mount(NewsSuspense, {
      props: { id: 123, ...props },
      global: {
        stubs: {
          NewsUserIntro: {
            template:
              '<div class="news-user-intro" :data-userid="userid" :data-newsfeed="JSON.stringify(newsfeed)"></div>',
            props: ['userid', 'newsfeed'],
          },
        },
      },
    })
  }

  describe('rendering with userid', () => {
    beforeEach(() => {
      mockByIdFn.mockReturnValue({
        id: 123,
        userid: 456,
        message: 'Test message',
      })
    })

    it('mounts successfully', () => {
      const wrapper = createWrapper()
      expect(wrapper.exists()).toBe(true)
    })

    it('renders NewsUserIntro when userid exists', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.news-user-intro').exists()).toBe(true)
    })

    it('passes userid to NewsUserIntro', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.news-user-intro').attributes('data-userid')).toBe(
        '456'
      )
    })

    it('passes newsfeed to NewsUserIntro', () => {
      const wrapper = createWrapper()
      const newsfeed = JSON.parse(
        wrapper.find('.news-user-intro').attributes('data-newsfeed')
      )
      expect(newsfeed.id).toBe(123)
      expect(newsfeed.userid).toBe(456)
    })
  })

  describe('rendering without userid', () => {
    beforeEach(() => {
      mockByIdFn.mockReturnValue({
        id: 123,
        message: 'Test message',
        // no userid
      })
    })

    it('does not render NewsUserIntro when no userid', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.news-user-intro').exists()).toBe(false)
    })
  })

  describe('store interaction', () => {
    beforeEach(() => {
      mockByIdFn.mockReturnValue({ id: 789, userid: 456 })
    })

    it('calls byId with newsfeed id', () => {
      createWrapper({ id: 789 })
      expect(mockByIdFn).toHaveBeenCalledWith(789)
    })
  })

  describe('props', () => {
    beforeEach(() => {
      mockByIdFn.mockReturnValue({ id: 123, userid: 456 })
    })

    it('requires id prop', () => {
      const props = NewsSuspense.props
      expect(props.id.required).toBe(true)
    })

    it('id prop is Number type', () => {
      const props = NewsSuspense.props
      expect(props.id.type).toBe(Number)
    })
  })

  describe('computed properties', () => {
    beforeEach(() => {
      mockByIdFn.mockReturnValue({
        id: 123,
        userid: 789,
        message: 'Hello world',
      })
    })

    it('newsfeed computed returns store data', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.newsfeed.id).toBe(123)
      expect(wrapper.vm.newsfeed.userid).toBe(789)
    })

    it('userid computed returns newsfeed userid', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.userid).toBe(789)
    })
  })
})
