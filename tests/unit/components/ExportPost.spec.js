import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ExportPost from '~/components/ExportPost.vue'

// Mock the dateonly function from useTimeFormat
vi.mock('~/composables/useTimeFormat', () => ({
  dateonly: vi.fn((date) => `Formatted: ${date}`),
}))

// Mock VueJsonPretty
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
      props: {
        post: defaultPost,
        ...props,
      },
      global: {
        stubs: {
          'b-row': {
            template: '<div class="row"><slot /></div>',
          },
          'b-col': {
            template: '<div class="col"><slot /></div>',
            props: ['cols'],
          },
          'b-button': {
            template: '<button @click="$emit(\'click\')"><slot /></button>',
            props: ['variant'],
          },
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
    it('renders the post container', () => {
      const wrapper = mountExportPost()
      expect(wrapper.find('div').exists()).toBe(true)
    })

    it('renders the post ID with hash prefix', () => {
      const wrapper = mountExportPost()
      expect(wrapper.text()).toContain('#12345')
    })

    it('renders the formatted arrival date', () => {
      const wrapper = mountExportPost()
      expect(wrapper.text()).toContain('Formatted: 2024-01-15T10:30:00Z')
    })

    it('renders the group name', () => {
      const wrapper = mountExportPost()
      expect(wrapper.text()).toContain('Test Freegle Group')
    })

    it('renders the post subject', () => {
      const wrapper = mountExportPost()
      expect(wrapper.text()).toContain('OFFER: Free Sofa')
    })

    it('renders details button', () => {
      const wrapper = mountExportPost()
      expect(wrapper.find('button').exists()).toBe(true)
      expect(wrapper.find('button').text()).toBe('Details')
    })

    it('button has link variant', () => {
      const wrapper = mountExportPost()
      expect(wrapper.find('button').classes()).toContain('btn-link')
    })
  })

  describe('JSON details visibility', () => {
    it('does not show JSON by default', () => {
      const wrapper = mountExportPost()
      expect(wrapper.find('.vue-json-pretty').exists()).toBe(false)
    })

    it('shows JSON when details button is clicked', async () => {
      const wrapper = mountExportPost()
      await wrapper.find('button').trigger('click')

      expect(wrapper.find('.vue-json-pretty').exists()).toBe(true)
    })

    it('toggles showJSON state', async () => {
      const wrapper = mountExportPost()
      expect(wrapper.vm.showJSON).toBe(false)

      await wrapper.find('button').trigger('click')
      expect(wrapper.vm.showJSON).toBe(true)
    })

    it('passes post data to VueJsonPretty', async () => {
      const wrapper = mountExportPost()
      await wrapper.find('button').trigger('click')

      const jsonPretty = wrapper.find('.vue-json-pretty')
      expect(jsonPretty.text()).toContain('12345')
      expect(jsonPretty.text()).toContain('OFFER: Free Sofa')
    })
  })

  describe('group display', () => {
    it('displays first group name when groups exist', () => {
      const wrapper = mountExportPost()
      expect(wrapper.text()).toContain('Test Freegle Group')
    })

    it('handles post with no groups array', () => {
      const postNoGroups = {
        id: 99999,
        arrival: '2024-01-20T12:00:00Z',
        subject: 'WANTED: Chair',
        groups: null,
      }
      const wrapper = mountExportPost({ post: postNoGroups })

      // Should render without crashing
      expect(wrapper.text()).toContain('#99999')
      expect(wrapper.text()).toContain('WANTED: Chair')
    })

    it('handles post with empty groups array', () => {
      const postEmptyGroups = {
        id: 88888,
        arrival: '2024-01-21T14:00:00Z',
        subject: 'OFFER: Books',
        groups: [],
      }
      const wrapper = mountExportPost({ post: postEmptyGroups })

      // Should render without crashing
      expect(wrapper.text()).toContain('#88888')
      expect(wrapper.text()).toContain('OFFER: Books')
    })

    it('handles post with groups but first group has no namedisplay', () => {
      const postNoNamedisplay = {
        id: 77777,
        arrival: '2024-01-22T16:00:00Z',
        subject: 'OFFER: Table',
        groups: [{}],
      }
      const wrapper = mountExportPost({ post: postNoNamedisplay })

      // Should render without crashing
      expect(wrapper.text()).toContain('#77777')
    })
  })

  describe('with different post data', () => {
    it('renders WANTED post correctly', () => {
      const wantedPost = {
        id: 54321,
        arrival: '2024-02-01T09:00:00Z',
        subject: 'WANTED: Garden Tools',
        groups: [{ namedisplay: 'Another Group' }],
      }
      const wrapper = mountExportPost({ post: wantedPost })

      expect(wrapper.text()).toContain('#54321')
      expect(wrapper.text()).toContain('WANTED: Garden Tools')
      expect(wrapper.text()).toContain('Another Group')
    })

    it('renders post with multiple groups', () => {
      const multiGroupPost = {
        id: 11111,
        arrival: '2024-02-05T11:00:00Z',
        subject: 'OFFER: Toys',
        groups: [
          { namedisplay: 'First Group' },
          { namedisplay: 'Second Group' },
        ],
      }
      const wrapper = mountExportPost({ post: multiGroupPost })

      // Should only show the first group
      expect(wrapper.text()).toContain('First Group')
    })

    it('handles long subject lines', () => {
      const longSubjectPost = {
        id: 22222,
        arrival: '2024-02-10T15:00:00Z',
        subject: 'OFFER: ' + 'A'.repeat(200),
        groups: [{ namedisplay: 'Long Subject Group' }],
      }
      const wrapper = mountExportPost({ post: longSubjectPost })

      expect(wrapper.text()).toContain('OFFER: ' + 'A'.repeat(200))
    })
  })

  describe('props', () => {
    it('accepts required post prop', () => {
      const wrapper = mountExportPost()
      expect(wrapper.props('post')).toEqual(defaultPost)
    })

    it('validates post is required object', () => {
      const wrapper = mountExportPost()
      expect(wrapper.props('post').id).toBe(12345)
    })
  })

  describe('layout structure', () => {
    it('uses column structure for layout', () => {
      const wrapper = mountExportPost()

      const cols = wrapper.findAll('.col')
      expect(cols.length).toBeGreaterThanOrEqual(5)
    })

    it('has appropriate column widths', () => {
      const wrapper = mountExportPost()

      // Post ID column
      expect(wrapper.find('.col-2').exists()).toBe(true)

      // Subject column should be col-4
      const col4Elements = wrapper.findAll('.col-4')
      expect(col4Elements.length).toBe(1)
    })
  })

  describe('edge cases', () => {
    it('handles zero ID', () => {
      const zeroIdPost = {
        id: 0,
        arrival: '2024-03-01T08:00:00Z',
        subject: 'OFFER: Test',
        groups: [{ namedisplay: 'Test Group' }],
      }
      const wrapper = mountExportPost({ post: zeroIdPost })

      expect(wrapper.text()).toContain('#0')
    })

    it('handles special characters in subject', () => {
      const specialCharPost = {
        id: 33333,
        arrival: '2024-03-05T10:00:00Z',
        subject: 'OFFER: <Test> & "Items"',
        groups: [{ namedisplay: 'Test Group' }],
      }
      const wrapper = mountExportPost({ post: specialCharPost })

      // Vue escapes HTML by default
      expect(wrapper.text()).toContain('<Test>')
    })

    it('handles null subject', () => {
      const nullSubjectPost = {
        id: 44444,
        arrival: '2024-03-10T12:00:00Z',
        subject: null,
        groups: [{ namedisplay: 'Test Group' }],
      }
      const wrapper = mountExportPost({ post: nullSubjectPost })

      // Should render without crashing
      expect(wrapper.text()).toContain('#44444')
    })

    it('handles undefined arrival date', () => {
      const noArrivalPost = {
        id: 55555,
        arrival: undefined,
        subject: 'OFFER: Something',
        groups: [{ namedisplay: 'Test Group' }],
      }
      const wrapper = mountExportPost({ post: noArrivalPost })

      // Should render without crashing
      expect(wrapper.text()).toContain('#55555')
    })
  })
})
