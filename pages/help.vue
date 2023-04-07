<template>
  <client-only>
    <b-row class="m-0">
      <b-col cols="0" md="3" />
      <b-col cols="12" md="6" class="bg-white pt-4">
        <p v-if="isApp">
          If you like this app - or not - <a href='#' class="d-inline" @click="showRateMe">please leave a review</a>.<br />
          Mobile app version: {{ mobileVersion }}.
          <span style="display:none;">{{ mobileInfo }}</span>
        </p>
        <RateAppModal v-if="isApp" ref="rateappmodal" />
        <h1>How can we help?</h1>
        <p>
          Type a question in here, and we'll see if we can find an answer for
          you.
        </p>
        <b-form-input
          v-model="question"
          placeholder="Type your question here..."
          class="border-primary"
        />
        <hr />
        <div ref="faq">
          <HelpQuestion id="unsubscribe" :matches="matches">
            <template #title>How do I leave/unsubscribe?</template>
            <template #default>
              <p>
                If you'd like to leave Freegle, then go
                <nuxt-link no-prefetch to="/unsubscribe">here</nuxt-link>.
              </p>
              <p>
                But if you're just getting more emails than you want, you can
                reduce the number and frequency of emails from
                <nuxt-link no-prefetch to="/settings">Settings</nuxt-link>.
              </p>
            </template>
          </HelpQuestion>
          <HelpQuestion id="toomanyemails" :matches="matches">
            <template #title>How do I get fewer emails?</template>
            <p>
              <!-- eslint-disable-next-line-->
            If you go to <nuxt-link no-prefetch to="/settings">Settings</nuxt-link> then you can change how many mails you get in your <em>Mail Settings</em>.
            </p>
          </HelpQuestion>
          <HelpQuestion id="taken" :matches="matches">
            <template #title>My OFFER has been TAKEN - what do I do?</template>
            <div>
              <p>
                If someone has collected your OFFER, then make sure you're
                logged in (click on <em>Sign in</em> on the top left if you need
                to), then go to
                <nuxt-link no-prefetch to="/myposts">My Posts</nuxt-link>, find
                your post, and click this button:
              </p>
              <div class="mt-2 mb-2">
                <b-button variant="primary"> Mark as TAKEN </b-button>
              </div>

              <p>
                Similarly, if you have received your WANTED, go to
                <nuxt-link no-prefetch to="/myposts">My Posts</nuxt-link>, find
                your post, and click this:
              </p>
              <div class="mb-2">
                <b-button variant="primary"> Mark as RECEIVED </b-button>
              </div>

              <p>
                If you have multiple posts showing, you may need to click the
                post to expand it before the buttons appear.
              </p>
            </div>
          </HelpQuestion>
          <HelpQuestion id="repost" :matches="matches">
            <template #title>How do I repost an item?</template>
            <div>
              <p>
                <!-- eslint-disable-next-line-->
                If you've not had any replies, this happens automatically.  If you go to <nuxt-link  no-prefetch to="/myposts">My Posts</nuxt-link>, and click on the post, you can see the time until the auto-repost is due on there, like this:
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
                You can do this from your <nuxt-link  no-prefetch to="/settings">Settings</nuxt-link>, in the <em>Personal Information</em> section.
              </p>
            </div>
          </HelpQuestion>
          <HelpQuestion id="gdpr" :matches="matches">
            <template #title>What data do you store about me?</template>
            <p>
              If you're really into privacy or GDPR, you can see what data we
              store about you, and download it,
              <nuxt-link no-prefetch to="/mydata"> here </nuxt-link>.
            </p>
          </HelpQuestion>
          <HelpQuestion id="app" :matches="matches">
            <template #title>Do you have a mobile app?</template>
            <div>
              <div v-if="isApp">
                Yes! You are using the {{ appType }} app, version {{ mobileVersion }}.
              </div>
              <div v-else>
              <p>
                We do! Freegling is easy on mobiles and tablets, and you get
                notifications of replies so you don't have to rely on email.
                Download using these links or search for Freegle in your app
                store - it's free!
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
                The app is only available in the UK app stores. We support
                Android 5.1/iOS 13 or later.
              </p>
            </div>
          </div>
          </HelpQuestion>
          <HelpQuestion id="canihelp" :matches="matches">
            <template #title>Can I help?</template>
            <div>
              <p>
                Yes! Freegle is run by volunteers. The first stage is to become
                a Freegle Supporter, by donating time or funds (whichever you're
                able).
              </p>
              <b-button variant="primary" class="mb-2" @click="supporterInfo">
                Find out more
              </b-button>
              <SupporterInfoModal
                v-if="showInfoModal"
                ref="supporterInfoModal"
              />
              <p>
                If you'd like to spread the word you can download a poster or
                ask for "business cards" to hand out:
              </p>
              <b-button to="/promote" variant="primary" class="mb-2">
                Find out more
              </b-button>
              <p>
                If you would like to help run one of the local communities,
                which is a good place to start, please use the
                <em>Contact</em> button below.
              </p>
              <p>
                You can also volunteer nationally. We really need people in
                these areas:
              </p>
              <ul>
                <li>
                  Publicity: if you can help locally or nationally, especially
                  with councils, we'd love to hear from you.
                </li>
                <li>
                  Fundraising: we run on volunteers and donations, and just
                  about get by, but we could do so much more with more.
                </li>
                <li>
                  Graphics: we need people who can produce striking images,
                  posters, etc.
                </li>
                <li>
                  User Experience (UX): if you work in this area we could use
                  your help.
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
              You can reach us at <ExternalLink href="mailto:volunteers@ilovefreegle.org">volunteers@ilovefreegle.org</ExternalLink>.
              </p>
              <p>
                Or if you'd like to donate to our charity, you can do that
                <nuxt-link no-prefetch to="/donate"> here </nuxt-link> or here:
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
                If you're able to donate to keep Freegle running, you can do
                that here:
              </p>
              <DonationButton :direct-donation="true" class="mb-1" />
              <p>Monthly donations are particularly welcome.</p>
              <p>
                If you don't use PayPal, there are other ways to donate
                <nuxt-link no-prefetch to="/donate">here</nuxt-link>.
              </p>
            </div>
          </HelpQuestion>
          <HelpQuestion id="selling" :matches="matches">
            <template #title>Can I sell something given on Freegle?</template>
            <div>
              <p>
                Reselling also keeps stuff out of landfill; but please don't
                sell items you got from Freegle without the agreement of the
                person who gave them to you.
              </p>
            </div>
          </HelpQuestion>
          <HelpQuestion id="howdoichoose" :matches="matches">
            <template #title
              >How do I choose if several people are interested?
            </template>
            <div>
              <p>
                Unless you are in a hurry, it is better leave it a while to see
                who replies before choosing. Some people use
                first-come-first-served, but you don't have to.
              </p>
              <p>
                You can see in someone's profile how close they are, how many
                thumbs up/down they have from other freeglers.
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
        </div>
        <hr />
        <h2 class="header--size1">Something else?</h2>
        <p>
          If your question isn't answered above, or you wish to compliment or
          complain, then you can <strong>contact your volunteer team</strong>,
          who will be happy to hear whether Freegle is doing a great job or
          needs changing.
        </p>
        <h3 class="header--size5">
          Which Freegle community do you need help with?
        </h3>
        <b-card v-if="loggedIn" no-body>
          <b-card-body class="p-3">
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
              class="mb-2"
            />
          </b-card-body>
        </b-card>
        <div class="text-muted">
          <hr />
          <p>
            Your local volunteers will usually be the best way for you to get
            help, and it helps us if you use them where possible.
          </p>
          <div v-if="!loggedIn" class="mb-1">
            <notice-message>
              Please log in using the menu option at the top to contact your
              community volunteers.
            </notice-message>
          </div>
          <p>But you can also contact:</p>
          <ul>
            <li>
              Our support volunteers at <SupportLink />. They deal with
              questions about this site, or problems with freegling where your
              local community volunteers can't help.
            </li>
            <li>
              Our national mailbox volunteers at
              <SupportLink
                email="info@ilovefreegle.org"
                text="info@ilovefreegle.org"
              />. They deal with more general questions about Freegle which
              aren't specific to one community, or if you have issues you can't
              resolve with your local team. Please be aware that we have very
              limited powers. Local communities are autonomous, but we can help
              negotiate, explain and make suggestions where appropriate.
            </li>
            <li>
              Our media volunteers at
              <SupportLink
                email="media@ilovefreegle.org"
                text="media@ilovefreegle.org"
              />. Please use this if you are a member of the media and want to
              help publicise Freegle. For urgent press enquiries only, call +44
              (0)7962 449573.
            </li>
          </ul>
          <p>This version of the site was built on {{ version }}.</p>
        </div>
      </b-col>
      <b-col cols="0" md="3" />
    </b-row>
  </client-only>
</template>
<script>
import { useRoute } from 'vue-router'
import { Searcher } from 'fast-fuzzy'
import dayjs from 'dayjs'
import HelpQuestion from '~/components/HelpQuestion'
import { buildHead } from '~/composables/useBuildHead'
import { useMobileStore } from '@/stores/mobile'
const SupporterInfoModal = () => import('~/components/SupporterInfoModal.vue')

export default {
  components: { HelpQuestion, SupporterInfoModal },
  setup() {
    const route = useRoute()
    const runtimeConfig = useRuntimeConfig()

    useHead(
      buildHead(route, runtimeConfig, 'Help', 'Help with Freegle', null, {
        class: 'overflow-y-scroll',
      })
    )
  },
  data() {
    return {
      question: null,
      searcher: null,
      forIndex: [],
      contactGroupId: null,
      showInfoModal: false,
    }
  },
  computed: {
    matches() {
      if (!this.searcher || !this.question) {
        return this.forIndex.map((o) => o.id)
      }

      let result = this.searcher.search(this.question, {
        returnMatchData: true,
      })

      result = result.slice(0, 10)

      // Get id prop from each
      return result.map((r) => r.item.id)
    },
    version() {
      const runtimeConfig = useRuntimeConfig()
      const date = dayjs(runtimeConfig.public.BUILD_DATE)

      return date.format('Do MMMM, YYYY') + ' at ' + date.format('HH:mm')
    },
    isApp() {
      const mobileStore = useMobileStore()
      return mobileStore.isApp
    },
    appType() {
      const mobileStore = useMobileStore()
      return mobileStore.isiOS ? 'iOS' : 'Android'
    },
    mobileVersion() {
      const runtimeConfig = useRuntimeConfig()
      return runtimeConfig.public.MOBILE_VERSION
    },
     mobileInfo() {
      const mobileStore = useMobileStore()
      return mobileStore.devicePersistentId;
    },
  },
  mounted() {
    // Scan the FAQs above and extract the plain text for each one, and then construct a search index.
    this.waitForRef('faq', () => {
      const faqs = this.$refs.faq.children

      this.forIndex = []

      for (const question of faqs) {
        try {
          const questionText = question.children[0].innerText.trim()
          const answerText = question.children[1].innerText.trim()

          this.forIndex.push({
            id: question.id,
            question: questionText,
            answer: answerText,
          })
        } catch (e) {
          console.error('Malformed FAQ', question)
        }
      }

      this.searcher = new Searcher(this.forIndex, {
        threshold: 0.7,
        keySelector: (obj) => obj.question + ' ' + obj.answer,
      })
    })
  },
  methods: {
    supporterInfo() {
      this.showInfoModal = true
      this.waitForRef('supporterInfoModal', () => {
        this.$refs.supporterInfoModal.show()
      })
    },
    showRateMe() {
      window.localStorage.removeItem('rateappnotagain')
      this.$refs.rateappmodal.show()
    },
  },
}
</script>
<style scoped lang="scss">
:deep(h3) {
  margin-top: 0.5rem;
}
</style>
