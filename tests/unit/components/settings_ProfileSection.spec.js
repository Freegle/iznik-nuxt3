import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ProfileSection from '~/components/settings/ProfileSection.vue'

const { mockMe, mockMyid } = vi.hoisted(() => {
  const { ref } = require('vue')
  return {
    mockMe: ref({
      id: 123,
      displayname: 'Test User',
      systemrole: 'User',
      supporter: false,
      donated: null,
      settings: {
        useprofile: true,
        hidesupporter: false,
      },
      profile: {
        id: 1,
        path: '/profile/123.jpg',
        ours: true,
        externaluid: null,
        externalmods: null,
      },
      aboutme: {
        text: 'Hello, I am a test user!',
      },
    }),
    mockMyid: ref(123),
  }
})

const mockSaveAndGet = vi.fn()
const mockImagePost = vi.fn()
const mockFetchMe = vi.fn()

vi.mock('~/composables/useMe', () => ({
  useMe: () => ({
    me: mockMe,
    myid: mockMyid,
  }),
  fetchMe: (...args) => mockFetchMe(...args),
}))

vi.mock('~/stores/auth', () => ({
  useAuthStore: () => ({
    saveAndGet: mockSaveAndGet,
  }),
}))

vi.mock('~/stores/image', () => ({
  useImageStore: () => ({
    post: mockImagePost,
  }),
}))

describe('ProfileSection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockMe.value = {
      id: 123,
      displayname: 'Test User',
      systemrole: 'User',
      supporter: false,
      donated: null,
      settings: {
        useprofile: true,
        hidesupporter: false,
      },
      profile: {
        id: 1,
        path: '/profile/123.jpg',
        ours: true,
        externaluid: null,
        externalmods: null,
      },
      aboutme: {
        text: 'Hello, I am a test user!',
      },
    }
    mockMyid.value = 123
  })

  function createWrapper() {
    return mount(ProfileSection, {
      global: {
        stubs: {
          'v-icon': {
            template: '<span class="v-icon" :data-icon="icon" :flip="flip" />',
            props: ['icon', 'flip'],
          },
          'b-input-group': {
            template:
              '<div class="b-input-group"><slot /><slot name="append" /></div>',
          },
          'b-form-input': {
            template:
              '<input :id="id" :value="modelValue" :placeholder="placeholder" @input="$emit(\'update:modelValue\', $event.target.value)" />',
            props: ['id', 'modelValue', 'placeholder'],
          },
          'b-button': {
            template:
              '<button :class="variant" :to="to" @click="$emit(\'click\', $event)"><slot /></button>',
            props: ['variant', 'size', 'to'],
          },
          ProfileImage: {
            template:
              '<img class="profile-image" :data-external="externaluid" :data-thumbnail="isThumbnail" />',
            props: [
              'image',
              'externaluid',
              'externalmods',
              'isThumbnail',
              'size',
              'altText',
            ],
          },
          OurUploader: {
            template: '<div class="our-uploader" />',
            props: ['modelValue', 'type'],
          },
          OurToggle: {
            template:
              '<button class="our-toggle" :data-value="modelValue" @click="$emit(\'change\', !modelValue)">{{ modelValue ? labels.checked : labels.unchecked }}</button>',
            props: ['modelValue', 'labels'],
          },
          SupporterInfo: {
            template: '<div class="supporter-info" :data-hidden="hidden" />',
            props: ['size', 'hidden'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('renders settings section container', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.settings-section').exists()).toBe(true)
    })

    it('renders section header', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.section-header').exists()).toBe(true)
    })

    it('displays Your Profile title', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('h2').text()).toBe('Your Profile')
    })

    it('renders globe icon', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.v-icon[data-icon="globe-europe"]').exists()).toBe(
        true
      )
    })

    it('renders eye icon for public badge', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.public-badge').exists()).toBe(true)
      expect(
        wrapper.find('.public-badge .v-icon[data-icon="eye"]').exists()
      ).toBe(true)
    })

    it('displays Public text', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Public')
    })
  })

  describe('name section', () => {
    it('renders name label', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Your name (or nickname)')
    })

    it('renders name input with placeholder', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('input[placeholder="Your name"]').exists()).toBe(true)
    })

    it('initializes displayName from me.displayname', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.displayName).toBe('Test User')
    })

    it('renders Save button for name', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.v-icon[data-icon="save"]').exists()).toBe(true)
    })
  })

  describe('profile photo section', () => {
    it('renders ProfileImage component', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.profile-image').exists()).toBe(true)
    })

    it('renders OurToggle for showing/hiding profile', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.our-toggle').exists()).toBe(true)
    })

    it('shows Showing when profile is visible', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.our-toggle').text()).toBe('Showing')
    })

    it('renders Upload button', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.v-icon[data-icon="camera"]').exists()).toBe(true)
      expect(wrapper.text()).toContain('Upload')
    })

    it('renders rotate buttons when canRotate', () => {
      const wrapper = createWrapper()
      const rotateButtons = wrapper.findAll('.rotate-btn')
      expect(rotateButtons.length).toBe(2)
    })

    it('renders reply icon for rotate left', () => {
      const wrapper = createWrapper()
      const rotateLeftBtn = wrapper.find(
        '.rotate-btn .v-icon[data-icon="reply"]'
      )
      expect(rotateLeftBtn.exists()).toBe(true)
    })

    it('does not render rotate buttons when profile is not own', async () => {
      mockMe.value.profile.ours = false
      mockMe.value.profile.externaluid = null
      const wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      expect(wrapper.findAll('.rotate-btn').length).toBe(0)
    })
  })

  describe('about section', () => {
    it('renders about content when aboutMe exists', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.about-content').exists()).toBe(true)
    })

    it('displays about text', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Hello, I am a test user!')
    })

    it('renders Edit button when about exists', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.edit-btn').exists()).toBe(true)
      expect(wrapper.text()).toContain('Edit')
    })

    it('renders empty state when no aboutMe', async () => {
      mockMe.value.aboutme = null
      const wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.about-empty').exists()).toBe(true)
    })

    it('displays empty text when no aboutMe', async () => {
      mockMe.value.aboutme = null
      const wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toContain('Add a short intro about yourself')
    })

    it('renders Introduce yourself button when no aboutMe', async () => {
      mockMe.value.aboutme = null
      const wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toContain('Introduce yourself')
    })
  })

  describe('view profile button', () => {
    it('renders view profile button', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('View your profile')
    })

    it('renders eye icon', () => {
      const wrapper = createWrapper()
      const buttons = wrapper.findAll('button')
      const viewButton = buttons.find((b) =>
        b.text().includes('View your profile')
      )
      expect(viewButton).toBeTruthy()
    })
  })

  describe('supporter section', () => {
    it('does not show supporter section for regular users', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.supporter-section').exists()).toBe(false)
    })

    it('shows supporter section for moderators', async () => {
      mockMe.value.systemrole = 'Moderator'
      const wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.supporter-section').exists()).toBe(true)
    })

    it('shows supporter section for supporters', async () => {
      mockMe.value.supporter = true
      const wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.supporter-section').exists()).toBe(true)
    })

    it('shows supporter section for recent donors', async () => {
      mockMe.value.donated = new Date().toISOString()
      const wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.supporter-section').exists()).toBe(true)
    })
  })

  describe('computed properties', () => {
    describe('showSupporter', () => {
      it('returns true when hidesupporter is false', () => {
        const wrapper = createWrapper()
        expect(wrapper.vm.showSupporter).toBe(true)
      })

      it('returns false when hidesupporter is true', async () => {
        mockMe.value.settings.hidesupporter = true
        const wrapper = createWrapper()
        await wrapper.vm.$nextTick()
        expect(wrapper.vm.showSupporter).toBe(false)
      })

      it('returns true when hidesupporter is not set', async () => {
        delete mockMe.value.settings.hidesupporter
        const wrapper = createWrapper()
        await wrapper.vm.$nextTick()
        expect(wrapper.vm.showSupporter).toBe(true)
      })
    })

    describe('eligibleSupporter', () => {
      it('returns false for regular users', () => {
        const wrapper = createWrapper()
        expect(wrapper.vm.eligibleSupporter).toBe(false)
      })

      it('returns true for moderators', async () => {
        mockMe.value.systemrole = 'Moderator'
        const wrapper = createWrapper()
        await wrapper.vm.$nextTick()
        expect(wrapper.vm.eligibleSupporter).toBe(true)
      })

      it('returns true for supporters', async () => {
        mockMe.value.supporter = true
        const wrapper = createWrapper()
        await wrapper.vm.$nextTick()
        expect(wrapper.vm.eligibleSupporter).toBe(true)
      })

      it('returns false when me is null', async () => {
        mockMe.value = null
        const wrapper = createWrapper()
        await wrapper.vm.$nextTick()
        expect(wrapper.vm.eligibleSupporter).toBe(false)
      })
    })

    describe('useProfile', () => {
      it('returns true when useprofile setting is true', () => {
        const wrapper = createWrapper()
        expect(wrapper.vm.useProfile).toBe(true)
      })

      it('returns false when useprofile setting is false', async () => {
        mockMe.value.settings.useprofile = false
        const wrapper = createWrapper()
        await wrapper.vm.$nextTick()
        expect(wrapper.vm.useProfile).toBe(false)
      })

      it('returns true when useprofile not set', async () => {
        delete mockMe.value.settings.useprofile
        const wrapper = createWrapper()
        await wrapper.vm.$nextTick()
        expect(wrapper.vm.useProfile).toBe(true)
      })
    })

    describe('profileUrl', () => {
      it('returns profile path when available', () => {
        const wrapper = createWrapper()
        expect(wrapper.vm.profileUrl).toBe('/profile/123.jpg')
      })

      it('returns default image when useProfile is false', async () => {
        mockMe.value.settings.useprofile = false
        const wrapper = createWrapper()
        await wrapper.vm.$nextTick()
        expect(wrapper.vm.profileUrl).toBe('/defaultprofile.png')
      })

      it('returns default image when no profile', async () => {
        mockMe.value.profile = null
        const wrapper = createWrapper()
        await wrapper.vm.$nextTick()
        expect(wrapper.vm.profileUrl).toBe('/defaultprofile.png')
      })
    })

    describe('aboutMe', () => {
      it('returns about text when set', () => {
        const wrapper = createWrapper()
        expect(wrapper.vm.aboutMe).toBe('Hello, I am a test user!')
      })

      it('returns empty string when no aboutme', async () => {
        mockMe.value.aboutme = null
        const wrapper = createWrapper()
        await wrapper.vm.$nextTick()
        expect(wrapper.vm.aboutMe).toBe('')
      })
    })

    describe('canRotate', () => {
      it('returns true when profile.ours is true and useProfile is true', () => {
        const wrapper = createWrapper()
        expect(wrapper.vm.canRotate).toBe(true)
      })

      it('returns true when profile has externaluid', async () => {
        mockMe.value.profile.ours = false
        mockMe.value.profile.externaluid = 'ext123'
        const wrapper = createWrapper()
        await wrapper.vm.$nextTick()
        expect(wrapper.vm.canRotate).toBe(true)
      })

      it('returns false when useProfile is false', async () => {
        mockMe.value.settings.useprofile = false
        const wrapper = createWrapper()
        await wrapper.vm.$nextTick()
        expect(wrapper.vm.canRotate).toBe(false)
      })
    })
  })

  describe('methods', () => {
    describe('addAbout', () => {
      it('emits show-about-me-modal', () => {
        const wrapper = createWrapper()
        wrapper.vm.addAbout()
        expect(wrapper.emitted('show-about-me-modal')).toBeTruthy()
      })
    })

    describe('viewProfile', () => {
      it('emits show-profile-modal', () => {
        const wrapper = createWrapper()
        wrapper.vm.viewProfile()
        expect(wrapper.emitted('show-profile-modal')).toBeTruthy()
      })
    })

    describe('saveName', () => {
      it('calls authStore.saveAndGet with displayname', async () => {
        const wrapper = createWrapper()
        wrapper.vm.displayName = 'New Name'
        await wrapper.vm.saveName()
        expect(mockSaveAndGet).toHaveBeenCalledWith({ displayname: 'New Name' })
      })

      it('emits update event', async () => {
        const wrapper = createWrapper()
        await wrapper.vm.saveName()
        expect(wrapper.emitted('update')).toBeTruthy()
      })
    })

    describe('uploadProfile', () => {
      it('sets uploading to true', () => {
        const wrapper = createWrapper()
        wrapper.vm.uploadProfile()
        expect(wrapper.vm.uploading).toBe(true)
      })
    })

    describe('changeUseProfile', () => {
      it('calls authStore.saveAndGet with useprofile setting', async () => {
        const wrapper = createWrapper()
        await wrapper.vm.changeUseProfile(false)
        expect(mockSaveAndGet).toHaveBeenCalledWith({
          settings: expect.objectContaining({ useprofile: false }),
        })
      })

      it('emits update event', async () => {
        const wrapper = createWrapper()
        await wrapper.vm.changeUseProfile(true)
        expect(wrapper.emitted('update')).toBeTruthy()
      })
    })

    describe('toggleSupporter', () => {
      it('calls authStore.saveAndGet with hidesupporter setting', async () => {
        const wrapper = createWrapper()
        await wrapper.vm.toggleSupporter()
        expect(mockSaveAndGet).toHaveBeenCalledWith({
          settings: expect.objectContaining({ hidesupporter: true }),
        })
      })

      it('emits update event', async () => {
        const wrapper = createWrapper()
        await wrapper.vm.toggleSupporter()
        expect(wrapper.emitted('update')).toBeTruthy()
      })
    })

    describe('rotateLeft', () => {
      it('calls rotate with -90', async () => {
        const wrapper = createWrapper()
        await wrapper.vm.rotateLeft()
        expect(mockImagePost).toHaveBeenCalledWith({
          id: 1,
          rotate: 270, // (0 - 90 + 360) % 360
          bust: expect.any(Number),
          user: true,
        })
      })
    })

    describe('rotateRight', () => {
      it('calls rotate with 90', async () => {
        const wrapper = createWrapper()
        await wrapper.vm.rotateRight()
        expect(mockImagePost).toHaveBeenCalledWith({
          id: 1,
          rotate: 90,
          bust: expect.any(Number),
          user: true,
        })
      })
    })
  })

  describe('reactive state', () => {
    it('initializes uploading as false', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.uploading).toBe(false)
    })

    it('initializes cacheBust with timestamp', () => {
      const wrapper = createWrapper()
      expect(typeof wrapper.vm.cacheBust).toBe('number')
    })

    it('initializes currentAtts as empty array', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.currentAtts).toEqual([])
    })
  })

  describe('watch', () => {
    it('updates displayName when me changes', async () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.displayName).toBe('Test User')

      mockMe.value = { ...mockMe.value, displayname: 'Updated Name' }
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.displayName).toBe('Updated Name')
    })
  })

  describe('uploader visibility', () => {
    it('shows OurUploader when uploading is true', async () => {
      const wrapper = createWrapper()
      wrapper.vm.uploading = true
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.our-uploader').exists()).toBe(true)
    })

    it('hides Upload button when uploading', async () => {
      const wrapper = createWrapper()
      wrapper.vm.uploading = true
      await wrapper.vm.$nextTick()
      const buttons = wrapper.findAll('button')
      expect(buttons.some((b) => b.text().includes('Upload'))).toBe(false)
    })

    it('hides rotate buttons when uploading', async () => {
      const wrapper = createWrapper()
      wrapper.vm.uploading = true
      await wrapper.vm.$nextTick()
      expect(wrapper.findAll('.rotate-btn').length).toBe(0)
    })
  })
})
