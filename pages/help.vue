<template>
  <b-row class="m-0">
    <b-col cols="0" md="3" />
    <b-col cols="12" md="6" class="bg-white pt-4">
      <h1>How can we help?</h1>
      <p>
        Type a question in here, and we'll see if we can find an answer for you.
      </p>
      <b-form-input
        v-model="question"
        placeholder="Type your question here..."
        class="border-primary"
      />
      <hr />
      <div ref="faq">
        <div v-show="matches.includes('unsubscribe')" id="unsubscribe">
          <h3>How do I unsubscribe?</h3>
          <div>
            If you'd like to leave Freegle, then go
            <nuxt-link to="/unsubscribe">here</nuxt-link>. But remember that you
            can also reduce the number and frequency of emails from
            <nuxt-link to="/settings">Settings</nuxt-link>.
          </div>
        </div>
        <div v-show="matches.includes('taken')" id="taken">
          <h3>My OFFER has been TAKEN - what do I do?</h3>
          <div>
            <p>
              If someone has collected your OFFER, then make sure you're logged
              in (click on <em>Sign in</em> on the top left if you need to),
              then go to <nuxt-link to="/myposts">My Posts</nuxt-link>, find
              your post, and click this button:
            </p>
            <div class="mt-2 mb-2">
              <b-button variant="primary"> Mark as TAKEN </b-button>
            </div>

            <p>
              Similarly, if you have received your WANTED, go to
              <nuxt-link to="/myposts">My Posts</nuxt-link>, find your post, and
              click this:
            </p>
            <div class="mb-2">
              <b-button variant="primary"> Mark as RECEIVED </b-button>
            </div>

            <p>
              If you have multiple posts showing, you may need to click the post
              to expand it before the buttons appear.
            </p>
          </div>
        </div>
      </div>
      <hr />
      <p>TODO More FAQs - Support compiling a list</p>
      <h2 class="header--size1">Something else?</h2>
      <p>
        If your question isn't answered above, or you wish to compliment or
        complain, then you can <strong>contact your volunteer team</strong>, who
        will be happy to hear whether Freegle is doing a great job or needs
        changing.
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
            Our support volunteers at <SupportLink />. They deal with questions
            about this site, or problems with freegling where your local
            community volunteers can't help.
          </li>
          <li>
            <!-- eslint-disable-next-line -->
            Our national mailbox volunteers at <SupportLink email="info@ilovefreegle.org" text="info@ilovefreegle.org" />. They
            />. They deal with more general questions about Freegle which aren't
            specific to one community, or if you have issues you can't resolve
            with your local team. Please be aware that we have very limited
            powers. Local communities are autonomous, but we can help negotiate,
            explain and make suggestions where appropriate.
          </li>
          <li>
            <!-- eslint-disable-next-line -->
            Our media volunteers at <SupportLink email="media@ilovefreegle.org" text="media@ilovefreegle.org" />. Please use this if
            you are a member of the media and want to help publicise Freegle.  For urgent press enquiries only, call +44 (0)7962 449573.
          </li>
        </ul>
        <p>This version of the site was built on {{ version }}.</p>
      </div>
    </b-col>
    <b-col cols="0" md="3" />
  </b-row>
</template>
<script>
import { Searcher } from 'fast-fuzzy'
import dayjs from 'dayjs'

export default {
  data() {
    return {
      question: null,
      searcher: null,
      forIndex: [],
      contactGroupId: null,
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
  mounted() {
    // Scan the FAQs above and extract the plain text for each one, and then construct a search index.
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
  },
}
</script>
<style scoped lang="scss">
:deep(h3) {
  margin-top: 0.5rem;
}
</style>
