<template>
  <div v-if="!me" class="landing-page">
    <client-only>
      <BreakpointFettler />
    </client-only>

    <!-- Main Layout (all breakpoints) -->
    <div class="main-layout">
      <!-- Hero: Full viewport photo mosaic with CTA overlay -->
      <div class="hero-viewport">
        <FreeglerPhotoGrid />
        <div class="hero-overlay">
          <div class="hero-glass-card">
            <h1 class="hero-slogan">
              <span class="slogan-line1">Share the love.</span>
              <span class="slogan-line2">Love the share.</span>
            </h1>
            <p class="hero-subtitle">Give and get stuff locally for free.</p>
            <div class="action-buttons">
              <client-only>
                <NuxtLink
                  to="/give"
                  class="action-btn action-btn--give"
                  @click="clicked('give')"
                >
                  <v-icon icon="gift" class="action-btn__icon" />
                  <span>Give</span>
                </NuxtLink>
                <NuxtLink
                  to="/find"
                  class="action-btn action-btn--find"
                  @click="clicked('ask')"
                >
                  <v-icon icon="search" class="action-btn__icon" />
                  <span>Find</span>
                </NuxtLink>
                <template #fallback>
                  <a href="/give" class="action-btn action-btn--give">
                    <span class="action-btn__icon-placeholder"></span>
                    <span>Give</span>
                  </a>
                  <a href="/find" class="action-btn action-btn--find">
                    <span class="action-btn__icon-placeholder"></span>
                    <span>Find</span>
                  </a>
                </template>
              </client-only>
            </div>
            <p class="browse-label">
              <v-icon icon="map-marker-alt" class="browse-icon" />
              Just browsing? See what's near you.
            </p>
            <client-only>
              <PlaceAutocomplete
                class="browse-input"
                input-id="placeautocomplete-mobile"
                labeltext=""
                labeltext-sr="Enter your location"
                @selected="explorePlace($event)"
              />
              <template #fallback>
                <input
                  type="text"
                  class="form-control browse-input-ssr"
                  placeholder="Type your location"
                  disabled
                />
              </template>
            </client-only>
            <p class="photo-credit">
              Photos of real freeglers by
              <ExternalLink href="https://www.alexbamford.com/"
                >Alex Bamford</ExternalLink
              >
            </p>
          </div>
        </div>
      </div>

      <!-- Sample Offers -->
      <div class="sample-section sample-stack">
        <div class="loading-grid-ssr">
          <div v-for="i in 8" :key="i" class="loading-card-ssr">
            <div class="loading-shimmer-ssr"></div>
          </div>
        </div>
        <client-only>
          <MobileVisualiseList class="sample-grid" />
        </client-only>
      </div>

      <!-- App Download -->
      <div v-if="!isApp" class="app-section">
        <a
          href="https://play.google.com/store/apps/details?id=org.ilovefreegle.direct"
          target="_blank"
          rel="noopener noreferrer"
        >
          <ProxyImage
            preload
            alt="Get it on Google Play"
            class="app-badge"
            src="/en-play-badge.png"
            sizes="100px"
          />
        </a>
        <a
          href="https://itunes.apple.com/gb/app/freegle/id970045029?ls=1&amp;mt=8"
          target="_blank"
          rel="noopener noreferrer"
        >
          <ProxyImage
            preload
            alt="Download on the App Store"
            class="app-badge"
            src="/app-store-black-sm.png"
            sizes="100px"
          />
        </a>
      </div>

      <!-- Footer -->
      <MainFooter class="thefooter" />
    </div>
  </div>
</template>
<script setup>
import { useRoute, useRouter } from 'vue-router'
import { buildHead } from '~/composables/useBuildHead'
import { useMiscStore } from '~/stores/misc'
import { useAuthStore } from '~/stores/auth'
import { useMobileStore } from '@/stores/mobile'
import { useMessageStore } from '~/stores/message'
import { useGroupStore } from '~/stores/group'
import MainFooter from '~/components/MainFooter'
import BreakpointFettler from '~/components/BreakpointFettler.vue'
import PlaceAutocomplete from '~/components/PlaceAutocomplete.vue'
import FreeglerPhotoGrid from '~/components/FreeglerPhotoGrid.vue'
import ProxyImage from '~/components/ProxyImage.vue'
import {
  computed,
  ref,
  onMounted,
  onBeforeUnmount,
  nextTick,
  defineAsyncComponent,
  useHead,
  useRuntimeConfig,
} from '#imports'
import Api from '~/api'

const MobileVisualiseList = defineAsyncComponent(() =>
  import('~/components/MobileVisualiseList')
)

// Setup
const runtimeConfig = useRuntimeConfig()
const api = Api(runtimeConfig)
const route = useRoute()
const router = useRouter()
const miscStore = useMiscStore()
const mobileStore = useMobileStore()
const messageStore = useMessageStore()
const groupStore = useGroupStore()
const userWatch = ref(null)
const type = ref('landing')

// Head configuration
const head = buildHead(
  route,
  runtimeConfig,
  "Don't throw it away, give it away!",
  "Freegle - like online dating for stuff. Got stuff you don't need? Looking for something? We'll match you with someone local. All completely free.",
  null,
  {
    class: 'landing',
  }
)

// Preload some images to speed page load
const userSite = runtimeConfig.public.USER_SITE
const proxy = runtimeConfig.public.IMAGE_DELIVERY

const logo = proxy + '?url=' + userSite + '/icon.png&output=webp&w=58'

head.link = [
  {
    rel: 'preload',
    as: 'image',
    href: logo,
  },
]

useHead(head)

await groupStore.fetch()

try {
  const list = await messageStore.fetchInBounds(
    49.45,
    -9,
    61,
    2,
    null,
    50,
    true
  )
  const offers = list.filter((item) => item.type === 'Offer')

  const preloadPromises = []
  for (const offer of offers.slice(0, 12)) {
    preloadPromises.push(messageStore.fetch(offer.id))
  }
  await Promise.all(preloadPromises)
} catch (e) {
  console.log('SSR: Failed to prefetch messages', e)
}

// Computed properties
const me = computed(() => {
  // Access the user store to get the current user
  const authStore = useAuthStore()
  return authStore?.user
})

const isApp = ref(mobileStore.isApp) // APP

// Methods
function goHome() {
  let nextroute = '/browse'

  // Logged in homepage - on client side we want to load the last page, for logged in users.
  try {
    const lastRoute = miscStore.get('lasthomepage')

    if (lastRoute === 'news') {
      nextroute = '/chitchat'
    } else if (lastRoute === 'myposts') {
      nextroute = '/myposts'
    }

    if (route.path !== nextroute) {
      nextTick(() => {
        router.push(nextroute)
      })
    }
  } catch (e) {
    console.log('Exception', e)
  }
}

async function clicked(button) {
  await api.bandit.chosen({
    uid: 'landing',
    variant: type.value,
  })

  await api.bandit.chosen({
    uid: 'landing-button',
    variant: type.value + '-' + button,
  })
}

async function explorePlace(place) {
  await api.bandit.chosen({
    uid: 'landing',
    variant: type.value,
  })

  await api.bandit.chosen({
    uid: 'landing-button',
    variant: type.value + '-place',
  })

  router.push('/explore/place/' + JSON.stringify(place))
}

// Lifecycle hooks
onMounted(() => {
  if (process.client) {
    if (me.value) {
      goHome()
    }
  }
})

onBeforeUnmount(() => {
  if (userWatch.value) {
    userWatch.value()
  }
})
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';
@import 'assets/css/_color-vars.scss';

.landing-page {
  min-height: 100vh;
}

.main-layout {
  padding: 0;
  background: $color-white;
  min-height: 100vh;
}

/* Hero viewport: photos fill the screen, CTA overlaid in center */
.hero-viewport {
  position: relative;
  overflow: hidden;
  min-height: calc(100vh - 60px);
  min-height: calc(100dvh - 60px);
}

/* Overlay positions the glass card in the center */
.hero-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  padding: 60px 1rem 1rem;
}

/* Frosted glass card: only blurs the area behind the text */
.hero-glass-card {
  text-align: center;
  max-width: 480px;
  width: 100%;
  padding: 1.25rem 1.5rem;
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 4px 24px $color-black-opacity-10;

  @include media-breakpoint-up(md) {
    padding: 1.5rem 2rem;
  }
}

.hero-slogan {
  font-size: clamp(1.5rem, 6vw, 3rem);
  font-weight: 800;
  line-height: 1.15;
  margin: 0 0 0.25rem;
  letter-spacing: -0.02em;
}

.slogan-line1 {
  display: block;
  color: $colour-header;
}

.slogan-line2 {
  display: block;
  color: $colour-success;
}

.hero-subtitle {
  font-size: clamp(0.9rem, 2.5vw, 1.1rem);
  color: $color-gray--darker;
  margin-bottom: 0.75rem;
  font-weight: 500;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: clamp(0.3rem, 1vw, 0.5rem);
  padding: clamp(0.6rem, 2vw, 0.85rem) clamp(1.25rem, 5vw, 2.5rem);
  font-size: clamp(0.95rem, 2.5vw, 1.15rem);
  font-weight: 600;
  text-decoration: none;
  transition: transform 0.1s, box-shadow 0.15s;
  min-width: clamp(90px, 22vw, 150px);

  &:active {
    transform: scale(0.98);
  }
}

.action-btn--give {
  background: $colour-success;
  color: white;
  box-shadow: 0 2px 8px rgba($colour-success, 0.3);

  &:hover {
    background: darken($colour-success, 5%);
    color: white;
    text-decoration: none;
  }
}

.action-btn--find {
  background: $colour-secondary;
  color: white;
  box-shadow: 0 2px 8px rgba($colour-secondary, 0.3);

  &:hover {
    background: darken($colour-secondary, 5%);
    color: white;
    text-decoration: none;
  }
}

.action-btn__icon {
  font-size: 1rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  top: -1px;
}

.action-btn__icon-placeholder {
  display: inline-block;
  width: 1rem;
  height: 1rem;
}

.browse-label {
  font-size: 0.8rem;
  font-weight: 500;
  color: $color-gray--dark;
  margin: 0.75rem 0 0.4rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
}

.browse-icon {
  color: $colour-success;
  font-size: 0.85rem;
}

.browse-input {
  :deep(label) {
    display: none !important;
  }

  :deep(.form-control) {
    border: 1px solid $color-gray--light;
    padding: 0.6rem 0.75rem;
    font-size: 0.9rem;
    background: rgba(255, 255, 255, 0.9);
    text-align: center;

    &::placeholder {
      color: $color-gray--normal;
      text-align: center;
    }

    &:focus {
      border-color: $colour-success;
      background: $color-white;
      box-shadow: 0 0 0 2px rgba($colour-success, 0.15);
      text-align: left;

      &::placeholder {
        text-align: left;
      }
    }
  }

  :deep(.input-group-text),
  :deep(.btn),
  :deep(.autocomplete-clear) {
    display: none !important;
  }

  @include media-breakpoint-up(md) {
    max-width: 400px;
    margin-left: auto;
    margin-right: auto;
  }
}

/* SSR fallback input */
.browse-input-ssr {
  width: 100%;
  border: 1px solid $color-gray--light;
  padding: 0.6rem 0.75rem;
  font-size: 0.9rem;
  background: rgba(255, 255, 255, 0.9);
  text-align: center;

  &::placeholder {
    color: $color-gray--normal;
    text-align: center;
  }

  @include media-breakpoint-up(md) {
    max-width: 400px;
    margin-left: auto;
    margin-right: auto;
  }
}

.photo-credit {
  font-size: 0.65rem;
  color: $color-gray--normal;
  margin: 0.75rem 0 0;
}

/* Sample Offers Section */
.sample-section {
  padding: 1rem 0.5rem;
}

.sample-stack {
  display: grid;

  > * {
    grid-area: 1 / 1;
  }
}

.loading-grid-ssr {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  padding: 0 0.5rem;
  max-height: 320px;
  overflow: hidden;

  @include media-breakpoint-up(lg) {
    grid-template-columns: repeat(3, 1fr);
    max-height: 640px;
  }
}

.loading-card-ssr {
  aspect-ratio: 0.87;
  overflow: hidden;
  background: #f5f5f5;
}

.loading-shimmer-ssr {
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #f5f5f5 0%, #fafafa 50%, #f5f5f5 100%);
  background-size: 200% 100%;
  animation: shimmer-ssr 1.5s infinite;
}

@keyframes shimmer-ssr {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* App Download Section */
.app-section {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  margin: 0 1rem;
  background: $color-gray--lighter;
}

.app-badge {
  height: 32px;
  width: auto;
}
</style>
