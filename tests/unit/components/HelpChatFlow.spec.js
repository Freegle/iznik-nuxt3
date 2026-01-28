import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import HelpChatFlow from '~/components/HelpChatFlow.vue'
import { useAuthStore } from '~/stores/auth'

// Mock auth store
vi.mock('~/stores/auth', () => ({
  useAuthStore: vi.fn(() => ({
    user: null,
  })),
}))

describe('HelpChatFlow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.mockReturnValue({ user: null })
  })

  function createWrapper() {
    return mount(HelpChatFlow, {
      global: {
        stubs: {
          'v-icon': {
            template: '<i :class="icon" class="v-icon" />',
            props: ['icon'],
          },
          NuxtLink: {
            template:
              '<a :href="to" :data-to="to" class="nuxt-link"><slot /></a>',
            props: ['to'],
            inheritAttrs: true,
          },
          'nuxt-link': {
            template:
              '<a :href="to" :data-to="to" class="nuxt-link"><slot /></a>',
            props: ['to'],
            inheritAttrs: true,
          },
          GroupRememberSelect: {
            template:
              '<select class="group-select" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)"><option>Mock Group</option></select>',
            props: ['modelValue', 'remember'],
          },
          ChatButton: {
            template:
              '<button class="chat-button" :data-groupid="groupid">{{ title }}</button>',
            props: ['groupid', 'size', 'title', 'variant'],
          },
          NoticeMessage: {
            template:
              '<div class="notice-message" :class="variant"><slot /></div>',
            props: ['variant'],
          },
          SupportLink: {
            template: '<a class="support-link">Support</a>',
          },
          ExternalLink: {
            template: '<a :href="href" class="external-link"><slot /></a>',
            props: ['href'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    describe('initial state', () => {
      it('renders main help flow container', () => {
        const wrapper = createWrapper()
        expect(wrapper.find('.help-flow').exists()).toBe(true)
      })

      it('displays header on start', () => {
        const wrapper = createWrapper()
        expect(wrapper.find('.flow-header').exists()).toBe(true)
        expect(wrapper.find('.flow-header').text()).toBe('How can we help?')
      })

      it('renders flow content area', () => {
        const wrapper = createWrapper()
        expect(wrapper.find('.flow-content').exists()).toBe(true)
      })

      it('renders flow card', () => {
        const wrapper = createWrapper()
        expect(wrapper.find('.flow-card').exists()).toBe(true)
      })

      it('does not show breadcrumbs on start', () => {
        const wrapper = createWrapper()
        expect(wrapper.find('.flow-breadcrumb').exists()).toBe(false)
      })
    })

    describe('start options', () => {
      it('renders all main category options', () => {
        const wrapper = createWrapper()
        const options = wrapper.findAll('.flow-option')
        expect(options.length).toBe(5)
      })

      it('displays Posting items option', () => {
        const wrapper = createWrapper()
        expect(wrapper.text()).toContain('Posting items')
      })

      it('displays Replying to posts option', () => {
        const wrapper = createWrapper()
        expect(wrapper.text()).toContain('Replying to posts')
      })

      it('displays Emails & notifications option', () => {
        const wrapper = createWrapper()
        expect(wrapper.text()).toContain('Emails & notifications')
      })

      it('displays My account option', () => {
        const wrapper = createWrapper()
        expect(wrapper.text()).toContain('My account')
      })

      it('displays About Freegle option', () => {
        const wrapper = createWrapper()
        expect(wrapper.text()).toContain('About Freegle')
      })

      it('shows icons for each option', () => {
        const wrapper = createWrapper()
        const icons = wrapper.findAll('.option-icon')
        expect(icons.length).toBe(5)
      })

      it('shows chevrons for non-back options', () => {
        const wrapper = createWrapper()
        const chevrons = wrapper.findAll('.chevron')
        expect(chevrons.length).toBe(5)
      })
    })

    describe('contact section', () => {
      it('renders contact wrapper', () => {
        const wrapper = createWrapper()
        expect(wrapper.find('.contact-wrapper').exists()).toBe(true)
      })

      it('renders contact section', () => {
        const wrapper = createWrapper()
        expect(wrapper.find('.contact-section').exists()).toBe(true)
      })

      it('renders contact header button', () => {
        const wrapper = createWrapper()
        expect(wrapper.find('.contact-header').exists()).toBe(true)
      })

      it('displays Contact volunteers text', () => {
        const wrapper = createWrapper()
        expect(wrapper.find('.contact-header').text()).toContain(
          'Contact volunteers'
        )
      })

      it('shows chevron-down icon when collapsed', () => {
        const wrapper = createWrapper()
        const icon = wrapper.find('.expand-icon')
        expect(icon.classes()).toContain('chevron-down')
      })

      it('does not show contact options when collapsed', () => {
        const wrapper = createWrapper()
        expect(wrapper.find('.contact-options').exists()).toBe(false)
      })
    })
  })

  describe('navigation', () => {
    describe('breadcrumbs', () => {
      it('shows breadcrumbs after navigating to a category', async () => {
        const wrapper = createWrapper()
        await wrapper.findAll('.flow-option')[0].trigger('click')
        expect(wrapper.find('.flow-breadcrumb').exists()).toBe(true)
      })

      it('shows Start button in breadcrumbs', async () => {
        const wrapper = createWrapper()
        await wrapper.findAll('.flow-option')[0].trigger('click')
        const breadcrumb = wrapper.find('.flow-breadcrumb')
        expect(breadcrumb.text()).toContain('Start')
      })

      it('shows current category label in breadcrumbs', async () => {
        const wrapper = createWrapper()
        await wrapper.findAll('.flow-option')[0].trigger('click')
        const breadcrumb = wrapper.find('.flow-breadcrumb')
        expect(breadcrumb.text()).toContain('Posting items')
      })

      it('shows home icon in breadcrumbs', async () => {
        const wrapper = createWrapper()
        await wrapper.findAll('.flow-option')[0].trigger('click')
        const breadcrumb = wrapper.find('.flow-breadcrumb')
        expect(breadcrumb.find('.home').exists()).toBe(true)
      })

      it('shows chevron separator in breadcrumbs', async () => {
        const wrapper = createWrapper()
        await wrapper.findAll('.flow-option')[0].trigger('click')
        expect(wrapper.find('.breadcrumb-sep').exists()).toBe(true)
      })
    })

    describe('option selection', () => {
      it('navigates to Posting section when clicked', async () => {
        const wrapper = createWrapper()
        const postingOption = wrapper
          .findAll('.flow-option')
          .find((o) => o.text().includes('Posting items'))
        await postingOption.trigger('click')
        expect(wrapper.text()).toContain('What about posting?')
      })

      it('navigates to Replying section when clicked', async () => {
        const wrapper = createWrapper()
        const replyingOption = wrapper
          .findAll('.flow-option')
          .find((o) => o.text().includes('Replying to posts'))
        await replyingOption.trigger('click')
        expect(wrapper.text()).toContain('What about replying to posts?')
      })

      it('navigates to Emails section when clicked', async () => {
        const wrapper = createWrapper()
        const emailsOption = wrapper
          .findAll('.flow-option')
          .find((o) => o.text().includes('Emails'))
        await emailsOption.trigger('click')
        expect(wrapper.text()).toContain('What about emails?')
      })

      it('navigates to Account section when clicked', async () => {
        const wrapper = createWrapper()
        const accountOption = wrapper
          .findAll('.flow-option')
          .find((o) => o.text().includes('My account'))
        await accountOption.trigger('click')
        expect(wrapper.text()).toContain('What about your account?')
      })

      it('navigates to About section when clicked', async () => {
        const wrapper = createWrapper()
        const aboutOption = wrapper
          .findAll('.flow-option')
          .find((o) => o.text().includes('About Freegle'))
        await aboutOption.trigger('click')
        expect(wrapper.text()).toContain(
          'What would you like to know about Freegle?'
        )
      })

      it('hides header after navigating away from start', async () => {
        const wrapper = createWrapper()
        await wrapper.findAll('.flow-option')[0].trigger('click')
        expect(wrapper.find('.flow-header').exists()).toBe(false)
      })
    })

    describe('going back', () => {
      it('goes back to start when clicking Start in breadcrumbs', async () => {
        const wrapper = createWrapper()
        await wrapper.findAll('.flow-option')[0].trigger('click')
        const startButton = wrapper
          .findAll('.breadcrumb-btn')
          .find((b) => b.text().includes('Start'))
        await startButton.trigger('click')
        expect(wrapper.text()).toContain('How can we help?')
        expect(wrapper.find('.flow-breadcrumb').exists()).toBe(false)
      })

      it('clears history when going to start', async () => {
        const wrapper = createWrapper()
        // Navigate to posting then to a sub-option
        const postingOption = wrapper
          .findAll('.flow-option')
          .find((o) => o.text().includes('Posting items'))
        await postingOption.trigger('click')
        // Click Start
        const startButton = wrapper
          .findAll('.breadcrumb-btn')
          .find((b) => b.text().includes('Start'))
        await startButton.trigger('click')
        expect(wrapper.find('.flow-breadcrumb').exists()).toBe(false)
      })

      it('supports back option navigation', async () => {
        const wrapper = createWrapper()
        // Navigate to posting
        const postingOption = wrapper
          .findAll('.flow-option')
          .find((o) => o.text().includes('Posting items'))
        await postingOption.trigger('click')
        // Find Back option
        const backOption = wrapper
          .findAll('.flow-option')
          .find((o) => o.text().includes('Back'))
        expect(backOption.exists()).toBe(true)
        await backOption.trigger('click')
        // Should be back at start
        expect(wrapper.text()).toContain('How can we help?')
      })

      it('back options have different styling', async () => {
        const wrapper = createWrapper()
        await wrapper.findAll('.flow-option')[0].trigger('click')
        const backOption = wrapper.find('.flow-option--back')
        expect(backOption.exists()).toBe(true)
      })

      it('back options do not show chevron', async () => {
        const wrapper = createWrapper()
        await wrapper.findAll('.flow-option')[0].trigger('click')
        const backOption = wrapper.find('.flow-option--back')
        expect(backOption.find('.chevron').exists()).toBe(false)
      })
    })

    describe('breadcrumb navigation', () => {
      it('navigates to specific breadcrumb when clicked', async () => {
        const wrapper = createWrapper()
        // Navigate to posting
        const postingOption = wrapper
          .findAll('.flow-option')
          .find((o) => o.text().includes('Posting items'))
        await postingOption.trigger('click')
        // Navigate to sub-option that has further options (posting-choosing)
        const subOption = wrapper
          .findAll('.flow-option')
          .find((o) => o.text().includes('Choosing who gets it'))
        await subOption.trigger('click')
        // Now we should have two breadcrumb items (plus Start button = 3 buttons total)
        const breadcrumbItems = wrapper.findAll('.breadcrumb-item')
        expect(breadcrumbItems.length).toBe(2)
        // Clicking on index 2 (third button, "Choosing who gets it" label) navigates to 'posting'
        // because goBack(1) uses history[1].id = 'posting'
        const choosingBreadcrumb = wrapper.findAll('.breadcrumb-btn')[2]
        await choosingBreadcrumb.trigger('click')
        // Should show posting options (sub-options like Mark as TAKEN)
        expect(wrapper.text()).toContain('Mark item as TAKEN')
      })
    })
  })

  describe('contact section', () => {
    describe('toggle', () => {
      it('expands when contact header is clicked', async () => {
        const wrapper = createWrapper()
        await wrapper.find('.contact-header').trigger('click')
        expect(wrapper.find('.contact-options').exists()).toBe(true)
      })

      it('shows chevron-up icon when expanded', async () => {
        const wrapper = createWrapper()
        await wrapper.find('.contact-header').trigger('click')
        const icon = wrapper.find('.expand-icon')
        expect(icon.classes()).toContain('chevron-up')
      })

      it('collapses when contact header is clicked again', async () => {
        const wrapper = createWrapper()
        await wrapper.find('.contact-header').trigger('click')
        await wrapper.find('.contact-header').trigger('click')
        expect(wrapper.find('.contact-options').exists()).toBe(false)
      })

      it('resets contact mode when collapsing', async () => {
        const wrapper = createWrapper()
        await wrapper.find('.contact-header').trigger('click')
        // Select a mode
        const usageOption = wrapper
          .findAll('.contact-option')
          .find((o) => o.text().includes('Help using Freegle'))
        await usageOption.trigger('click')
        // Collapse
        await wrapper.find('.contact-header').trigger('click')
        // Expand again
        await wrapper.find('.contact-header').trigger('click')
        // Neither option should be active
        expect(wrapper.find('.contact-option.active').exists()).toBe(false)
      })
    })

    describe('mode selection', () => {
      it('shows usage help option', async () => {
        const wrapper = createWrapper()
        await wrapper.find('.contact-header').trigger('click')
        expect(wrapper.text()).toContain('Help using Freegle')
      })

      it('shows technical problem option', async () => {
        const wrapper = createWrapper()
        await wrapper.find('.contact-header').trigger('click')
        expect(wrapper.text()).toContain('A technical problem')
      })

      it('marks usage option as active when selected', async () => {
        const wrapper = createWrapper()
        await wrapper.find('.contact-header').trigger('click')
        const usageOption = wrapper
          .findAll('.contact-option')
          .find((o) => o.text().includes('Help using Freegle'))
        await usageOption.trigger('click')
        expect(usageOption.classes()).toContain('active')
      })

      it('marks technical option as active when selected', async () => {
        const wrapper = createWrapper()
        await wrapper.find('.contact-header').trigger('click')
        const technicalOption = wrapper
          .findAll('.contact-option')
          .find((o) => o.text().includes('A technical problem'))
        await technicalOption.trigger('click')
        expect(technicalOption.classes()).toContain('active')
      })

      it('shows only one active mode at a time', async () => {
        const wrapper = createWrapper()
        await wrapper.find('.contact-header').trigger('click')
        const usageOption = wrapper
          .findAll('.contact-option')
          .find((o) => o.text().includes('Help using Freegle'))
        const technicalOption = wrapper
          .findAll('.contact-option')
          .find((o) => o.text().includes('A technical problem'))
        await usageOption.trigger('click')
        await technicalOption.trigger('click')
        expect(wrapper.findAll('.contact-option.active').length).toBe(1)
      })
    })

    describe('usage help mode', () => {
      beforeEach(() => {
        useAuthStore.mockReturnValue({ user: null })
      })

      it('shows usage help content when usage mode selected', async () => {
        const wrapper = createWrapper()
        await wrapper.find('.contact-header').trigger('click')
        const usageOption = wrapper
          .findAll('.contact-option')
          .find((o) => o.text().includes('Help using Freegle'))
        await usageOption.trigger('click')
        expect(wrapper.text()).toContain(
          'Your local volunteer team are happy to help'
        )
      })

      it('shows login notice when not logged in', async () => {
        const wrapper = createWrapper()
        await wrapper.find('.contact-header').trigger('click')
        const usageOption = wrapper
          .findAll('.contact-option')
          .find((o) => o.text().includes('Help using Freegle'))
        await usageOption.trigger('click')
        expect(wrapper.find('.notice-message').exists()).toBe(true)
        expect(wrapper.text()).toContain('Please log in to contact')
      })

      it('shows GroupRememberSelect and ChatButton when logged in', async () => {
        useAuthStore.mockReturnValue({ user: { id: 123 } })
        const wrapper = createWrapper()
        await wrapper.find('.contact-header').trigger('click')
        const usageOption = wrapper
          .findAll('.contact-option')
          .find((o) => o.text().includes('Help using Freegle'))
        await usageOption.trigger('click')
        expect(wrapper.find('.group-select').exists()).toBe(true)
        expect(wrapper.find('.chat-button').exists()).toBe(true)
      })

      it('ChatButton has correct title', async () => {
        useAuthStore.mockReturnValue({ user: { id: 123 } })
        const wrapper = createWrapper()
        await wrapper.find('.contact-header').trigger('click')
        const usageOption = wrapper
          .findAll('.contact-option')
          .find((o) => o.text().includes('Help using Freegle'))
        await usageOption.trigger('click')
        expect(wrapper.find('.chat-button').text()).toContain(
          'Contact community volunteers'
        )
      })
    })

    describe('technical support mode', () => {
      it('shows technical support content when selected', async () => {
        const wrapper = createWrapper()
        await wrapper.find('.contact-header').trigger('click')
        const technicalOption = wrapper
          .findAll('.contact-option')
          .find((o) => o.text().includes('A technical problem'))
        await technicalOption.trigger('click')
        expect(wrapper.text()).toContain(
          'For technical problems like bugs or errors'
        )
      })

      it('shows SupportLink component', async () => {
        const wrapper = createWrapper()
        await wrapper.find('.contact-header').trigger('click')
        const technicalOption = wrapper
          .findAll('.contact-option')
          .find((o) => o.text().includes('A technical problem'))
        await technicalOption.trigger('click')
        expect(wrapper.find('.support-link').exists()).toBe(true)
      })

      it('shows support note about error messages', async () => {
        const wrapper = createWrapper()
        await wrapper.find('.contact-header').trigger('click')
        const technicalOption = wrapper
          .findAll('.contact-option')
          .find((o) => o.text().includes('A technical problem'))
        await technicalOption.trigger('click')
        expect(wrapper.text()).toContain(
          'Please include details of what you were trying to do'
        )
      })
    })
  })

  describe('help tree navigation', () => {
    describe('posting path', () => {
      it('shows Mark as TAKEN option', async () => {
        const wrapper = createWrapper()
        const postingOption = wrapper
          .findAll('.flow-option')
          .find((o) => o.text().includes('Posting items'))
        await postingOption.trigger('click')
        expect(wrapper.text()).toContain('Mark item as TAKEN/RECEIVED')
      })

      it('shows Repost option', async () => {
        const wrapper = createWrapper()
        const postingOption = wrapper
          .findAll('.flow-option')
          .find((o) => o.text().includes('Posting items'))
        await postingOption.trigger('click')
        expect(wrapper.text()).toContain('Repost an item')
      })

      it('shows Edit post option', async () => {
        const wrapper = createWrapper()
        const postingOption = wrapper
          .findAll('.flow-option')
          .find((o) => o.text().includes('Posting items'))
        await postingOption.trigger('click')
        expect(wrapper.text()).toContain('Edit my post')
      })

      it('shows Choosing recipient option', async () => {
        const wrapper = createWrapper()
        const postingOption = wrapper
          .findAll('.flow-option')
          .find((o) => o.text().includes('Posting items'))
        await postingOption.trigger('click')
        expect(wrapper.text()).toContain('Choosing who gets it')
      })

      it('shows Selling items option', async () => {
        const wrapper = createWrapper()
        const postingOption = wrapper
          .findAll('.flow-option')
          .find((o) => o.text().includes('Posting items'))
        await postingOption.trigger('click')
        expect(wrapper.text()).toContain('Can I sell freecycled items?')
      })

      it('navigates to posting-taken and shows link to My Posts', async () => {
        const wrapper = createWrapper()
        const postingOption = wrapper
          .findAll('.flow-option')
          .find((o) => o.text().includes('Posting items'))
        await postingOption.trigger('click')
        const takenOption = wrapper
          .findAll('.flow-option')
          .find((o) => o.text().includes('Mark item as TAKEN'))
        await takenOption.trigger('click')
        expect(wrapper.find('.link-btn').attributes('data-to')).toBe('/myposts')
        expect(wrapper.text()).toContain('Go to My Posts')
      })

      it('navigates to posting-choosing and shows navigation options', async () => {
        const wrapper = createWrapper()
        const postingOption = wrapper
          .findAll('.flow-option')
          .find((o) => o.text().includes('Posting items'))
        await postingOption.trigger('click')
        const choosingOption = wrapper
          .findAll('.flow-option')
          .find((o) => o.text().includes('Choosing who gets it'))
        await choosingOption.trigger('click')
        expect(wrapper.text()).toContain('More posting help')
        expect(wrapper.text()).toContain('Start over')
      })
    })

    describe('replying path', () => {
      it('shows How to reply option', async () => {
        const wrapper = createWrapper()
        const replyingOption = wrapper
          .findAll('.flow-option')
          .find((o) => o.text().includes('Replying to posts'))
        await replyingOption.trigger('click')
        expect(wrapper.text()).toContain('How to reply to a post')
      })

      it('shows Post withdrawn option', async () => {
        const wrapper = createWrapper()
        const replyingOption = wrapper
          .findAll('.flow-option')
          .find((o) => o.text().includes('Replying to posts'))
        await replyingOption.trigger('click')
        expect(wrapper.text()).toContain('Post was withdrawn')
      })

      it('shows No response option', async () => {
        const wrapper = createWrapper()
        const replyingOption = wrapper
          .findAll('.flow-option')
          .find((o) => o.text().includes('Replying to posts'))
        await replyingOption.trigger('click')
        expect(wrapper.text()).toContain("Poster hasn't replied")
      })

      it('navigates to replying-no-response and shows link to Chats', async () => {
        const wrapper = createWrapper()
        const replyingOption = wrapper
          .findAll('.flow-option')
          .find((o) => o.text().includes('Replying to posts'))
        await replyingOption.trigger('click')
        const noResponseOption = wrapper
          .findAll('.flow-option')
          .find((o) => o.text().includes("Poster hasn't replied"))
        await noResponseOption.trigger('click')
        expect(wrapper.find('.link-btn').attributes('data-to')).toBe('/chats')
        expect(wrapper.text()).toContain('Go to Chats')
      })
    })

    describe('emails path', () => {
      it('shows Get fewer emails option', async () => {
        const wrapper = createWrapper()
        const emailsOption = wrapper
          .findAll('.flow-option')
          .find((o) => o.text().includes('Emails'))
        await emailsOption.trigger('click')
        expect(wrapper.text()).toContain('Get fewer emails')
      })

      it('shows Unsubscribe option', async () => {
        const wrapper = createWrapper()
        const emailsOption = wrapper
          .findAll('.flow-option')
          .find((o) => o.text().includes('Emails'))
        await emailsOption.trigger('click')
        expect(wrapper.text()).toContain('Unsubscribe completely')
      })

      it('shows Change email option', async () => {
        const wrapper = createWrapper()
        const emailsOption = wrapper
          .findAll('.flow-option')
          .find((o) => o.text().includes('Emails'))
        await emailsOption.trigger('click')
        expect(wrapper.text()).toContain('Change email address')
      })

      it('navigates to emails-unsubscribe and shows link to unsubscribe page', async () => {
        const wrapper = createWrapper()
        const emailsOption = wrapper
          .findAll('.flow-option')
          .find((o) => o.text().includes('Emails'))
        await emailsOption.trigger('click')
        const unsubOption = wrapper
          .findAll('.flow-option')
          .find((o) => o.text().includes('Unsubscribe completely'))
        await unsubOption.trigger('click')
        expect(wrapper.find('.link-btn').attributes('data-to')).toBe(
          '/unsubscribe'
        )
        expect(wrapper.text()).toContain('Sorry to see you go!')
      })
    })

    describe('account path', () => {
      it('shows Data & privacy option', async () => {
        const wrapper = createWrapper()
        const accountOption = wrapper
          .findAll('.flow-option')
          .find((o) => o.text().includes('My account'))
        await accountOption.trigger('click')
        expect(wrapper.text()).toContain('My data & privacy')
      })

      it('shows Account settings option', async () => {
        const wrapper = createWrapper()
        const accountOption = wrapper
          .findAll('.flow-option')
          .find((o) => o.text().includes('My account'))
        await accountOption.trigger('click')
        expect(wrapper.text()).toContain('Account settings')
      })

      it('shows Mobile app option', async () => {
        const wrapper = createWrapper()
        const accountOption = wrapper
          .findAll('.flow-option')
          .find((o) => o.text().includes('My account'))
        await accountOption.trigger('click')
        expect(wrapper.text()).toContain('Mobile app')
      })

      it('navigates to account-app and shows app download links', async () => {
        const wrapper = createWrapper()
        const accountOption = wrapper
          .findAll('.flow-option')
          .find((o) => o.text().includes('My account'))
        await accountOption.trigger('click')
        const appOption = wrapper
          .findAll('.flow-option')
          .find((o) => o.text().includes('Mobile app'))
        await appOption.trigger('click')
        expect(wrapper.find('.flow-app-links').exists()).toBe(true)
        expect(wrapper.findAll('.external-link').length).toBe(2)
      })

      it('shows Google Play link', async () => {
        const wrapper = createWrapper()
        const accountOption = wrapper
          .findAll('.flow-option')
          .find((o) => o.text().includes('My account'))
        await accountOption.trigger('click')
        const appOption = wrapper
          .findAll('.flow-option')
          .find((o) => o.text().includes('Mobile app'))
        await appOption.trigger('click')
        const playLink = wrapper
          .findAll('.external-link')
          .find((l) => l.attributes('href').includes('play.google.com'))
        expect(playLink.exists()).toBe(true)
      })

      it('shows App Store link', async () => {
        const wrapper = createWrapper()
        const accountOption = wrapper
          .findAll('.flow-option')
          .find((o) => o.text().includes('My account'))
        await accountOption.trigger('click')
        const appOption = wrapper
          .findAll('.flow-option')
          .find((o) => o.text().includes('Mobile app'))
        await appOption.trigger('click')
        const appStoreLink = wrapper
          .findAll('.external-link')
          .find((l) => l.attributes('href').includes('itunes.apple.com'))
        expect(appStoreLink.exists()).toBe(true)
      })

      it('shows app availability note', async () => {
        const wrapper = createWrapper()
        const accountOption = wrapper
          .findAll('.flow-option')
          .find((o) => o.text().includes('My account'))
        await accountOption.trigger('click')
        const appOption = wrapper
          .findAll('.flow-option')
          .find((o) => o.text().includes('Mobile app'))
        await appOption.trigger('click')
        expect(wrapper.text()).toContain('Available in UK app stores')
      })
    })

    describe('about path', () => {
      it('shows Rules & guidelines option', async () => {
        const wrapper = createWrapper()
        const aboutOption = wrapper
          .findAll('.flow-option')
          .find((o) => o.text().includes('About Freegle'))
        await aboutOption.trigger('click')
        expect(wrapper.text()).toContain('Rules & guidelines')
      })

      it('shows TrashNothing & LoveJunk option', async () => {
        const wrapper = createWrapper()
        const aboutOption = wrapper
          .findAll('.flow-option')
          .find((o) => o.text().includes('About Freegle'))
        await aboutOption.trigger('click')
        expect(wrapper.text()).toContain('TrashNothing & LoveJunk')
      })

      it('shows How Freegle is run option', async () => {
        const wrapper = createWrapper()
        const aboutOption = wrapper
          .findAll('.flow-option')
          .find((o) => o.text().includes('About Freegle'))
        await aboutOption.trigger('click')
        expect(wrapper.text()).toContain('How Freegle is run')
      })

      it('shows Volunteering option', async () => {
        const wrapper = createWrapper()
        const aboutOption = wrapper
          .findAll('.flow-option')
          .find((o) => o.text().includes('About Freegle'))
        await aboutOption.trigger('click')
        expect(wrapper.text()).toContain('Volunteering')
      })

      it('shows Donate option', async () => {
        const wrapper = createWrapper()
        const aboutOption = wrapper
          .findAll('.flow-option')
          .find((o) => o.text().includes('About Freegle'))
        await aboutOption.trigger('click')
        expect(wrapper.text()).toContain('Donate')
      })

      it('navigates to about-integrations and shows partner info', async () => {
        const wrapper = createWrapper()
        const aboutOption = wrapper
          .findAll('.flow-option')
          .find((o) => o.text().includes('About Freegle'))
        await aboutOption.trigger('click')
        const integrationsOption = wrapper
          .findAll('.flow-option')
          .find((o) => o.text().includes('TrashNothing'))
        await integrationsOption.trigger('click')
        expect(wrapper.text()).toContain(
          'TrashNothing is another reuse platform'
        )
        expect(wrapper.text()).toContain("we're friends with them")
      })

      it('navigates to about-donate and shows link to donate page', async () => {
        const wrapper = createWrapper()
        const aboutOption = wrapper
          .findAll('.flow-option')
          .find((o) => o.text().includes('About Freegle'))
        await aboutOption.trigger('click')
        const donateOption = wrapper
          .findAll('.flow-option')
          .find((o) => o.text().includes('Donate'))
        await donateOption.trigger('click')
        expect(wrapper.find('.link-btn').attributes('data-to')).toBe('/donate')
        expect(wrapper.text()).toContain('Donate to Freegle')
      })
    })

    describe('start over option', () => {
      it('returns to start when Start over option is clicked', async () => {
        const wrapper = createWrapper()
        // Navigate to posting-choosing which has Start over option
        const postingOption = wrapper
          .findAll('.flow-option')
          .find((o) => o.text().includes('Posting items'))
        await postingOption.trigger('click')
        const choosingOption = wrapper
          .findAll('.flow-option')
          .find((o) => o.text().includes('Choosing who gets it'))
        await choosingOption.trigger('click')
        // Click Start over
        const startOverOption = wrapper
          .findAll('.flow-option')
          .find((o) => o.text().includes('Start over'))
        await startOverOption.trigger('click')
        expect(wrapper.text()).toContain('How can we help?')
        expect(wrapper.find('.flow-breadcrumb').exists()).toBe(false)
      })
    })
  })

  describe('link nodes', () => {
    it('renders link button for link nodes', async () => {
      const wrapper = createWrapper()
      const postingOption = wrapper
        .findAll('.flow-option')
        .find((o) => o.text().includes('Posting items'))
      await postingOption.trigger('click')
      const takenOption = wrapper
        .findAll('.flow-option')
        .find((o) => o.text().includes('Mark item as TAKEN'))
      await takenOption.trigger('click')
      expect(wrapper.find('.flow-link').exists()).toBe(true)
      expect(wrapper.find('.link-btn').exists()).toBe(true)
    })

    it('link has correct destination', async () => {
      const wrapper = createWrapper()
      const postingOption = wrapper
        .findAll('.flow-option')
        .find((o) => o.text().includes('Posting items'))
      await postingOption.trigger('click')
      const takenOption = wrapper
        .findAll('.flow-option')
        .find((o) => o.text().includes('Mark item as TAKEN'))
      await takenOption.trigger('click')
      expect(wrapper.find('.link-btn').attributes('data-to')).toBe('/myposts')
    })

    it('link shows icon when specified', async () => {
      const wrapper = createWrapper()
      const postingOption = wrapper
        .findAll('.flow-option')
        .find((o) => o.text().includes('Posting items'))
      await postingOption.trigger('click')
      const takenOption = wrapper
        .findAll('.flow-option')
        .find((o) => o.text().includes('Mark item as TAKEN'))
      await takenOption.trigger('click')
      expect(wrapper.find('.link-btn .v-icon').exists()).toBe(true)
    })
  })

  describe('text content nodes', () => {
    it('displays flow text for content nodes', async () => {
      const wrapper = createWrapper()
      const postingOption = wrapper
        .findAll('.flow-option')
        .find((o) => o.text().includes('Posting items'))
      await postingOption.trigger('click')
      expect(wrapper.find('.flow-text').exists()).toBe(true)
      expect(wrapper.find('.flow-text').text()).toBe('What about posting?')
    })

    it('displays detailed answer text', async () => {
      const wrapper = createWrapper()
      const postingOption = wrapper
        .findAll('.flow-option')
        .find((o) => o.text().includes('Posting items'))
      await postingOption.trigger('click')
      const takenOption = wrapper
        .findAll('.flow-option')
        .find((o) => o.text().includes('Mark item as TAKEN'))
      await takenOption.trigger('click')
      expect(wrapper.find('.flow-text').text()).toContain('Mark as TAKEN')
    })
  })
})
