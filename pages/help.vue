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
    </b-col>
    <b-col cols="0" md="3" />
  </b-row>
</template>
<script>
import { Searcher } from 'fast-fuzzy'

export default {
  data() {
    return {
      question: null,
      searcher: null,
      forIndex: [],
    }
  },
  computed: {
    matches() {
      if (!this.searcher || !this.question) {
        console.log('Show all', this.searcher, this.question)
        return this.forIndex.map((o) => o.id)
      }

      let result = this.searcher.search(this.question, {
        returnMatchData: true,
      })

      result = result.slice(0, 10)
      console.log('Results', result)

      // Get id prop from each
      return result.map((r) => r.item.id)
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
