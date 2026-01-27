import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import MicroVolunteeringSimilarTerms from '~/components/MicroVolunteeringSimilarTerms.vue'

const mockRespond = vi.fn()

vi.mock('~/stores/microvolunteering', () => ({
  useMicroVolunteeringStore: () => ({
    respond: mockRespond,
  }),
}))

describe('MicroVolunteeringSimilarTerms', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRespond.mockResolvedValue({})
  })

  function createWrapper(props = {}) {
    return mount(MicroVolunteeringSimilarTerms, {
      props: {
        terms: [
          { id: 1, term: 'bicycle' },
          { id: 2, term: 'bike' },
          { id: 3, term: 'chair' },
          { id: 4, term: 'table' },
        ],
        ...props,
      },
      global: {
        stubs: {
          MicroVolunteeringSimilarTerm: {
            template: `
              <button
                class="term-btn"
                :data-id="term.id"
                @click="handleClick"
              >{{ term.term }}</button>
            `,
            props: ['term', 'similarTerms'],
            emits: ['similar', 'not'],
            methods: {
              handleClick() {
                if (this.similarTerms.some((t) => t.id === this.term.id)) {
                  this.$emit('not', this.term)
                } else {
                  this.$emit('similar', this.term)
                }
              },
            },
          },
          'b-button': {
            template:
              '<button :disabled="disabled" :class="[variant, size]" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant', 'size', 'disabled'],
            emits: ['click'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders container', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('div').exists()).toBe(true)
    })

    it('shows instructions', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('two most similar')
    })

    it('renders all term buttons', () => {
      const wrapper = createWrapper()
      const buttons = wrapper.findAll('.term-btn')
      expect(buttons.length).toBe(4)
    })

    it('displays term text on buttons', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('bicycle')
      expect(wrapper.text()).toContain('bike')
      expect(wrapper.text()).toContain('chair')
      expect(wrapper.text()).toContain('table')
    })

    it('shows skip button', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Skip')
    })

    it('shows submit button', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Submit')
    })
  })

  describe('button states', () => {
    it('skip button is enabled when no terms selected', () => {
      const wrapper = createWrapper()
      const skipButton = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Skip'))
      expect(skipButton.attributes('disabled')).toBeFalsy()
    })

    it('submit button is disabled when less than 2 terms selected', () => {
      const wrapper = createWrapper()
      const submitButton = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Submit'))
      expect(submitButton.attributes('disabled')).toBe('')
    })

    it('skip button is disabled when terms are selected', async () => {
      const wrapper = createWrapper()
      const termButton = wrapper.find('.term-btn')
      await termButton.trigger('click')
      const skipButton = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Skip'))
      expect(skipButton.attributes('disabled')).toBe('')
    })
  })

  describe('term selection', () => {
    it('adds term to similarTerms when clicked', async () => {
      const wrapper = createWrapper()
      const termButton = wrapper.find('.term-btn[data-id="1"]')
      await termButton.trigger('click')
      expect(wrapper.vm.similarTerms).toContainEqual({ id: 1, term: 'bicycle' })
    })

    it('allows selecting up to 2 terms', async () => {
      const wrapper = createWrapper()
      const buttons = wrapper.findAll('.term-btn')
      await buttons[0].trigger('click')
      await buttons[1].trigger('click')
      expect(wrapper.vm.similarTerms.length).toBe(2)
    })

    it('does not allow selecting more than 2 terms', async () => {
      const wrapper = createWrapper()
      const buttons = wrapper.findAll('.term-btn')
      await buttons[0].trigger('click')
      await buttons[1].trigger('click')
      await buttons[2].trigger('click')
      expect(wrapper.vm.similarTerms.length).toBe(2)
    })

    it('removes term when clicked again', async () => {
      const wrapper = createWrapper()
      const termButton = wrapper.find('.term-btn[data-id="1"]')
      await termButton.trigger('click')
      expect(wrapper.vm.similarTerms.length).toBe(1)
      await termButton.trigger('click')
      expect(wrapper.vm.similarTerms.length).toBe(0)
    })
  })

  describe('skip functionality', () => {
    it('emits next event when skip clicked', async () => {
      const wrapper = createWrapper()
      const skipButton = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Skip'))
      await skipButton.trigger('click')
      expect(wrapper.emitted('next')).toBeTruthy()
    })
  })

  describe('submit functionality', () => {
    it('calls store respond with selected term ids', async () => {
      const wrapper = createWrapper()
      const buttons = wrapper.findAll('.term-btn')
      await buttons[0].trigger('click')
      await buttons[1].trigger('click')

      const submitButton = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Submit'))
      await submitButton.trigger('click')

      expect(mockRespond).toHaveBeenCalledWith({
        searchterm1: 1,
        searchterm2: 2,
      })
    })

    it('emits next event after submit', async () => {
      const wrapper = createWrapper()
      const buttons = wrapper.findAll('.term-btn')
      await buttons[0].trigger('click')
      await buttons[1].trigger('click')

      const submitButton = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Submit'))
      await submitButton.trigger('click')

      expect(wrapper.emitted('next')).toBeTruthy()
    })
  })

  describe('props', () => {
    it('requires terms prop', () => {
      const terms = [{ id: 5, term: 'lamp' }]
      const wrapper = createWrapper({ terms })
      expect(wrapper.props('terms')).toEqual(terms)
    })
  })
})
