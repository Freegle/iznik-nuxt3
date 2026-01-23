import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, config } from '@vue/test-utils'
import ModGiftAid from '~/modtools/components/ModGiftAid.vue'

const mockGiftaidApi = {
  edit: vi.fn().mockResolvedValue({}),
}

vi.mock('#app', () => ({
  useNuxtApp: () => ({
    $api: {
      giftaid: mockGiftaidApi,
    },
  }),
}))

config.global.mocks = {
  ...config.global.mocks,
  timeago: vi.fn(() => '2 days ago'),
}

describe('ModGiftAid', () => {
  const validGiftaid = {
    id: 123,
    userid: 456,
    fullname: 'John Smith',
    homeaddress: '123 Test Street\nTest City',
    housenameornumber: '123',
    postcode: 'AB1 2CD',
    timestamp: '2024-01-01T12:00:00Z',
    period: '2024',
    donations: 50,
    email: [
      { email: 'test@example.com', ourdomain: false, preferred: true },
      { email: 'other@freegle.org', ourdomain: true, preferred: false },
    ],
  }

  const invalidGiftaid = {
    id: 789,
    userid: 999,
    fullname: 'NoLastName',
    homeaddress: '456 Bad Street',
    housenameornumber: '',
    postcode: 'Invalid',
    timestamp: '2024-01-01T12:00:00Z',
    period: '2024',
    donations: null,
    email: null,
  }

  function mountComponent(props = {}) {
    return mount(ModGiftAid, {
      props: { giftaid: validGiftaid, ...props },
      global: {
        mocks: {
          timeago: vi.fn(() => '2 days ago'),
        },
        stubs: {
          'b-row': { template: '<div class="row"><slot /></div>' },
          'b-col': {
            template: '<div class="col"><slot /></div>',
            props: ['cols', 'md'],
          },
          'b-form-input': {
            template:
              '<input :value="modelValue" :class="$attrs.class" :placeholder="placeholder" @input="$emit(\'update:modelValue\', $event.target.value)" />',
            props: ['modelValue', 'placeholder'],
          },
          'b-form-textarea': {
            template:
              '<textarea :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
            props: ['modelValue', 'rows'],
          },
          NoticeMessage: {
            template: '<div class="notice" :class="variant"><slot /></div>',
            props: ['variant'],
          },
          ExternalLink: {
            template: '<a :href="href"><slot /></a>',
            props: ['href'],
          },
          SpinButton: {
            template:
              '<button :class="variant" :disabled="disabled" @click="$emit(\'handle\', () => {})"><slot />{{ label }}</button>',
            props: ['variant', 'iconName', 'label', 'confirm', 'disabled'],
          },
          'v-icon': { template: '<span class="icon" />', props: ['icon'] },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('displays the fullname input', async () => {
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()
      const inputs = wrapper.findAll('input')
      expect(inputs.length).toBeGreaterThan(0)
    })

    it('displays user email with mailto link', async () => {
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()
      const link = wrapper.find('a')
      expect(link.attributes('href')).toContain('mailto:test@example.com')
    })

    it('shows donations amount when present', async () => {
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toContain('50')
    })

    it('shows danger notice when no donations found', async () => {
      const wrapper = mountComponent({ giftaid: invalidGiftaid })
      await wrapper.vm.$nextTick()
      const dangerNotice = wrapper.find('.notice.danger')
      expect(dangerNotice.exists()).toBe(true)
      expect(dangerNotice.text()).toContain('No donations found')
    })

    it('displays user ID and gift aid ID', async () => {
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toContain('456')
      expect(wrapper.text()).toContain('123')
    })

    it('hides component when hide is true', async () => {
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()
      wrapper.vm.hide = true
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.row').exists()).toBe(false)
    })
  })

  describe('computed properties', () => {
    describe('nameInvalid', () => {
      it('returns false when name has space (valid)', async () => {
        const wrapper = mountComponent()
        await wrapper.vm.$nextTick()
        expect(wrapper.vm.nameInvalid).toBe(false)
      })

      it('returns true when name has no space', async () => {
        const wrapper = mountComponent({ giftaid: invalidGiftaid })
        await wrapper.vm.$nextTick()
        expect(wrapper.vm.nameInvalid).toBe(true)
      })

      it('returns false when editgiftaid is not set', async () => {
        const wrapper = mountComponent()
        wrapper.vm.editgiftaid = false
        await wrapper.vm.$nextTick()
        expect(wrapper.vm.nameInvalid).toBe(false)
      })
    })

    describe('postcodeInvalid', () => {
      it('returns false when postcode has space (valid UK format)', async () => {
        const wrapper = mountComponent()
        await wrapper.vm.$nextTick()
        expect(wrapper.vm.postcodeInvalid).toBe(false)
      })

      it('returns true when postcode has no space', async () => {
        const wrapper = mountComponent({ giftaid: invalidGiftaid })
        await wrapper.vm.$nextTick()
        expect(wrapper.vm.postcodeInvalid).toBe(true)
      })

      it('returns true when postcode is empty', async () => {
        const giftaid = { ...validGiftaid, postcode: '' }
        const wrapper = mountComponent({ giftaid })
        await wrapper.vm.$nextTick()
        expect(wrapper.vm.postcodeInvalid).toBe(true)
      })

      it('returns true when postcode is null', async () => {
        const giftaid = { ...validGiftaid, postcode: null }
        const wrapper = mountComponent({ giftaid })
        await wrapper.vm.$nextTick()
        expect(wrapper.vm.postcodeInvalid).toBe(true)
      })
    })

    describe('houseInvalid', () => {
      it('returns false when housenameornumber is set', async () => {
        const wrapper = mountComponent()
        await wrapper.vm.$nextTick()
        expect(wrapper.vm.houseInvalid).toBe(false)
      })

      it('returns true when housenameornumber is empty', async () => {
        const wrapper = mountComponent({ giftaid: invalidGiftaid })
        await wrapper.vm.$nextTick()
        expect(wrapper.vm.houseInvalid).toBe(true)
      })
    })

    describe('email', () => {
      it('returns preferred non-ourdomain email', async () => {
        const wrapper = mountComponent()
        await wrapper.vm.$nextTick()
        expect(wrapper.vm.email).toBe('test@example.com')
      })

      it('returns first non-ourdomain email if none preferred', async () => {
        const giftaid = {
          ...validGiftaid,
          email: [
            { email: 'personal@gmail.com', ourdomain: false, preferred: false },
            { email: 'freegle@freegle.org', ourdomain: true, preferred: true },
          ],
        }
        const wrapper = mountComponent({ giftaid })
        await wrapper.vm.$nextTick()
        expect(wrapper.vm.email).toBe('personal@gmail.com')
      })

      it('returns null when no email array', async () => {
        const wrapper = mountComponent({ giftaid: invalidGiftaid })
        await wrapper.vm.$nextTick()
        expect(wrapper.vm.email).toBeNull()
      })

      it('returns null when email array is empty', async () => {
        const giftaid = { ...validGiftaid, email: [] }
        const wrapper = mountComponent({ giftaid })
        await wrapper.vm.$nextTick()
        expect(wrapper.vm.email).toBeNull()
      })

      it('skips ourdomain emails', async () => {
        const giftaid = {
          ...validGiftaid,
          email: [
            { email: 'freegle@freegle.org', ourdomain: true, preferred: true },
          ],
        }
        const wrapper = mountComponent({ giftaid })
        await wrapper.vm.$nextTick()
        expect(wrapper.vm.email).toBeNull()
      })
    })
  })

  describe('methods', () => {
    describe('save', () => {
      it('calls api.giftaid.edit with correct parameters', async () => {
        const wrapper = mountComponent()
        await wrapper.vm.$nextTick()
        const callback = vi.fn()
        wrapper.vm.save(callback)
        expect(mockGiftaidApi.edit).toHaveBeenCalledWith(
          123,
          '2024',
          'John Smith',
          '123 Test Street\nTest City',
          'AB1 2CD',
          '123',
          false
        )
        expect(callback).toHaveBeenCalled()
      })
    })

    describe('reviewed', () => {
      it('calls api.giftaid.edit with reviewed flag', async () => {
        const wrapper = mountComponent()
        await wrapper.vm.$nextTick()
        const callback = vi.fn()
        wrapper.vm.reviewed(callback)
        expect(mockGiftaidApi.edit).toHaveBeenCalledWith(
          123,
          null,
          null,
          null,
          null,
          null,
          true
        )
        expect(callback).toHaveBeenCalled()
      })

      it('sets hide to true', async () => {
        const wrapper = mountComponent()
        await wrapper.vm.$nextTick()
        wrapper.vm.reviewed()
        expect(wrapper.vm.hide).toBe(true)
      })

      it('handles null callback', async () => {
        const wrapper = mountComponent()
        await wrapper.vm.$nextTick()
        expect(() => wrapper.vm.reviewed(null)).not.toThrow()
      })
    })

    describe('giveup', () => {
      it('calls reviewed when no donations', async () => {
        const wrapper = mountComponent({ giftaid: invalidGiftaid })
        await wrapper.vm.$nextTick()
        const callback = vi.fn()
        wrapper.vm.giveup(callback)
        expect(mockGiftaidApi.edit).toHaveBeenCalledWith(
          789,
          null,
          null,
          null,
          null,
          null,
          true
        )
        expect(callback).toHaveBeenCalled()
      })

      it('calls api.giftaid.edit with giveup flag when has donations', async () => {
        const wrapper = mountComponent()
        await wrapper.vm.$nextTick()
        const callback = vi.fn()
        wrapper.vm.giveup(callback)
        expect(mockGiftaidApi.edit).toHaveBeenCalledWith(
          123,
          null,
          null,
          null,
          null,
          null,
          false,
          true
        )
        expect(wrapper.vm.hide).toBe(true)
        expect(callback).toHaveBeenCalled()
      })
    })
  })

  describe('props', () => {
    it('copies giftaid prop to editgiftaid on mount', async () => {
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.editgiftaid).toEqual(validGiftaid)
    })
  })

  describe('button disabled states', () => {
    it('disables Looks Good button when name is invalid', async () => {
      const wrapper = mountComponent({ giftaid: invalidGiftaid })
      await wrapper.vm.$nextTick()
      const buttons = wrapper.findAll('button')
      const looksGoodButton = buttons.find((b) =>
        b.text().includes('Looks Good')
      )
      expect(looksGoodButton.attributes('disabled')).toBe('')
    })

    it('enables Looks Good button when all fields valid', async () => {
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()
      const buttons = wrapper.findAll('button')
      const looksGoodButton = buttons.find((b) =>
        b.text().includes('Looks Good')
      )
      expect(looksGoodButton.attributes('disabled')).toBeUndefined()
    })
  })
})
