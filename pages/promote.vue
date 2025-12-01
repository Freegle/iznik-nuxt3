<template>
  <div class="promote-page">
    <b-row class="m-0">
      <b-col cols="0" md="3" />
      <b-col cols="12" md="6" class="promote-content">
        <!-- Header -->
        <div class="page-header">
          <h1>Spread the word</h1>
          <p>Help more people discover freegling!</p>
        </div>

        <!-- Invite section -->
        <div class="section-card">
          <div class="section-header">
            <v-icon icon="envelope" class="section-icon" />
            <h2>Invite someone</h2>
          </div>
          <div class="section-content">
            <p v-if="!isApp">
              Send a personalised invite to friends or family.
            </p>
            <InviteSomeone />
          </div>
        </div>

        <!-- Posters section -->
        <div class="section-card">
          <div class="section-header">
            <v-icon icon="image" class="section-icon" />
            <h2>Put up a poster</h2>
          </div>
          <div class="section-content">
            <p>
              A4 tear-off posters for noticeboards in cafes, workplaces, or
              community venues.
            </p>

            <div class="language-toggle">
              <b-button
                :variant="
                  language === 'English' ? 'primary' : 'outline-secondary'
                "
                size="sm"
                @click="language = 'English'"
              >
                English
              </b-button>
              <b-button
                :variant="language === 'Welsh' ? 'danger' : 'outline-secondary'"
                size="sm"
                @click="language = 'Welsh'"
              >
                Welsh
              </b-button>
            </div>

            <div class="poster-grid">
              <template v-if="language === 'English'">
                <a
                  v-for="poster in englishPosters"
                  :key="poster.size"
                  :href="poster.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="poster-item"
                >
                  <b-img lazy :src="poster.img" class="poster-img" />
                  <span class="poster-label">{{ poster.size }}</span>
                </a>
              </template>
              <template v-else>
                <a
                  v-for="poster in welshPosters"
                  :key="poster.size"
                  :href="poster.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="poster-item"
                >
                  <b-img lazy :src="poster.img" class="poster-img" />
                  <span class="poster-label">{{ poster.size }}</span>
                </a>
              </template>
            </div>

            <b-button variant="primary" class="mt-3" @click="added">
              <v-icon icon="check" /> I put up a poster!
            </b-button>
            <p class="small-text mt-2">
              <nuxt-link no-prefetch to="/noticeboards">
                See where others have put posters
              </nuxt-link>
            </p>
          </div>
        </div>

        <!-- Business cards section -->
        <div class="section-card">
          <div class="section-header">
            <v-icon icon="address-book" class="section-icon" />
            <h2>Business cards</h2>
          </div>
          <div class="section-content">
            <p>Hand out to people or leave on noticeboards.</p>

            <div class="language-toggle">
              <b-button
                :variant="
                  language === 'English' ? 'primary' : 'outline-secondary'
                "
                size="sm"
                @click="language = 'English'"
              >
                English
              </b-button>
              <b-button
                :variant="language === 'Welsh' ? 'danger' : 'outline-secondary'"
                size="sm"
                @click="language = 'Welsh'"
              >
                Welsh
              </b-button>
            </div>

            <div v-if="language === 'English'" class="businesscard-section">
              <b-img
                lazy
                src="/businesscards/FreegleBusinessCardSmall.jpg"
                class="businesscard-img"
              />
              <a
                href="https://freegle.in/BusinessCard"
                target="_blank"
                rel="noopener noreferrer"
              >
                <b-button variant="secondary">
                  <v-icon icon="download" /> Download
                </b-button>
              </a>
            </div>
            <div v-else class="businesscard-section">
              <b-img
                lazy
                src="/businesscards/FreegleBusinessCardSmallWelsh.jpg"
                class="businesscard-img"
              />
              <a
                href="https://freegle.in/BusinessCardWelsh"
                target="_blank"
                rel="noopener noreferrer"
              >
                <b-button variant="secondary">
                  <v-icon icon="download" /> Download
                </b-button>
              </a>
            </div>
          </div>
        </div>

        <!-- Tell your story -->
        <div class="section-card">
          <div class="section-header">
            <v-icon icon="book-open" class="section-icon" />
            <h2>Tell your story</h2>
          </div>
          <div class="section-content">
            <p>Share your freegling experiences to encourage others.</p>
            <b-button to="/stories" variant="primary">
              <v-icon icon="pen" /> Share your story
            </b-button>
          </div>
        </div>
      </b-col>
      <b-col cols="0" md="3" />
    </b-row>
    <PosterModal v-if="showPosterModal" @hidden="showPosterModal = false" />
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { useMobileStore } from '@/stores/mobile'
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

const isApp = ref(mobileStore.isApp)

useHead(
  buildHead(
    route,
    runtimeConfig,
    'Promote Freegle',
    'Help us get more people freegling more often...'
  )
)

const language = ref('English')
const showPosterModal = ref(false)

const englishPosters = [
  { size: 'A4', url: 'https://freegle.in/A4Poster', img: '/posters/A4.jpg' },
  { size: 'A5', url: 'https://freegle.in/A5Poster', img: '/posters/A5.jpg' },
  {
    size: 'A5×2',
    url: 'https://freegle.in/A5x2Poster',
    img: '/posters/A5x2.jpg',
  },
]

const welshPosters = [
  {
    size: 'A4',
    url: 'https://freegle.in/A4WelshPoster',
    img: '/posters/A4Welsh.jpg',
  },
  {
    size: 'A5',
    url: 'https://freegle.in/A5WelshPoster',
    img: '/posters/A5Welsh.jpg',
  },
  {
    size: 'A5×2',
    url: 'https://freegle.in/A5x2WelshPoster',
    img: '/posters/A5x2Welsh.jpg',
  },
]

function added() {
  showPosterModal.value = true
}
</script>

<style scoped lang="scss">
@import 'assets/css/_color-vars.scss';

.promote-page {
  background: $color-gray--lighter;
  min-height: 100vh;
}

.promote-content {
  padding: 1rem 0.5rem 2rem;

  @media (min-width: 576px) {
    padding: 1rem 1rem 2rem;
  }
}

.page-header {
  text-align: center;
  padding: 1.5rem 0;

  h1 {
    color: $color-green-background;
    font-size: 1.75rem;
    margin-bottom: 0.5rem;
  }

  p {
    color: $color-gray--dark;
    margin: 0;
  }
}

.section-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 1rem;
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);

  h2 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: $color-green-background;
  }

  .section-icon {
    color: $color-green-background;
  }
}

.section-content {
  padding: 1rem 1.25rem;

  p {
    color: $color-gray--darker;
    font-size: 0.95rem;
    margin-bottom: 1rem;
  }
}

.language-toggle {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.poster-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;

  @media (max-width: 400px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.poster-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  padding: 0.5rem;
  border-radius: 8px;
  background: $color-gray--lighter;
  transition: background 0.2s;

  &:hover {
    background: darken($color-gray--lighter, 5%);
  }
}

.poster-img {
  width: 100%;
  max-width: 100px;
  border: 1px solid $color-gray--dark;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.poster-label {
  font-size: 0.8rem;
  font-weight: 500;
  color: $color-gray--darker;
}

.businesscard-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.businesscard-img {
  max-width: 200px;
  border: 1px solid $color-gray--dark;
  border-radius: 4px;
}

.small-text {
  font-size: 0.85rem;
  color: $color-gray--dark;
}
</style>
