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
<script setup>
import { ref } from 'vue'
import MicroVolunteeringSimilarTerm from '~/components/MicroVolunteeringSimilarTerm'
import { useMicroVolunteeringStore } from '~/stores/microvolunteering'

defineProps({
  terms: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['next'])

const microVolunteeringStore = useMicroVolunteeringStore()
const similarTerms = ref([])

function considerNext() {
  emit('next')
}

function similar(term) {
  if (similarTerms.value.length < 2) {
    similarTerms.value.push(term)
  }
}

function notSimilar(term) {
  similarTerms.value = similarTerms.value.filter((t) => t.id !== term.id)
}

function submitSimilar() {
  microVolunteeringStore.respond({
    searchterm1: similarTerms.value[0].id,
    searchterm2: similarTerms.value[1].id,
  })

  emit('next')
}
</script>
<style scoped lang="scss">
:deep(label) {
  font-weight: bold;
}
</style>
