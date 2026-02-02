import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import MicroVolunteeringFacebook from '~/components/MicroVolunteeringFacebook.vue'

const mockMicroVolunteeringStore = {
  respond: vi.fn().mockResolvedValue(undefined),
}

vi.mock('~/stores/microvolunteering', () => ({
  useMicroVolunteeringStore: () => mockMicroVolunteeringStore,
}))

vi.mock('#app', () => ({
  useNuxtApp: () => ({
    vueApp: {
      use: vi.fn(),
    },
  }),
}))

vi.mock('vue-social-sharing', () => ({
  default: {},
}))

describe('MicroVolunteeringFacebook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function createWrapper(props = {}) {
    return mount(MicroVolunteeringFacebook, {
      props: {
        id: '12345_67890',
        ...props,
      },
      global: {
        stubs: {
          'b-button': {
            template:
              '<button class="b-button" :class="[variant, size]" @click="$emit(\'click\', $event)"><slot /></button>',
            props: ['variant', 'size'],
          },
          'v-icon': {
            template: '<span class="v-icon" :data-icon="icon" />',
            props: ['icon'],
          },
          ShareNetwork: {
            template:
              '<div class="share-network" :data-network="network" :data-url="url"><slot /></div>',
            props: ['network', 'url', 'title', 'hashtags'],
            emits: ['close'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders iframe with Facebook post URL', () => {
      const wrapper = createWrapper()
      const iframe = wrapper.find('iframe')
      expect(iframe.exists()).toBe(true)
      expect(iframe.attributes('src')).toContain('67890')
    })

    it('renders Skip button', () => {
      const wrapper = createWrapper()
      const skipBtn = wrapper
        .findAll('.b-button')
        .find((b) => b.text().includes('Skip'))
      expect(skipBtn.exists()).toBe(true)
      expect(skipBtn.classes()).toContain('secondary')
    })

    it('renders Share on Facebook button', () => {
      const wrapper = createWrapper()
      const shareBtn = wrapper
        .findAll('.b-button')
        .find((b) => b.text().includes('Share on Facebook'))
      expect(shareBtn.exists()).toBe(true)
    })

    it('renders ShareNetwork component', () => {
      const wrapper = createWrapper()
      const shareNetwork = wrapper.find('.share-network')
      expect(shareNetwork.exists()).toBe(true)
      expect(shareNetwork.attributes('data-network')).toBe('facebook')
    })
  })

  describe('props', () => {
    it('requires id prop', () => {
      const wrapper = createWrapper({ id: '111_222' })
      expect(wrapper.props('id')).toBe('111_222')
    })
  })

  describe('computed postId', () => {
    it('extracts post ID after underscore', () => {
      const wrapper = createWrapper({ id: '12345_67890' })
      expect(wrapper.vm.postId).toBe('67890')
    })

    it('handles ID with multiple underscores', () => {
      const wrapper = createWrapper({ id: 'prefix_12345_67890' })
      expect(wrapper.vm.postId).toBe('12345_67890')
    })
  })

  describe('skip method', () => {
    it('calls microVolunteeringStore.respond with Reject', async () => {
      const wrapper = createWrapper()
      await wrapper.vm.skip()
      expect(mockMicroVolunteeringStore.respond).toHaveBeenCalledWith({
        facebook: '12345_67890',
        response: 'Reject',
      })
    })

    it('emits next event after skip', async () => {
      const wrapper = createWrapper()
      await wrapper.vm.skip()
      expect(wrapper.emitted('next')).toBeTruthy()
    })
  })

  describe('done method', () => {
    it('calls microVolunteeringStore.respond with Approve', async () => {
      const wrapper = createWrapper()
      await wrapper.vm.done()
      expect(mockMicroVolunteeringStore.respond).toHaveBeenCalledWith({
        facebook: '12345_67890',
        response: 'Approve',
      })
    })

    it('emits next event after done', async () => {
      const wrapper = createWrapper()
      await wrapper.vm.done()
      expect(wrapper.emitted('next')).toBeTruthy()
    })
  })

  describe('close method', () => {
    it('calls microVolunteeringStore.respond with Approve when close is called', async () => {
      const wrapper = createWrapper()
      await wrapper.vm.close()
      expect(mockMicroVolunteeringStore.respond).toHaveBeenCalledWith({
        facebook: '12345_67890',
        response: 'Approve',
      })
    })

    it('emits next event after close', async () => {
      const wrapper = createWrapper()
      await wrapper.vm.close()
      expect(wrapper.emitted('next')).toBeTruthy()
    })
  })

  describe('button clicks', () => {
    it('calls skip when Skip button clicked', async () => {
      const wrapper = createWrapper()
      const skipBtn = wrapper
        .findAll('.b-button')
        .find((b) => b.text().includes('Skip'))
      await skipBtn.trigger('click')
      expect(mockMicroVolunteeringStore.respond).toHaveBeenCalledWith({
        facebook: '12345_67890',
        response: 'Reject',
      })
    })
  })

  describe('iframe attributes', () => {
    it('has correct width and height', () => {
      const wrapper = createWrapper()
      const iframe = wrapper.find('iframe')
      expect(iframe.attributes('width')).toBe('552')
      expect(iframe.attributes('height')).toBe('576')
    })

    it('has title for accessibility', () => {
      const wrapper = createWrapper()
      const iframe = wrapper.find('iframe')
      expect(iframe.attributes('title')).toBe('Facebook post share')
    })
  })
})
