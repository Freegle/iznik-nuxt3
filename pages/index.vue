<template>
  <div v-if="!me" class="landing-page">
    <client-only>
      <BreakpointFettler />
    </client-only>

    <!-- Mobile Layout -->
    <div class="d-block d-md-none mobile-layout">
      <!-- Hero Section -->
      <div class="hero-section">
        <!-- Frame with overlaid slogan -->
        <div class="hero-frame">
          <FreeglerPhotos class="hero-photos" />
          <div class="hero-slogan">
            <h1 class="hero-title">
              <span class="hero-line1">Share the love.</span>
              <span class="hero-line2">Love the share.</span>
            </h1>
          </div>
        </div>
        <!-- CTA section below frame -->
        <div class="hero-cta">
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
                  <span>Give</span>
                </a>
                <a href="/find" class="action-btn action-btn--find">
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
        </div>
      </div>

      <!-- Sample Offers -->
      <div class="sample-section">
        <client-only>
          <MobileVisualiseList class="sample-grid" />
          <template #fallback>
            <div class="loading-grid-ssr">
              <div v-for="i in 4" :key="i" class="loading-card-ssr">
                <div class="loading-shimmer-ssr"></div>
              </div>
            </div>
          </template>
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
      <MainFooter class="mobile-footer" />
    </div>

    <!-- Desktop Layout (original structure) -->
    <div class="d-none d-md-block desktop-layout">
      <div class="grid m-0 mt-lg-5 ml-2 mr-2">
        <div class="eyecandy d-flex justify-content-start flex-column">
          <FreeglerPhotos class="ps-4 h-100" />
        </div>
        <div class="info">
          <h1 class="text--largest-responsive">
            Freegle - like online dating for stuff.
          </h1>
          <p class="text--medium-responsive black font-weight-bold">
            Got stuff you don't need? Looking for something?
          </p>
          <p class="text--medium-responsive black font-weight-bold">
            We'll match you with someone local. All completely free.
          </p>
          <div class="d-flex justify-content-lg-start w-100">
            <client-only>
              <b-button
                variant="primary"
                size="xl"
                to="/give"
                class="text--medium-responsive"
                @click="clicked('give')"
              >
                Give Stuff
              </b-button>
              <div style="width: 4vw" class="d-none d-lg-block" />
              <b-button
                variant="secondary"
                size="xl"
                to="/find"
                class="text--medium-responsive"
                @click="clicked('ask')"
              >
                Ask for Stuff
              </b-button>
              <template #fallback>
                <a
                  href="/give"
                  class="btn btn-xl btn-primary text--medium-responsive"
                >
                  Give Stuff
                </a>
                <div style="width: 4rem" class="d-none d-lg-block" />
                <a
                  href="/find"
                  class="btn btn-xl btn-secondary text--medium-responsive"
                >
                  Ask for Stuff
                </a>
              </template>
            </client-only>
          </div>
          <div
            class="font-weight-bold text-header text--medium-responsive mt-3 mb-4"
          >
            Don't throw it away, give it away!
          </div>
          <h2 class="text--medium-responsive font-weight-bold black">
            Just looking?
          </h2>
          <div class="d-flex justify-content-lg-start flex-wrap">
            <client-only>
              <PlaceAutocomplete
                class="mb-2"
                labeltext="See what's being freegled near you:"
                labeltext-sr="Enter your location and"
                @selected="explorePlace($event)"
              />
            </client-only>
          </div>
        </div>
        <div v-if="!isApp" class="app-download mt-2">
          <a
            href="https://play.google.com/store/apps/details?id=org.ilovefreegle.direct"
            target="_blank"
            class="mr-2"
            rel="noopener noreferrer"
          >
            <ProxyImage
              preload
              alt="Freegle Android app on Google Play"
              title="Freegle Android app on Google Play"
              class="app-download__image"
              src="/en-play-badge.png"
              sizes="75px"
            />
          </a>
          <a
            href="https://itunes.apple.com/gb/app/freegle/id970045029?ls=1&amp;mt=8"
            target="_blank"
            rel="noopener noreferrer"
          >
            <ProxyImage
              preload
              alt="Freegle app for iPhone, iPad, and iPod touch"
              title="Freegle app for iPhone, iPad, and iPod Touch"
              class="app-download__image"
              src="/app-store-black-sm.png"
              sizes="75px"
            />
          </a>
        </div>
        <MainFooter class="thefooter" />
      </div>
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
import FreeglerPhotos from '~/components/FreeglerPhotos.vue'
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

const bg = proxy + '?url=' + userSite + '/wallpaper.png&output=webp'
const logo = proxy + '?url=' + userSite + '/icon.png&output=webp&w=58'

head.link = [
  {
    rel: 'preload',
    as: 'image',
    href: logo,
  },
  {
    rel: 'preload',
    as: 'image',
    href: bg,
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

// ==========================================
// Mobile Layout Styles
// ==========================================

.landing-page {
  min-height: 100vh;
}

.mobile-layout {
  padding: 0;
  background: linear-gradient(
    180deg,
    $color-green--bg-gradient 0%,
    $color-white 35%
  );
  min-height: 100vh;
}

// Hero Section
.hero-section {
  text-align: center;
}

.hero-frame {
  position: relative;
  max-width: min(100%, 38vh);
  margin: 0 auto;
}

// Slogan positioned just below photo, overlapping with gold frame border
// Spans full width of frame opening for visual balance
.hero-slogan {
  position: absolute;
  bottom: 6%;
  left: 12%;
  right: 12%;
  z-index: 20;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  text-align: center;
}

.hero-title {
  font-size: clamp(0.75rem, 2.5vh, 1.2rem);
  font-weight: 700;
  line-height: 1.15;
  margin: 0;
  color: $colour-header;
}

.hero-line1 {
  display: block;
}

.hero-line2 {
  display: block;
  color: $colour-success;
}

// CTA section below frame
.hero-cta {
  padding: 0.5rem 1rem 0.75rem;
  text-align: center;
}

.hero-subtitle {
  font-size: 0.95rem;
  color: $color-gray--darker;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

// Action Buttons - compact
.action-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin-top: 0.5rem;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.6rem 1.25rem;
  font-size: 0.95rem;
  font-weight: 600;
  text-decoration: none;
  transition: transform 0.1s, box-shadow 0.15s;
  min-width: 100px;

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
  // Hide the label - we have our own
  :deep(label) {
    display: none !important;
  }

  :deep(.form-control) {
    border: 1px solid $color-gray--light;
    padding: 0.6rem 0.75rem;
    font-size: 0.9rem;
    background: $color-gray--lighter;
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

  // Hide any extra elements that might show as white boxes
  :deep(.input-group-text),
  :deep(.btn),
  :deep(.autocomplete-clear) {
    display: none !important;
  }
}

// SSR fallback input - matches browse-input styling exactly
.browse-input-ssr {
  width: 100%;
  border: 1px solid $color-gray--light;
  padding: 0.6rem 0.75rem;
  font-size: 0.9rem;
  background: $color-gray--lighter;
  text-align: center;

  &::placeholder {
    color: $color-gray--normal;
    text-align: center;
  }
}

// Sample Offers Section
.sample-section {
  padding: 0.5rem;
}

// App Download Section
.app-section {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: $color-gray--lighter;
}

.app-badge {
  height: 32px;
  width: auto;
}

// Mobile Footer
.mobile-footer {
  padding: 0.75rem 1rem;
  background: $color-white;
}

// ==========================================
// Desktop Layout Styles (original)
// ==========================================

.desktop-layout {
  .grid {
    display: grid;
    grid-template-columns: 0.4fr 0.6fr;
    grid-template-rows: 100px auto auto auto;
    grid-column-gap: 50px;
    grid-row-gap: 30px;
  }

  .eyecandy {
    align-items: center !important;
    height: 300px;

    @include media-breakpoint-up(lg) {
      grid-row: 1 / 3;
      grid-column: 1 / 2;
      height: max(500px, calc(100vh - 450px));

      @supports (height: 100dvh) {
        height: max(500px, calc(100dvh - 450px));
      }

      max-height: 800px;
    }
  }

  .info {
    grid-row: 1 / 3;
    grid-column: 1 / 3;
    text-align: center;
    justify-self: center;

    @include media-breakpoint-up(lg) {
      grid-column: 2 / 3;
      text-align: left;
    }
  }

  .app-download {
    grid-row: 4 / 5;
    grid-column: 1 / 3;
    justify-self: center;

    @include media-breakpoint-up(lg) {
      grid-row: 3 / 4;
    }
  }

  .app-download__image {
    max-height: 25px;

    @include media-breakpoint-up(lg) {
      max-height: 40px;
    }
  }

  .thefooter {
    grid-row: 5 / 6;
    grid-column: 1 / 3;

    @include media-breakpoint-up(lg) {
      grid-row: 4 / 5;
    }
  }
}

.black {
  color: $color-black !important;
}
</style>
