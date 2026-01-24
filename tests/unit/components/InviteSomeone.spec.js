import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import InviteSomeone from '~/components/InviteSomeone.vue'

const mockShown = vi.fn()
const mockChosen = vi.fn()

vi.mock('~/stores/mobile', () => ({
  useMobileStore: () => ({
    isApp: false,
  }),
}))

vi.mock('#app', () => ({
  useRuntimeConfig: () => ({
    public: {
      USER_SITE: 'https://www.ilovefreegle.org',
    },
  }),
  useNuxtApp: () => ({
    vueApp: {
      use: vi.fn(),
    },
    $api: {
      bandit: {
        shown: mockShown,
        chosen: mockChosen,
      },
    },
  }),
}))

vi.mock('vue-social-sharing', () => ({
  default: {},
}))

vi.mock('@capacitor/share', () => ({
  Share: {
    share: vi.fn(),
  },
}))

// Make useNuxtApp available globally (it's auto-imported by Nuxt)
globalThis.useNuxtApp = () => ({
  vueApp: {
    use: vi.fn(),
  },
  $api: {
    bandit: {
      shown: mockShown,
      chosen: mockChosen,
    },
  },
})

describe('InviteSomeone', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function createWrapper(props = {}) {
    return mount(InviteSomeone, {
      props: {
        ...props,
      },
      global: {
        stubs: {
          'b-button': {
            template:
              '<button class="b-button" :class="[variantClass, $attrs.class]"><slot /></button>',
            props: ['variant', 'size'],
            computed: {
              variantClass() {
                return 'btn-' + this.variant
              },
            },
          },
          'b-form-textarea': {
            template:
              '<textarea class="b-form-textarea" :id="id" :value="modelValue" :maxlength="maxlength" :rows="rows" :placeholder="placeholder" @input="$emit(\'update:modelValue\', $event.target.value)" />',
            props: [
              'id',
              'modelValue',
              'maxlength',
              'rows',
              'size',
              'placeholder',
            ],
            emits: ['update:modelValue'],
          },
          'b-list-group': {
            template: '<div class="b-list-group"><slot /></div>',
            props: ['horizontal'],
          },
          'b-list-group-item': {
            template: '<div class="b-list-group-item"><slot /></div>',
          },
          ShareNetwork: {
            template:
              '<div class="share-network" :data-network="network" @click="$emit(\'open\')"><slot /></div>',
            props: ['network', 'url', 'title', 'description', 'hashtags'],
            emits: ['open'],
          },
          'v-icon': {
            template: '<span class="v-icon" :data-icon="icon" />',
            props: ['icon'],
          },
        },
      },
    })
  }

  describe('web mode rendering', () => {
    it('renders textarea for invitation message', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.b-form-textarea').exists()).toBe(true)
    })

    it('renders social share buttons', () => {
      const wrapper = createWrapper()
      const shareNetworks = wrapper.findAll('.share-network')
      expect(shareNetworks.length).toBe(4)
    })

    it('renders Facebook share button', () => {
      const wrapper = createWrapper()
      const facebook = wrapper.find('[data-network="facebook"]')
      expect(facebook.exists()).toBe(true)
      expect(facebook.text()).toContain('Facebook')
    })

    it('renders Twitter share button', () => {
      const wrapper = createWrapper()
      const twitter = wrapper.find('[data-network="twitter"]')
      expect(twitter.exists()).toBe(true)
      expect(twitter.text()).toContain('X')
    })

    it('renders WhatsApp share button', () => {
      const wrapper = createWrapper()
      const whatsapp = wrapper.find('[data-network="whatsapp"]')
      expect(whatsapp.exists()).toBe(true)
      expect(whatsapp.text()).toContain('Whatsapp')
    })

    it('renders Email share button', () => {
      const wrapper = createWrapper()
      const email = wrapper.find('[data-network="email"]')
      expect(email.exists()).toBe(true)
      expect(email.text()).toContain('Email')
    })
  })

  describe('invitation message', () => {
    it('has default invitation text', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.invitation).toContain("I'm using Freegle")
      expect(wrapper.vm.invitation).toContain('ilovefreegle.org')
    })

    it('has default title', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.title).toBe('Have you heard about Freegle?')
    })

    it('textarea has correct placeholder', () => {
      const wrapper = createWrapper()
      const textarea = wrapper.find('.b-form-textarea')
      expect(textarea.attributes('placeholder')).toContain(
        'Tell your friends why they should get freegling'
      )
    })

    it('textarea has maxlength of 160', () => {
      const wrapper = createWrapper()
      const textarea = wrapper.find('.b-form-textarea')
      expect(textarea.attributes('maxlength')).toBe('160')
    })
  })

  describe('events', () => {
    it('emits invited when share network is opened', async () => {
      const wrapper = createWrapper()
      const facebook = wrapper.find('[data-network="facebook"]')
      await facebook.trigger('click')

      expect(wrapper.emitted('invited')).toBeTruthy()
    })

    it('calls bandit.chosen when share network is opened', async () => {
      const wrapper = createWrapper()
      const twitter = wrapper.find('[data-network="twitter"]')
      await twitter.trigger('click')

      expect(mockChosen).toHaveBeenCalledWith({
        uid: 'Invite',
        variant: 'microvolunteering',
      })
    })
  })

  describe('props', () => {
    it('has headingLevel prop defaulting to h3', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('headingLevel')).toBe('h3')
    })

    it('accepts custom headingLevel', () => {
      const wrapper = createWrapper({ headingLevel: 'h2' })
      expect(wrapper.props('headingLevel')).toBe('h2')
    })

    it('has trustPilot prop defaulting to true', () => {
      const wrapper = createWrapper()
      expect(wrapper.props('trustPilot')).toBe(true)
    })

    it('accepts trustPilot as false', () => {
      const wrapper = createWrapper({ trustPilot: false })
      expect(wrapper.props('trustPilot')).toBe(false)
    })
  })

  describe('social button variants', () => {
    it('Facebook button has secondary variant', () => {
      const wrapper = createWrapper()
      const facebookBtn = wrapper
        .find('[data-network="facebook"]')
        .find('.b-button')
      expect(facebookBtn.classes()).toContain('btn-secondary')
    })

    it('Facebook button has facebook class', () => {
      const wrapper = createWrapper()
      const facebookBtn = wrapper
        .find('[data-network="facebook"]')
        .find('.b-button')
      expect(facebookBtn.classes()).toContain('facebook')
    })

    it('Twitter button has twitter class', () => {
      const wrapper = createWrapper()
      const twitterBtn = wrapper
        .find('[data-network="twitter"]')
        .find('.b-button')
      expect(twitterBtn.classes()).toContain('twitter')
    })

    it('WhatsApp button has whatsapp class', () => {
      const wrapper = createWrapper()
      const whatsappBtn = wrapper
        .find('[data-network="whatsapp"]')
        .find('.b-button')
      expect(whatsappBtn.classes()).toContain('whatsapp')
    })

    it('Email button has gmail class', () => {
      const wrapper = createWrapper()
      const emailBtn = wrapper.find('[data-network="email"]').find('.b-button')
      expect(emailBtn.classes()).toContain('gmail')
    })
  })
})
