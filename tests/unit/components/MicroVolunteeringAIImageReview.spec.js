import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import MicroVolunteeringAIImageReview from '~/components/MicroVolunteeringAIImageReview.vue'

const mockMicroVolunteeringStore = {
  respond: vi.fn().mockResolvedValue(undefined),
}

vi.mock('~/stores/microvolunteering', () => ({
  useMicroVolunteeringStore: () => mockMicroVolunteeringStore,
}))

const testAIImage = {
  id: 42,
  name: 'Sofa',
  url: 'https://images.ilovefreegle.org/freegletusd-test-sofa',
  usage_count: 150,
}

describe('MicroVolunteeringAIImageReview', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function createWrapper(props = {}) {
    return mount(MicroVolunteeringAIImageReview, {
      props: {
        aiimage: testAIImage,
        ...props,
      },
      global: {
        stubs: {
          SpinButton: {
            template:
              '<button class="spin-button" :disabled="disabled" @click="$emit(\'handle\', () => {})">{{ label }}</button>',
            props: ['iconName', 'variant', 'label', 'disabled'],
            emits: ['handle'],
          },
          'v-icon': {
            template: '<span class="v-icon" />',
            props: ['icon'],
          },
          'b-button': {
            template:
              '<button class="b-button" :class="variant" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant'],
            emits: ['click'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('shows intro text about AI images', () => {
      const wrapper = createWrapper()
      const text = wrapper.find('.intro-text').text()
      expect(text).toContain('AI-generated stock images')
      expect(text).toContain('Can you help')
    })

    it('displays the AI image', () => {
      const wrapper = createWrapper()
      const img = wrapper.find('.review-image')
      expect(img.exists()).toBe(true)
      expect(img.attributes('src')).toBe(testAIImage.url)
      expect(img.attributes('alt')).toContain('Sofa')
    })

    it('shows the item name as caption', () => {
      const wrapper = createWrapper()
      const caption = wrapper.find('.image-caption')
      expect(caption.text()).toContain('Sofa')
    })

    it('shows people question', () => {
      const wrapper = createWrapper()
      const text = wrapper.text()
      expect(text).toContain('Does this image contain pictures of people')
    })

    it('shows quality question with item name', () => {
      const wrapper = createWrapper()
      const text = wrapper.text()
      expect(text).toContain('Is this a good image')
      expect(text).toContain('Sofa')
    })
  })

  describe('people question', () => {
    it('starts with containsPeople as null', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.containsPeople).toBeNull()
    })

    it('sets containsPeople to true on Yes click', async () => {
      const wrapper = createWrapper()
      const buttons = wrapper.findAll('.b-button')
      // First b-button is "Yes"
      await buttons[0].trigger('click')
      expect(wrapper.vm.containsPeople).toBe(true)
    })

    it('sets containsPeople to false on No click', async () => {
      const wrapper = createWrapper()
      const buttons = wrapper.findAll('.b-button')
      // Second b-button is "No"
      await buttons[1].trigger('click')
      expect(wrapper.vm.containsPeople).toBe(false)
    })
  })

  describe('approve flow', () => {
    it('calls store respond with correct params on approve', async () => {
      const wrapper = createWrapper()

      // Answer people question first
      const buttons = wrapper.findAll('.b-button')
      await buttons[1].trigger('click') // No people

      // Find and click approve button
      const spinButtons = wrapper.findAll('.spin-button')
      const approveBtn = spinButtons.find((b) =>
        b.text().includes('looks good')
      )
      await approveBtn.trigger('click')
      await flushPromises()

      expect(mockMicroVolunteeringStore.respond).toHaveBeenCalledWith({
        aiimageid: 42,
        response: 'Approve',
        containspeople: false,
      })
    })

    it('emits next event after approve', async () => {
      const wrapper = createWrapper()

      const buttons = wrapper.findAll('.b-button')
      await buttons[1].trigger('click')

      const spinButtons = wrapper.findAll('.spin-button')
      const approveBtn = spinButtons.find((b) =>
        b.text().includes('looks good')
      )
      await approveBtn.trigger('click')
      await flushPromises()

      expect(wrapper.emitted('next')).toHaveLength(1)
    })
  })

  describe('reject flow', () => {
    it('calls store respond with correct params on reject', async () => {
      const wrapper = createWrapper()

      // Answer people question — yes
      const buttons = wrapper.findAll('.b-button')
      await buttons[0].trigger('click') // Yes people

      // Click reject
      const spinButtons = wrapper.findAll('.spin-button')
      const rejectBtn = spinButtons.find((b) => b.text().includes('not great'))
      await rejectBtn.trigger('click')
      await flushPromises()

      expect(mockMicroVolunteeringStore.respond).toHaveBeenCalledWith({
        aiimageid: 42,
        response: 'Reject',
        containspeople: true,
      })
    })

    it('emits next event after reject', async () => {
      const wrapper = createWrapper()

      const buttons = wrapper.findAll('.b-button')
      await buttons[0].trigger('click')

      const spinButtons = wrapper.findAll('.spin-button')
      const rejectBtn = spinButtons.find((b) => b.text().includes('not great'))
      await rejectBtn.trigger('click')
      await flushPromises()

      expect(wrapper.emitted('next')).toHaveLength(1)
    })
  })

  describe('button state', () => {
    it('disables quality buttons until people question answered', () => {
      const wrapper = createWrapper()
      const spinButtons = wrapper.findAll('.spin-button')
      spinButtons.forEach((btn) => {
        expect(btn.attributes('disabled')).toBeDefined()
      })
    })

    it('enables quality buttons after people question answered', async () => {
      const wrapper = createWrapper()
      const buttons = wrapper.findAll('.b-button')
      await buttons[0].trigger('click') // Yes people

      const spinButtons = wrapper.findAll('.spin-button')
      spinButtons.forEach((btn) => {
        expect(btn.attributes('disabled')).toBeUndefined()
      })
    })
  })
})
