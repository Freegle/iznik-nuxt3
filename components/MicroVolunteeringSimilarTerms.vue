<template>
  <div>
    <p>
      Click the <strong>two most similar</strong> terms - or if there are none,
      click <em>Skip</em>.
    </p>
    <div class="d-flex flex-wrap justify-content-between">
      <MicroVolunteeringSimilarTerm
        v-for="term in terms"
        :key="'term-' + term.id"
        :term="term"
        :similar-terms="similarTerms"
        class="mr-1 mb-2"
        @similar="similar(term)"
        @not="notSimilar(term)"
      />
    </div>
    <hr />
    <div class="d-flex flex-wrap justify-content-between">
      <b-button
        variant="secondary"
        size="lg"
        class="mt-2"
        :disabled="similarTerms.length > 0"
        @click="considerNext"
      >
        Skip - no similar terms
      </b-button>
      <b-button
        variant="primary"
        size="lg"
        class="mt-2"
        :disabled="similarTerms.length < 2"
        @click="submitSimilar"
      >
        Submit - these terms are similar
      </b-button>
    </div>
  </div>
</template>
<script>
import MicroVolunteeringSimilarTerm from '~/components/MicroVolunteeringSimilarTerm'

export default {
  components: { MicroVolunteeringSimilarTerm },
  props: {
    terms: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      similarTerms: [],
    }
  },
  methods: {
    considerNext() {
      this.$emit('next')
    },
    similar(term) {
      if (this.similarTerms.length < 2) {
        this.similarTerms.push(term)
      }
    },
    notSimilar(term) {
      this.similarTerms = this.similarTerms.filter((t) => t.id !== term.id)
    },
    submitSimilar() {
      this.microVolunteeringStore.respond({
        searchterm1: this.similarTerms[0].id,
        searchterm2: this.similarTerms[1].id,
      })

      this.$emit('next')
    },
  },
}
</script>
<style scoped lang="scss">
:deep(label) {
  font-weight: bold;
}
</style>
