import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ModMessageWorry from '~/modtools/components/ModMessageWorry.vue'

describe('ModMessageWorry', () => {
  const createTestMessage = (overrides = {}) => ({
    id: 123,
    worry: [
      {
        worryword: {
          id: 1,
          keyword: 'dangerous',
          type: 'Review',
        },
      },
    ],
    ...overrides,
  })

  function mountComponent(props = {}) {
    return mount(ModMessageWorry, {
      props: {
        message: createTestMessage(),
        ...props,
      },
      global: {
        stubs: {
          NoticeMessage: {
            template:
              '<div class="notice-message" :class="variant"><slot /></div>',
            props: ['variant'],
          },
          'b-button': {
            template:
              '<button :class="variant" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant'],
          },
          ExternalLink: {
            template: '<a :href="href" target="_blank"><slot /></a>',
            props: ['href'],
          },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('displays NoticeMessage for each worry word', () => {
      const wrapper = mountComponent({
        message: createTestMessage({
          worry: [
            { worryword: { id: 1, keyword: 'word1', type: 'Review' } },
            { worryword: { id: 2, keyword: 'word2', type: 'Review' } },
          ],
        }),
      })
      expect(wrapper.findAll('.notice-message').length).toBe(2)
    })

    it('displays worry word keyword in danger text', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('dangerous')
      expect(wrapper.find('span.text-danger').exists()).toBe(true)
    })

    it('displays "Flagged for review" text', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Flagged for review')
    })

    it('displays "Click for more info" button initially', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Click for more info')
    })

    it('applies warning variant to NoticeMessage', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.notice-message.warning').exists()).toBe(true)
    })
  })

  describe('expand/collapse behavior', () => {
    it('starts collapsed (expand is false)', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.expand).toBe(false)
    })

    it('expands when "Click for more info" is clicked', async () => {
      const wrapper = mountComponent()
      const button = wrapper.find('button')
      await button.trigger('click')
      expect(wrapper.vm.expand).toBe(true)
    })

    it('collapses when "Hide more info" is clicked', async () => {
      const wrapper = mountComponent()
      wrapper.vm.expand = true
      await wrapper.vm.$nextTick()
      const button = wrapper.find('button')
      await button.trigger('click')
      expect(wrapper.vm.expand).toBe(false)
    })

    it('shows "Hide more info" when expanded', async () => {
      const wrapper = mountComponent()
      wrapper.vm.expand = true
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toContain('Hide more info')
    })
  })

  describe('worry word types', () => {
    describe('Review type', () => {
      it('displays Review explanation when expanded', async () => {
        const wrapper = mountComponent({
          message: createTestMessage({
            worry: [{ worryword: { id: 1, keyword: 'test', type: 'Review' } }],
          }),
        })
        wrapper.vm.expand = true
        await wrapper.vm.$nextTick()
        expect(wrapper.text()).toContain('flagged up for review')
        expect(wrapper.text()).toContain("If you can't see anything wrong")
      })
    })

    describe('Regulated type', () => {
      it('displays Regulated explanation when expanded', async () => {
        const wrapper = mountComponent({
          message: createTestMessage({
            worry: [
              { worryword: { id: 1, keyword: 'test', type: 'Regulated' } },
            ],
          }),
        })
        wrapper.vm.expand = true
        await wrapper.vm.$nextTick()
        expect(wrapper.text()).toContain('regulated substance')
        expect(wrapper.text()).toContain('not legal on Freegle')
      })
    })

    describe('Reportable type', () => {
      it('displays Reportable explanation when expanded', async () => {
        const wrapper = mountComponent({
          message: createTestMessage({
            worry: [
              { worryword: { id: 1, keyword: 'test', type: 'Reportable' } },
            ],
          }),
        })
        wrapper.vm.expand = true
        await wrapper.vm.$nextTick()
        expect(wrapper.text()).toContain('reportable substance')
        expect(wrapper.text()).toContain('reported to the police')
      })
    })

    describe('Medicine type', () => {
      it('displays Medicine explanation when expanded', async () => {
        const wrapper = mountComponent({
          message: createTestMessage({
            worry: [
              { worryword: { id: 1, keyword: 'aspirin', type: 'Medicine' } },
            ],
          }),
        })
        wrapper.vm.expand = true
        await wrapper.vm.$nextTick()
        expect(wrapper.text()).toContain('drug, medicine or supplement')
        expect(wrapper.text()).toContain('not legal on Freegle')
      })
    })
  })

  describe('external links', () => {
    it('displays link to Central/Discourse when expanded', async () => {
      const wrapper = mountComponent({
        message: createTestMessage({
          worry: [{ worryword: { id: 1, keyword: 'test', type: 'Regulated' } }],
        }),
      })
      wrapper.vm.expand = true
      await wrapper.vm.$nextTick()
      const links = wrapper.findAll('a')
      const centralLink = links.find((l) =>
        l.attributes('href')?.includes('discourse.ilovefreegle.org')
      )
      expect(centralLink).toBeDefined()
    })

    it('displays link to wiki for more information', async () => {
      const wrapper = mountComponent()
      wrapper.vm.expand = true
      await wrapper.vm.$nextTick()
      const links = wrapper.findAll('a')
      const wikiLink = links.find((l) =>
        l.attributes('href')?.includes('wiki.ilovefreegle.org/Worry_Words')
      )
      expect(wikiLink).toBeDefined()
    })
  })

  describe('multiple worry words', () => {
    it('renders separate NoticeMessage for each worry word', () => {
      const wrapper = mountComponent({
        message: createTestMessage({
          worry: [
            { worryword: { id: 1, keyword: 'word1', type: 'Review' } },
            { worryword: { id: 2, keyword: 'word2', type: 'Regulated' } },
            { worryword: { id: 3, keyword: 'word3', type: 'Medicine' } },
          ],
        }),
      })
      const notices = wrapper.findAll('.notice-message')
      expect(notices.length).toBe(3)
    })

    it('displays each keyword', () => {
      const wrapper = mountComponent({
        message: createTestMessage({
          worry: [
            { worryword: { id: 1, keyword: 'alpha', type: 'Review' } },
            { worryword: { id: 2, keyword: 'beta', type: 'Review' } },
          ],
        }),
      })
      expect(wrapper.text()).toContain('alpha')
      expect(wrapper.text()).toContain('beta')
    })
  })

  describe('props', () => {
    it('message prop is required', () => {
      const wrapper = mountComponent()
      expect(wrapper.props('message')).toBeDefined()
    })
  })

  describe('key generation', () => {
    it('generates unique keys for v-for based on message and worryword id', () => {
      const wrapper = mountComponent({
        message: createTestMessage({
          id: 456,
          worry: [
            { worryword: { id: 1, keyword: 'word1', type: 'Review' } },
            { worryword: { id: 2, keyword: 'word2', type: 'Review' } },
          ],
        }),
      })
      // Each NoticeMessage should be rendered uniquely
      const notices = wrapper.findAll('.notice-message')
      expect(notices.length).toBe(2)
    })
  })

  describe('edge cases', () => {
    it('handles empty worry array', () => {
      const wrapper = mountComponent({
        message: createTestMessage({ worry: [] }),
      })
      expect(wrapper.findAll('.notice-message').length).toBe(0)
    })

    it('handles undefined worry array', () => {
      const message = createTestMessage()
      delete message.worry
      const wrapper = mountComponent({ message })
      expect(wrapper.findAll('.notice-message').length).toBe(0)
    })

    it('handles worry word with empty keyword', () => {
      const wrapper = mountComponent({
        message: createTestMessage({
          worry: [{ worryword: { id: 1, keyword: '', type: 'Review' } }],
        }),
      })
      expect(wrapper.find('.notice-message').exists()).toBe(true)
    })

    it('handles unknown worry type', async () => {
      const wrapper = mountComponent({
        message: createTestMessage({
          worry: [
            { worryword: { id: 1, keyword: 'test', type: 'UnknownType' } },
          ],
        }),
      })
      wrapper.vm.expand = true
      await wrapper.vm.$nextTick()
      // Should not show any type-specific explanation
      expect(wrapper.text()).not.toContain('flagged up for review')
      expect(wrapper.text()).not.toContain('regulated substance')
    })
  })

  describe('styling', () => {
    it('has mb-1 class on NoticeMessage', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.notice-message.mb-1').exists()).toBe(true)
    })

    it('keyword has text-danger and font-weight-bold classes', () => {
      const wrapper = mountComponent()
      const keywordSpan = wrapper.find('span.text-danger.font-weight-bold')
      expect(keywordSpan.exists()).toBe(true)
    })

    it('button has link variant and alignment classes', () => {
      const wrapper = mountComponent()
      const button = wrapper.find('button')
      expect(button.classes()).toContain('link')
    })
  })

  describe('state management', () => {
    it('expand state is component-local (ref)', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.expand).toBe(false)
    })

    it('expand state persists across re-renders', async () => {
      const wrapper = mountComponent()
      wrapper.vm.expand = true
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.expand).toBe(true)
    })
  })
})
