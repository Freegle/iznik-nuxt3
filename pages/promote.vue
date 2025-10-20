<template>
  <b-row class="m-0 bg-white">
    <b-col cols="0" md="3" />
    <b-col cols="12" md="6" class="mt-2">
      <h1 class="header--size2">Spread the word</h1>
      <p>
        Wouldn't the world be better if more people freegled more often? You can
        help!
      </p>
      <div>
        <p>
          Freegle spreads by <strong>word of mouth</strong>. Maybe you've got
          friends, family or work colleagues who've never heard of us, and who
          could help themseves or others by freegling?
        </p>
        <p v-if="!isApp">
          Personalise your message and send it to them using the buttons below.
        </p>
        <InviteSomeone />
        <hr />
        <h2 class="header--size2">Other ways to help</h2>
      </div>
      <p>
        You wouldn't be freegling unless someone had told you about it - can you
        pay it forward?
      </p>
      <p>Here are some ways to help:</p>
      <ul>
        <li>
          <strong>Tell people!</strong> It's easy to forget that lots of people
          still haven't heard of us.
        </li>
        <li><strong>Put up a poster.</strong></li>
        <li><strong>Tell your story</strong>.</li>
      </ul>
      <h3 class="header--size3">Put up a poster</h3>
      <div class="d-block d-md-none pt-2">
        <b-button variant="primary" size="lg" class="mb-1" @click="added">
          I put up a poster!
        </b-button>
        <hr />
      </div>
      <p>
        This is an A4 poster with tear-off strips - good for noticeboards in
        cafes, community venues, or at work.
      </p>
      <b-button
        variant="primary"
        class="rounded-start"
        @click="language = 'English'"
        >English</b-button
      >
      <b-button
        variant="outline-danger"
        class="rounded-end border-danger"
        @click="language = 'Welsh'"
        >Welsh</b-button
      >
      <div v-if="language === 'English'" class="d-flex flex-wrap mt-2">
        <div class="mr-1">
          <h3 class="header--size4">A4</h3>
          <a
            href="https://freegle.in/A4Poster"
            target="_blank"
            class="mr-2"
            rel="noopener noreferrer"
          >
            <b-img
              lazy
              src="/posters/A4.jpg"
              class="poster border border-dark mb-2"
            />
            <br />
            <b-button variant="secondary" size="lg" class="mt-2 mb-2">
              Download poster
            </b-button>
          </a>
        </div>
        <div class="mr-1">
          <h3 class="header--size4">A5</h3>
          <a href="/posters/A5.jpg" target="_blank" class="mr-2">
            <b-img
              lazy
              src="/posters/A5.jpg"
              class="poster border border-dark mb-2"
            />
            <br />
            <b-button variant="secondary" size="lg" class="mt-2 mb-2">
              Download poster
            </b-button>
          </a>
        </div>
        <div class="mr-1">
          <h3 class="header--size4">A5 x 2</h3>
          <a href="/posters/A5x2.jpg" target="_blank">
            <b-img
              lazy
              src="/posters/A5x2.jpg"
              class="poster border border-dark mb-2"
            />
            <br />
            <b-button variant="secondary" size="lg" class="mt-2 mb-2">
              Download poster
            </b-button>
          </a>
        </div>
      </div>
      <div v-if="language === 'Welsh'" class="d-flex flex-wrap mt-2">
        <div class="mr-1">
          <h3 class="header--size4">A4</h3>
          <a href="/posters/A4Welsh.jpg" target="_blank">
            <b-img
              lazy
              src="/posters/A4Welsh.jpg"
              class="poster border border-dark mb-2"
            />
            <br />
            <b-button variant="secondary" size="lg" class="mt-2 mb-2">
              Download poster
            </b-button>
          </a>
        </div>
        <div class="mr-1">
          <h3 class="header--size4">A5</h3>
          <a href="/posters/A5Welsh.jpg" target="_blank">
            <b-img
              lazy
              src="/posters/A5Welsh.jpg"
              class="poster border border-dark mb-2"
            />
            <br />
            <b-button variant="secondary" size="lg" class="mt-2 mb-2">
              Download poster
            </b-button>
          </a>
        </div>
        <div class="mr-1">
          <h3 class="header--size4">A5 x 2</h3>
          <a href="/posters/A5x2Welsh.jpg" target="_blank">
            <b-img
              lazy
              src="/posters/A5x2Welsh.jpg"
              class="poster border border-dark mb-2"
            />
            <br />
            <b-button variant="secondary" size="lg" class="mt-2 mb-2">
              Download poster
            </b-button>
          </a>
        </div>
      </div>
      <div class="d-none d-md-block">
        <p>
          You can help even more by letting us know where you put up posters.
          Once we know where it is, then we can encourage other freeglers to put
          one up there in future. <strong>Please do this!</strong>
        </p>
        <b-button variant="primary" size="lg" class="mb-1" @click="added">
          I put up a poster!
        </b-button>
        <p>
          You can see where people have put up posters
          <nuxt-link no-prefetch to="/noticeboards">here</nuxt-link>.
        </p>
        <hr />
      </div>
      <h2 class="header--size3">Business Cards</h2>
      <p>
        You can get little "business cards" to hand out to people or put on
        noticeboards. They're small, so it's easy to always have a few with you.
      </p>
      <p>
        You can order these from firms like
        <a
          href="https://www.instantprint.co.uk/business-cards/economy?lamination=no&size=85-x-55-mm&paper=350gsm-silk&sided=single&finish=standard-corners&rangesizeq=0"
          rel="noopener noreferrer"
          >Instantprint</a
        >
        - download our file and upload it to their site when ordering.
      </p>
      <b-button
        variant="primary"
        class="rounded-start"
        @click="language = 'English'"
        >English</b-button
      >
      <b-button
        variant="outline-danger"
        class="rounded-end border-danger"
        @click="language = 'Welsh'"
        >Welsh</b-button
      >
      <div v-if="language === 'English'" class="mt-2">
        <div>
          <b-img
            lazy
            src="/businesscards/FreegleBusinessCardSmall.jpg"
            class="border border-dark mb-2 mr-2 businesscard"
          />
        </div>
        <a
          href="https://freegle.in/BusinessCard"
          target="_blank"
          class="mt-1 mb-1"
          rel="noopener noreferrer"
        >
          <b-button size="lg" variant="primary">
            Download business card
          </b-button>
        </a>
      </div>
      <div v-else class="mt-2">
        <div>
          <b-img
            lazy
            src="/businesscards/FreegleBusinessCardSmallWelsh.jpg"
            class="border border-dark mb-2 businesscard"
          />
        </div>
        <a
          href="https://freegle.in/BusinessCardWelsh"
          target="_blank"
          class="mt-1 mb-1"
          rel="noopener noreferrer"
        >
          <b-button size="lg" variant="primary">
            Download business card
          </b-button>
        </a>
      </div>
      <br />
      <hr />
      <h2 class="header--size3">Tell your story</h2>
      <p>This helps encourage other people to try freegling.</p>
      <b-button to="/stories" variant="primary" size="lg" class="mb-4">
        <v-icon icon="book-open" /> Tell your story
      </b-button>
    </b-col>
    <PosterModal v-if="showPosterModal" @hidden="showPosterModal = false" />
  </b-row>
</template>
<script setup>
import { useRoute } from 'vue-router'
import { useMobileStore } from '@/stores/mobile' // APP
import {
  ref,
  defineAsyncComponent,
  definePageMeta,
  useHead,
  useRuntimeConfig,
} from '#imports'
import InviteSomeone from '~/components/InviteSomeone'
import { buildHead } from '~/composables/useBuildHead'

const PosterModal = defineAsyncComponent(() =>
  import('~/components/PosterModal')
)

definePageMeta({
  layout: 'login',
})

const runtimeConfig = useRuntimeConfig()
const route = useRoute()
const mobileStore = useMobileStore()

const isApp = ref(mobileStore.isApp) // APP

useHead(
  buildHead(
    route,
    runtimeConfig,
    'Promote Freegle',
    'Can you pass it on? Help us get more people freegling more often...'
  )
)

const language = ref('English')
const showPosterModal = ref(false)

function added() {
  showPosterModal.value = true
}
</script>
<style scoped>
.poster {
  width: 300px;
}

.businesscard {
  width: 200px;
}
</style>
