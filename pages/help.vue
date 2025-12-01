<template>
  <client-only>
    <b-row class="m-0">
      <b-col cols="0" md="3">
        <VisibleWhen :at="['lg', 'xl', 'xxl']">
          <SidebarLeft />
        </VisibleWhen>
      </b-col>
      <b-col cols="12" md="6" class="help-page">
        <RateAppModal
          v-if="showRateAppModal"
          ref="rateAppModal"
          @hidden="showRateAppModal = false"
        />

        <!-- Chat-style help flow -->
        <div class="help-header">
          <h1>How can we help?</h1>
          <p v-if="isApp" class="app-review">
            <a href="#" @click.stop.prevent="showRateMe">
              <v-icon icon="star" class="me-1" />Rate this app
            </a>
          </p>
        </div>

        <HelpChatFlow
          class="mb-4"
          @contact-volunteers="scrollToContact"
          @show-faq="showAllFaqs = true"
        />

        <!-- Search FAQs -->
        <div class="faq-section">
          <div class="faq-header" @click="showAllFaqs = !showAllFaqs">
            <h2>
              <v-icon icon="question-circle" class="me-2" />Frequently Asked
              Questions
            </h2>
            <v-icon :icon="showAllFaqs ? 'chevron-up' : 'chevron-down'" />
          </div>

          <Transition name="faq-slide">
            <div v-if="showAllFaqs" class="faq-content">
              <b-form-input
                v-model="question"
                placeholder="Search FAQs..."
                class="faq-search mb-3"
              />
              <NoticeMessage v-if="hasNoResults" variant="info" class="mb-3">
                No matching FAQ found. Try the chat above or contact volunteers
                below.
              </NoticeMessage>
              <div ref="faq">
                <HelpQuestion id="unsubscribe" :matches="matches">
                  <template #title>How do I leave or unsubscribe?</template>
                  <template #default>
                    <p>
                      If you'd like to leave Freegle, then go
                      <nuxt-link no-prefetch to="/unsubscribe">here</nuxt-link>.
                    </p>
                    <p>
                      But if you're just getting more emails than you want, you
                      can reduce the number and frequency of emails from
                      <nuxt-link no-prefetch to="/settings">Settings</nuxt-link
                      >.
                    </p>
                  </template>
                </HelpQuestion>
                <HelpQuestion id="toomanyemails" :matches="matches">
                  <template #title>How do I get fewer emails?</template>
                  <p>
                    <!-- eslint-disable-next-line-->
              If you go to
                    <nuxt-link no-prefetch to="/settings">Settings</nuxt-link>
                    then you can change how many mails you get in your
                    <em>Mail Settings</em>.
                  </p>
                </HelpQuestion>
                <HelpQuestion id="taken" :matches="matches">
                  <template #title
                    >My OFFER has been TAKEN - what do I do?</template
                  >
                  <div>
                    <p>
                      If someone has collected your OFFER, then make sure you're
                      logged in (click on <em>Sign in</em> on the top left if
                      you need to), then go to
                      <nuxt-link no-prefetch to="/myposts">My Posts</nuxt-link>,
                      find your post, and click this button:
                    </p>
                    <div class="mt-2 mb-2">
                      <b-button variant="primary"> Mark as TAKEN </b-button>
                    </div>

                    <p>
                      Similarly, if you have received your WANTED, go to
                      <nuxt-link no-prefetch to="/myposts">My Posts</nuxt-link>,
                      find your post, and click this:
                    </p>
                    <div class="mb-2">
                      <b-button variant="primary"> Mark as RECEIVED </b-button>
                    </div>

                    <p>
                      If you have multiple posts showing, you may need to click
                      the post to expand it before the buttons appear.
                    </p>
                  </div>
                </HelpQuestion>
                <HelpQuestion id="repost" :matches="matches">
                  <template #title>How do I repost an item?</template>
                  <div>
                    <p>
                      If you've not had any replies, this happens automatically.
                      If you go to
                      <nuxt-link no-prefetch to="/myposts">My Posts</nuxt-link>,
                      and click on the post, you can see the time until the
                      auto-repost is due on there, like this:
                    </p>
                    <p>
                      <span class="success"> Auto-repost due in 2 days</span>
                    </p>
                    <p>
                      If you have had replies, you need to use the
                      <em>Repost</em> button in the same place.
                    </p>
                  </div>
                </HelpQuestion>
                <HelpQuestion id="changeemail" :matches="matches">
                  <template #title>How do I change my email address?</template>
                  <div>
                    <p>
                      <!-- eslint-disable-next-line-->
                You can do this from your
                      <nuxt-link no-prefetch to="/settings">Settings</nuxt-link
                      >, in the <em>Personal Information</em> section.
                    </p>
                  </div>
                </HelpQuestion>
                <HelpQuestion id="gdpr" :matches="matches">
                  <template #title>What data do you store about me?</template>
                  <p>
                    If you're really into privacy or GDPR, you can read our
                    <nuxt-link no-prefetch to="/privacy"
                      >privacy policy</nuxt-link
                    >. You can see what data we store about you, and download
                    it, <nuxt-link no-prefetch to="/mydata">here</nuxt-link>.
                  </p>
                </HelpQuestion>
                <HelpQuestion id="app" :matches="matches">
                  <template #title>Do you have a mobile app?</template>
                  <div>
                    <div v-if="isApp">
                      Yes! You are using the {{ appType }} app, version
                      {{ mobileVersion }}.
                    </div>
                    <div v-else>
                      <p>
                        We do! Freegling is easy on mobiles and tablets, and you
                        get notifications of replies so you don't have to rely
                        on email. Download using these links or search for
                        Freegle in your app store - it's free!
                      </p>
                      <div class="d-flex justify-content-between">
                        <a
                          href="https://play.google.com/store/apps/details?id=org.ilovefreegle.direct"
                          class="mt-2"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <img
                            alt="Freegle Android app on Google Play"
                            title="Freegle Android app on Google Play"
                            class="img-responsive"
                            src="/en-play-badge.png"
                          />
                        </a>
                        <a
                          href="https://itunes.apple.com/gb/app/freegle/id970045029?ls=1&amp;mt=8"
                          class="mt-2"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <img
                            alt="Freegle app for iPhone, iPad, and iPod touch"
                            title="Freegle app for iPhone, iPad, and iPod touch"
                            class="img-responsive"
                            src="/app-store-black-sm.png"
                          />
                        </a>
                      </div>
                      <p class="mt-2">
                        The app is only available in the UK app stores. We
                        support Android 5.1/iOS 13 or later.
                      </p>
                    </div>
                  </div>
                </HelpQuestion>
                <HelpQuestion id="selling" :matches="matches">
                  <template #title
                    >Can I sell something given on Freegle?</template
                  >
                  <div>
                    <p>
                      Reselling also keeps stuff out of landfill; but please
                      don't sell items you got from Freegle without the
                      agreement of the person who gave them to you.
                    </p>
                  </div>
                </HelpQuestion>
                <HelpQuestion id="howdoichoose" :matches="matches">
                  <template #title
                    >How do I choose if several people are interested?
                  </template>
                  <div>
                    <p>
                      Unless you are in a hurry, it is better leave it a while
                      to see who replies before choosing. Some people use
                      first-come-first-served, but you don't have to.
                    </p>
                    <p>
                      You can see in someone's profile how close they are, how
                      many thumbs up/down they have from other freeglers.
                    </p>
                    <p>It's up to you - deciding is all part of the fun!</p>
                  </div>
                </HelpQuestion>
                <HelpQuestion id="rules" :matches="matches">
                  <template #title>What are your rules?</template>
                  <template #default>
                    <TermsOfUse />
                  </template>
                </HelpQuestion>
                <HelpQuestion id="integrations" :matches="matches">
                  <template #title>
                    How do TrashNothing and LoveJunk relate to Freegle?
                  </template>
                  <div>
                    <p>
                      <ExternalLink href="https://trashnothing.com">
                        TrashNothing
                      </ExternalLink>
                      is another platform for reuse. We're friends with them.
                      It's very much like Freegle, but it has a different
                      interface.
                    </p>
                    <p>
                      We've done a nice integration with them, so that when you
                      post on Freegle most posts get shown on TrashNothing and
                      vice versa, and things like thumbs up/down work too.
                      You'll get replies from TrashNothing members, though you
                      might not notice. So far as you're concerned, they're just
                      other freeglers.
                    </p>
                    <p>
                      <ExternalLink href="https://lovejunk.com">
                        LoveJunk
                      </ExternalLink>
                      is another reuse platform. Mostly it's for paid disposal
                      of things you don't need any more - similar to a council
                      bulky waste collection.
                    </p>
                    <p>
                      LoveJunk pays Freegle a bit each month for Freegle posts
                      to get shown on there, so you might get replies from
                      LoveJunk reusers. Again, you might not notice that they
                      are from LoveJunk - just treat them like you would do any
                      other freeglers.
                    </p>
                  </div>
                </HelpQuestion>
                <HelpQuestion id="about" :matches="matches">
                  <template #title> How is Freegle run and funded? </template>
                  <div>
                    <p>
                      You can read about who we are, how we're funded, and our
                      legal structure
                      <nuxt-link no-prefetch to="/about">here</nuxt-link>.
                    </p>
                  </div>
                </HelpQuestion>
                <hr class="mt-4" />
                <h2>Can I help Freegle?</h2>
                <HelpQuestion id="canihelp" :matches="matches">
                  <template #title>Can I volunteer?</template>
                  <div>
                    <p>
                      Yes! Freegle is run by volunteers. The first stage is to
                      become a Freegle Supporter, by donating time or funds
                      (whichever you're able).
                    </p>
                    <b-button
                      variant="primary"
                      class="mb-2"
                      @click="supporterInfo"
                    >
                      Find out more
                    </b-button>
                    <SupporterInfoModal
                      v-if="showInfoModal"
                      ref="supporterInfoModal"
                      @hidden="showInfoModal = false"
                    />
                    <p>
                      If you'd like to spread the word you can download a poster
                      or ask for "business cards" to hand out:
                    </p>
                    <b-button to="/promote" variant="primary" class="mb-2">
                      Find out more
                    </b-button>
                    <p>
                      If you would like to help run one of the local
                      communities, which is a good place to start, please use
                      the
                      <em>Contact</em> button below.
                    </p>
                    <p>
                      You can also volunteer nationally. We really need people
                      in these areas:
                    </p>
                    <ul>
                      <li>
                        Publicity: if you can help locally or nationally,
                        especially with councils, we'd love to hear from you.
                      </li>
                      <li>
                        Fundraising: we run on volunteers and donations, and
                        just about get by, but we could do so much more with
                        more.
                      </li>
                      <li>
                        Graphics: we need people who can produce striking
                        images, posters, etc.
                      </li>
                      <li>
                        User Experience (UX): if you work in this area we could
                        use your help.
                      </li>
                      <li>
                        IT geeks who know some of these: VueJS/Bootstrap
                        4/CSS/PHP/Percona/nginx - find us on
                        <a
                          target="_blank"
                          href="https://github.com/Freegle"
                          rel="noopener noreferrer"
                          >GitHub</a
                        >.
                      </li>
                    </ul>
                    <p>
                      <!-- eslint-disable-next-line -->
                You can reach us at
                      <ExternalLink href="mailto:volunteers@ilovefreegle.org"
                        >volunteers@ilovefreegle.org</ExternalLink
                      >.
                    </p>
                    <p>
                      Or if you'd like to donate to our charity, you can do that
                      <nuxt-link no-prefetch to="/donate"> here </nuxt-link> or
                      here:
                    </p>
                    <p>
                      <DonationButton :direct-donation="true" />
                    </p>
                  </div>
                </HelpQuestion>
                <HelpQuestion id="donate" :matches="matches">
                  <template #title>How do I donate?</template>
                  <div>
                    <p>
                      If you're able to donate to keep Freegle running, you can
                      do that here:
                    </p>
                    <DonationButton :direct-donation="true" class="mb-1" />
                    <p>Monthly donations are particularly welcome.</p>
                    <p>
                      If you don't use PayPal, there are other ways to donate
                      <nuxt-link no-prefetch to="/donate">here</nuxt-link>.
                    </p>
                    <p>
                      We can get even more from your donation if you're able to
                      complete a gift aid declaration
                      <nuxt-link no-prefetch to="/giftaid">here</nuxt-link>.
                    </p>
                  </div>
                </HelpQuestion>
              </div>
            </div>
          </Transition>
        </div>

        <!-- Contact section -->
        <div ref="contactSection" class="contact-section">
          <h2>Still need help?</h2>
          <p class="contact-intro">
            Contact your local volunteer team - they're happy to help!
          </p>

          <div v-if="loggedIn" class="contact-card">
            <GroupRememberSelect
              v-model="contactGroupId"
              remember="contactmods"
              class="mb-3"
            />
            <ChatButton
              :groupid="contactGroupId"
              size="md"
              title="Contact community volunteers"
              variant="primary"
              @click="autoCopyDeviceInfo"
            />
            <div v-if="isApp" class="app-info mt-3">
              <small class="text-muted">
                App v{{ mobileVersion }}
                <span v-if="deviceuserinfo"> · {{ deviceuserinfo }}</span>
              </small>
              <b-button
                variant="link"
                size="sm"
                class="p-0 ms-2 text-muted"
                @click="copydeviceuserinfo"
              >
                <v-icon icon="clipboard" class="me-1" />{{
                  deviceuserinfocopied
                }}
              </b-button>
            </div>
          </div>

          <NoticeMessage v-else variant="info" class="mb-3">
            Please log in to contact your community volunteers.
          </NoticeMessage>

          <!-- Other contacts collapsed -->
          <details class="other-contacts">
            <summary>Other ways to get help</summary>
            <div class="contacts-list">
              <div class="contact-item">
                <strong>Technical support:</strong>
                <SupportLink />
              </div>
              <div class="contact-item">
                <strong>General enquiries:</strong>
                <SupportLink
                  email="info@ilovefreegle.org"
                  text="info@ilovefreegle.org"
                />
              </div>
              <div class="contact-item">
                <strong>Media enquiries:</strong>
                <SupportLink
                  email="media@ilovefreegle.org"
                  text="media@ilovefreegle.org"
                />
              </div>
            </div>
          </details>

          <div v-if="isApp" class="debug-section">
            <b-button
              variant="link"
              class="text-muted p-0"
              @click="showDebugLogs = true"
            >
              <v-icon icon="bug" class="me-1" />View Debug Logs
            </b-button>
            <DebugLogsModal
              v-if="showDebugLogs"
              @hidden="showDebugLogs = false"
            />
          </div>

          <p class="version-info">Site version: {{ version }}</p>
        </div>
      </b-col>
      <b-col cols="0" md="3" />
    </b-row>
  </client-only>
</template>
<script setup>
import { useRoute } from 'vue-router'
import { Searcher } from 'fast-fuzzy'
import dayjs from 'dayjs'
import { defineAsyncComponent } from 'vue'
import ExternalLink from '~/components/ExternalLink'
import HelpQuestion from '~/components/HelpQuestion'
import { buildHead } from '~/composables/useBuildHead'
import VisibleWhen from '~/components/VisibleWhen'
import TermsOfUse from '~/components/TermsOfUse'
import DonationButton from '~/components/DonationButton'
import GroupRememberSelect from '~/components/GroupRememberSelect'
import ChatButton from '~/components/ChatButton'
import NoticeMessage from '~/components/NoticeMessage'
import SupportLink from '~/components/SupportLink'
import HelpChatFlow from '~/components/HelpChatFlow.vue'
import { ref, computed, nextTick, watch } from '#imports'
import { useAuthStore } from '~/stores/auth'
import { useMobileStore } from '@/stores/mobile'
import { useDebugStore } from '~/stores/debug'

// Async components
const SupporterInfoModal = defineAsyncComponent(() =>
  import('~/components/SupporterInfoModal.vue')
)
const SidebarLeft = defineAsyncComponent(() =>
  import('~/components/SidebarLeft')
)
const DebugLogsModal = defineAsyncComponent(() =>
  import('~/components/DebugLogsModal.vue')
)

// Setup
const route = useRoute()
const runtimeConfig = useRuntimeConfig()
const authStore = useAuthStore()
const mobileStore = useMobileStore()
const debugStore = useDebugStore()

// State
const question = ref(null)
const searcher = ref(null)
const forIndex = ref([])
const contactGroupId = ref(null)
const showInfoModal = ref(false)
const faq = ref(null)
const contactSection = ref(null)
const supporterInfoModal = ref(null)
const rateAppModal = ref(null)
const showRateAppModal = ref(false)
const showDebugLogs = ref(false)
const showAllFaqs = ref(false)
const deviceuserinfocopied = ref('Copy info')

// Computed properties
const isApp = ref(mobileStore.isApp)
const appType = ref(mobileStore.isiOS ? 'iOS' : 'Android')
const mobileVersion = ref(runtimeConfig.public.MOBILE_VERSION)

const deviceuserinfo = computed(() => {
  if (!mobileStore.deviceuserinfo) return null
  return mobileStore.deviceuserinfo
})

const matches = computed(() => {
  if (!searcher.value || !question.value) {
    return forIndex.value.map((o) => o.id)
  }

  let result = searcher.value.search(question.value, {
    returnMatchData: true,
  })

  result = result.slice(0, 10)

  // Get id prop from each
  return result.map((r) => r.item.id)
})

const version = computed(() => {
  const date = dayjs(runtimeConfig.public.BUILD_DATE)
  return date.format('Do MMMM, YYYY') + ' at ' + date.format('HH:mm')
})

const loggedIn = computed(() => authStore.user !== null)

const hasNoResults = computed(() => {
  return question.value && question.value.trim() && matches.value.length === 0
})

// Methods
function supporterInfo() {
  showInfoModal.value = true
}

function showRateMe() {
  window.localStorage.removeItem('rateappnotagain')
  showRateAppModal.value = true
}

function scrollToContact() {
  if (contactSection.value) {
    contactSection.value.scrollIntoView({ behavior: 'smooth' })
  }
}

async function autoCopyDeviceInfo() {
  if (isApp.value) {
    await copydeviceuserinfo()
    deviceuserinfocopied.value = 'Auto-copied!'
  }
}

async function copydeviceuserinfo(e) {
  console.log('copydeviceuserinfo', e)
  let infotocopy = 'Mobile version: ' + mobileVersion.value + '. '
  if (deviceuserinfo.value) infotocopy += deviceuserinfo.value

  // Include debug logs if in app
  if (isApp.value) {
    const debugLogs = debugStore.getLogsAsText
    if (debugLogs) {
      infotocopy += '\n\n=== Debug Logs ===\n' + debugLogs
    }
  }

  await navigator.clipboard.writeText(infotocopy)
  deviceuserinfocopied.value = 'Copied!'
  setTimeout(() => {
    deviceuserinfocopied.value = 'Copy info'
  }, 3000)
  if (e) {
    e.preventDefault()
    e.stopPropagation()
    e.stopImmediatePropagation()
  }
  return false
}

// Build search index when FAQs are shown
async function buildSearchIndex() {
  await nextTick()
  if (!faq.value) return

  const faqs = faq.value.children
  forIndex.value = []

  for (const question of faqs) {
    if (question.tagName === 'DIV') {
      try {
        const questionText = question.children[0].innerText.trim()
        const answerText = question.children[1].innerText.trim()

        forIndex.value.push({
          id: question.id,
          question: questionText,
          answer: answerText,
        })
      } catch (e) {
        console.error('Malformed FAQ', question)
      }
    }
  }

  searcher.value = new Searcher(forIndex.value, {
    threshold: 0.7,
    keySelector: (obj) => obj.question + ' ' + obj.answer,
  })
}
watch(showAllFaqs, (val) => {
  if (val) {
    buildSearchIndex()
  }
})

// Page head
useHead(
  buildHead(route, runtimeConfig, 'Help', 'Help with Freegle', null, {
    class: 'overflow-y-scroll',
  })
)
</script>
<style scoped lang="scss">
@import 'assets/css/_color-vars.scss';

.help-page {
  padding-bottom: 2rem;
}

.help-header {
  text-align: center;
  padding: 1.5rem 0;

  h1 {
    color: $color-green-background;
    font-size: 1.75rem;
    margin-bottom: 0.5rem;
  }

  .app-review a {
    color: $color-gold;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}

.faq-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 1.5rem;
  overflow: hidden;
}

.faq-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  cursor: pointer;
  background: $color-gray--lighter;
  transition: background-color 0.2s;

  &:hover {
    background: darken($color-gray--lighter, 3%);
  }

  h2 {
    margin: 0;
    font-size: 1.1rem;
    display: flex;
    align-items: center;
    color: $color-green-background;
  }
}

.faq-content {
  padding: 1.25rem;
}

.faq-search {
  border-radius: 25px;
  border: 1px solid $color-gray--light;
  padding: 0.5rem 1rem;

  &:focus {
    border-color: $color-green-background;
    box-shadow: 0 0 0 0.2rem rgba($color-green-background, 0.15);
  }
}

.contact-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;
  text-align: center;

  h2 {
    color: $color-green-background;
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
  }

  .contact-intro {
    color: $color-gray--dark;
    margin-bottom: 1rem;
  }
}

.contact-card {
  padding: 1rem;
  background: $color-gray--lighter;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.app-info {
  font-size: 0.85rem;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.other-contacts {
  text-align: left;
  margin-top: 1rem;
  border: 1px solid $color-gray--light;
  border-radius: 8px;
  overflow: hidden;

  summary {
    padding: 0.75rem 1rem;
    cursor: pointer;
    background: $color-gray--lighter;
    font-weight: 500;
    color: $color-gray--dark;

    &:hover {
      background: darken($color-gray--lighter, 3%);
    }
  }
}

.contacts-list {
  padding: 1rem;
}

.contact-item {
  padding: 0.5rem 0;
  border-bottom: 1px solid $color-gray--lighter;

  &:last-child {
    border-bottom: none;
  }

  strong {
    display: block;
    font-size: 0.9rem;
    color: $color-gray--dark;
  }
}

.debug-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid $color-gray--lighter;
}

.version-info {
  margin-top: 1rem;
  font-size: 0.8rem;
  color: $color-gray--dark;
}

// FAQ slide transition
.faq-slide-enter-active,
.faq-slide-leave-active {
  transition: all 0.3s ease;
  max-height: 2000px;
  overflow: hidden;
}

.faq-slide-enter-from,
.faq-slide-leave-to {
  max-height: 0;
  opacity: 0;
  padding-top: 0;
  padding-bottom: 0;
}

:deep(h3) {
  margin-top: 0.5rem;
}
</style>
