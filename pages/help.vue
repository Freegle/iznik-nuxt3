<template>
  <client-only>
    <b-row class="m-0">
      <b-col cols="0" md="3">
        <VisibleWhen :at="['lg', 'xl', 'xxl']">
          <SidebarLeft />
        </VisibleWhen>
      </b-col>
      <b-col cols="12" md="6" class="bg-white pt-4">
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
            <template #title>Has Maya added some help questions yet?</template>
            <template #default>
              <p>No.</p>
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
                You can't - you need to use your school address.
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
            <template #title>What are the rules?</template>
            <template #default>
              <TermsOfUse />
            </template>
          </HelpQuestion>
          <hr class="mt-4" />
          <h2>Can I help Freegle?</h2>
          <HelpQuestion id="canihelp" :matches="matches">
            <template #title>Can I volunteer?</template>
            <div>
              <p>
                Yes! Talk to
                <ExternalLink href="mailto:k.sheppard@oxf.gdst.net"
                  >Mrs Sheppard</ExternalLink
                >
                or
                <ExternalLink href="mailto:M.Roy-Romahi@oxf.gdst.net"
                  >Maya</ExternalLink
                >
              </p>
            </div>
          </HelpQuestion>
        </div>
        <hr />
        <h2 class="header--size1">Something else?</h2>
        <p>
          If you have questions, you can contact
          <ExternalLink href="mailto:k.sheppard@oxf.gdst.net"
            >Mrs Sheppard</ExternalLink
          >
          or
          <ExternalLink href="mailto:M.Roy-Romahi@oxf.gdst.net"
            >Maya</ExternalLink
          >.
        </p>

        <p></p>
        <p>This version of the site was built on {{ version }}.</p>
      </b-col>
      <b-col cols="0" md="3" />
    </b-row>
  </client-only>
</template>
<script>
import { useRoute } from 'vue-router'
import { Searcher } from 'fast-fuzzy'
import dayjs from 'dayjs'
import ExternalLink from '../components/ExternalLink'
import HelpQuestion from '~/components/HelpQuestion'
import { buildHead } from '~/composables/useBuildHead'
import VisibleWhen from '~/components/VisibleWhen'
const SidebarLeft = defineAsyncComponent(() =>
  import('~/components/SidebarLeft')
)

export default {
  components: {
    ExternalLink,
    HelpQuestion,
    VisibleWhen,
    SidebarLeft,
  },
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
  },
  async mounted() {
    // Scan the FAQs above and extract the plain text for each one, and then construct a search index.
    await this.$nextTick()
    const faqs = this.$refs.faq.children

    this.forIndex = []

    for (const question of faqs) {
      if (question.tagName === 'DIV') {
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
    }

    this.searcher = new Searcher(this.forIndex, {
      threshold: 0.7,
      keySelector: (obj) => obj.question + ' ' + obj.answer,
    })
  },
  methods: {
    supporterInfo() {
      this.showInfoModal = true
    },
  },
}
</script>
<style scoped lang="scss">
:deep(h3) {
  margin-top: 0.5rem;
}
</style>
