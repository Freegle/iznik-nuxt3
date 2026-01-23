import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { bootstrapStubs } from '../mocks/bootstrap-stubs'
import ExportPost from '~/components/ExportPost.vue'

vi.mock('~/composables/useTimeFormat', () => ({
  dateonly: vi.fn((date) => `Formatted: ${date}`),
}))

vi.mock('vue-json-pretty', () => ({
  default: {
    name: 'VueJsonPretty',
    props: ['data'],
    template: '<pre class="vue-json-pretty">{{ JSON.stringify(data) }}</pre>',
  },
}))

describe('ExportPost', () => {
  const defaultPost = {
    id: 12345,
    arrival: '2024-01-15T10:30:00Z',
    subject: 'OFFER: Free Sofa',
    groups: [{ namedisplay: 'Test Freegle Group' }],
  }

  function mountExportPost(props = {}) {
    return mount(ExportPost, {
      props: { post: defaultPost, ...props },
      global: {
        stubs: {
          ...bootstrapStubs,
          VueJsonPretty: {
            props: ['data'],
            template:
              '<pre class="vue-json-pretty">{{ JSON.stringify(data) }}</pre>',
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders post data: ID, date, group, subject, and details button', () => {
      const wrapper = mountExportPost()
      expect(wrapper.text()).toContain('#12345')
      expect(wrapper.text()).toContain('Formatted: 2024-01-15T10:30:00Z')
      expect(wrapper.text()).toContain('Test Freegle Group')
      expect(wrapper.text()).toContain('OFFER: Free Sofa')
      expect(wrapper.find('button').text()).toBe('Details')
    })
  })

  describe('JSON details visibility', () => {
    it('hidden by default, shows with post data when clicked', async () => {
      const wrapper = mountExportPost()
      expect(wrapper.find('.vue-json-pretty').exists()).toBe(false)
      expect(wrapper.vm.showJSON).toBe(false)

      await wrapper.find('button').trigger('click')
      expect(wrapper.vm.showJSON).toBe(true)
      expect(wrapper.find('.vue-json-pretty').exists()).toBe(true)
      expect(wrapper.find('.vue-json-pretty').text()).toContain('12345')
    })
  })

  describe('edge cases', () => {
    it.each([
      [{ groups: null }, 'null groups'],
      [{ groups: [] }, 'empty groups'],
      [{ groups: [{}] }, 'group without namedisplay'],
      [{ id: 0 }, 'zero ID'],
      [{ subject: null }, 'null subject'],
      [{ arrival: undefined }, 'undefined arrival'],
      [{ subject: 'OFFER: <Test> & "Items"' }, 'special characters'],
    ])('handles %s gracefully', (overrides) => {
      const post = { ...defaultPost, ...overrides }
      const wrapper = mountExportPost({ post })
      expect(wrapper.find('div').exists()).toBe(true)
    })

    it('shows only first group when multiple groups exist', () => {
      const multiGroupPost = {
        ...defaultPost,
        groups: [
          { namedisplay: 'First Group' },
          { namedisplay: 'Second Group' },
        ],
      }
      const wrapper = mountExportPost({ post: multiGroupPost })
      expect(wrapper.text()).toContain('First Group')
    })
  })
})
