import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NewsPreviews from '~/components/NewsPreviews.vue'

describe('NewsPreviews', () => {
  const mockPreviews = [
    { id: 1, title: 'Preview 1' },
    { id: 2, title: 'Preview 2' },
    { id: 3, title: 'Preview 3' },
  ]

  function createWrapper(props = {}) {
    return mount(NewsPreviews, {
      props: { previews: mockPreviews, ...props },
      global: {
        stubs: {
          NewsPreview: {
            template:
              '<div class="news-preview" :data-id="preview.id" :data-size="size"></div>',
            props: ['preview', 'size'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders NewsPreview for each preview', () => {
      const wrapper = createWrapper()
      expect(wrapper.findAll('.news-preview')).toHaveLength(3)
    })

    it('passes preview data to each NewsPreview', () => {
      const wrapper = createWrapper()
      const previews = wrapper.findAll('.news-preview')
      expect(previews[0].attributes('data-id')).toBe('1')
      expect(previews[1].attributes('data-id')).toBe('2')
      expect(previews[2].attributes('data-id')).toBe('3')
    })

    it('uses default size md', () => {
      const wrapper = createWrapper()
      const preview = wrapper.find('.news-preview')
      expect(preview.attributes('data-size')).toBe('md')
    })

    it('passes custom size to NewsPreview', () => {
      const wrapper = createWrapper({ size: 'lg' })
      const preview = wrapper.find('.news-preview')
      expect(preview.attributes('data-size')).toBe('lg')
    })
  })

  describe('props', () => {
    it('previews prop is Array type', () => {
      const props = NewsPreviews.props
      expect(props.previews.type).toBe(Array)
    })

    it('size prop defaults to md', () => {
      const props = NewsPreviews.props
      expect(props.size.default).toBe('md')
    })
  })

  describe('empty state', () => {
    it('renders nothing when previews is empty', () => {
      const wrapper = createWrapper({ previews: [] })
      expect(wrapper.findAll('.news-preview')).toHaveLength(0)
    })
  })
})
