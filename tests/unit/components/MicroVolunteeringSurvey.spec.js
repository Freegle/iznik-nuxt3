import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MicroVolunteeringSurvey from '~/components/MicroVolunteeringSurvey.vue'

describe('MicroVolunteeringSurvey', () => {
  const testUrl = 'https://example.com/survey'

  function createWrapper(props = {}) {
    return mount(MicroVolunteeringSurvey, {
      props: { url: testUrl, ...props },
    })
  }

  describe('rendering', () => {
    it('mounts successfully', () => {
      const wrapper = createWrapper()
      expect(wrapper.exists()).toBe(true)
    })

    it('renders an iframe', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('iframe').exists()).toBe(true)
    })

    it('sets iframe src to the url prop', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('iframe').attributes('src')).toBe(testUrl)
    })

    it('has responsive width class', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('iframe').classes()).toContain('w-100')
    })

    it('has allowfullscreen attribute', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('iframe').attributes('allowfullscreen')).toBeDefined()
    })
  })

  describe('props', () => {
    it('requires url prop', () => {
      const props = MicroVolunteeringSurvey.props
      expect(props.url.required).toBe(true)
    })

    it('url prop is String type', () => {
      const props = MicroVolunteeringSurvey.props
      expect(props.url.type).toBe(String)
    })
  })
})
