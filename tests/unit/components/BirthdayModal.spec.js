import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import BirthdayModal from '~/components/BirthdayModal.vue'

describe('BirthdayModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function createWrapper(props = {}) {
    return mount(BirthdayModal, {
      props: {
        modelValue: true,
        groupAge: 15,
        groupName: 'Test Community',
        groupId: 123,
        ...props,
      },
      global: {
        stubs: {
          'b-modal': {
            template: `
              <div v-if="modelValue" class="modal" data-testid="modal">
                <slot></slot>
              </div>
            `,
            props: [
              'modelValue',
              'size',
              'centered',
              'hideHeader',
              'hideFooter',
            ],
          },
          'b-button': {
            template:
              '<button :class="variant" @click="$emit(\'click\')"><slot /></button>',
            props: ['variant', 'size'],
          },
          BirthdayHero: {
            template: `
              <div class="birthday-hero" :data-age="groupAge" :data-title="title" :data-group-id="groupId">
                <slot />
              </div>
            `,
            props: ['groupAge', 'title', 'groupId', 'isToday'],
            emits: ['donation-success', 'donation-click'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('shows modal when modelValue is true', () => {
      const wrapper = createWrapper({ modelValue: true })
      expect(wrapper.find('.modal').exists()).toBe(true)
    })

    it('hides modal when modelValue is false', () => {
      const wrapper = createWrapper({ modelValue: false })
      expect(wrapper.find('.modal').exists()).toBe(false)
    })

    it('renders BirthdayHero component', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.birthday-hero').exists()).toBe(true)
    })

    it('passes groupAge to BirthdayHero', () => {
      const wrapper = createWrapper({ groupAge: 20 })
      expect(wrapper.find('.birthday-hero').attributes('data-age')).toBe('20')
    })

    it('passes groupId to BirthdayHero', () => {
      const wrapper = createWrapper({ groupId: 456 })
      expect(wrapper.find('.birthday-hero').attributes('data-group-id')).toBe(
        '456'
      )
    })

    it('shows Maybe later button', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Maybe later')
    })
  })

  describe('title computed', () => {
    it('generates title from groupName and groupAge', () => {
      const wrapper = createWrapper({
        groupName: 'Cambridge Freegle',
        groupAge: 12,
      })
      expect(wrapper.find('.birthday-hero').attributes('data-title')).toBe(
        'Cambridge Freegle is 12 years old!'
      )
    })
  })

  describe('close action', () => {
    it('emits update:modelValue with false when Maybe later is clicked', async () => {
      const wrapper = createWrapper()
      const button = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Maybe later'))
      await button.trigger('click')

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')[0]).toEqual([false])
    })
  })

  describe('donation events', () => {
    it('has closeModal method for donation success handling', () => {
      const wrapper = createWrapper()
      // Verify component has the closeModal method for handling donation success
      expect(typeof wrapper.vm.closeModal).toBe('function')
    })

    it('has onDonationClick method for donation click handling', () => {
      const wrapper = createWrapper()
      // Verify component has the event handler method
      expect(typeof wrapper.vm.onDonationClick).toBe('function')
    })
  })
})
