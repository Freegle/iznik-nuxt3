<template>
  <div
    v-if="!me"
    class="grid m-0 pl-1 pr-1 pl-sm-0 pr-sm-0 mt-0 mt-lg-5 ml-2 mr-2"
  >
    <div class="d-none d-sm-flex eyecandy justify-content-start flex-column">
      <FreeglerPhotos
        v-if="!breakpoint || breakpoint !== 'xs'"
        class="ps-4 h-100"
      />
    </div>
    <div class="info">
      <client-only>
        <BreakpointFettler />
      </client-only>
      <div class="d-block d-sm-none">
        <h1 class="text--large-responsive">
          Freegle - online dating for stuff.
        </h1>
        <p class="text--medium-responsive black font-weight-bold">
          Got things you don't need? Need stuff?
          <br />
          Match with someone local. Completely free.
        </p>
      </div>
      <div class="d-none d-sm-block">
        <h1 class="text--largest-responsive">
          Freegle - like online dating for stuff.
        </h1>
        <p class="text--medium-responsive black font-weight-bold">
          Got stuff you don't need? Looking for something?
        </p>
        <p class="text--medium-responsive black font-weight-bold">
          We'll match you with someone local. All completely free.
        </p>
      </div>
      <div
        class="d-flex justify-content-between justify-content-lg-start w-100"
      >
        <client-only>
          <b-button
            variant="primary"
            size="xl"
            to="/give"
            class="text--medium-responsive ml-1 ml-sm-0"
            @click="clicked('give')"
          >
            Give Stuff
          </b-button>
          <div style="width: 4vw" class="d-none d-lg-block" />
          <b-button
            variant="secondary"
            size="xl"
            to="/find"
            class="text--medium-responsive mr-1 mr-sm-0"
            @click="clicked('ask')"
          >
            Ask for Stuff
          </b-button>
          <template #fallback>
            <a
              variant="primary"
              size="xl"
              href="/give"
              class="btn btn-xl btn-primary text--medium-responsive ml-1 ml-sm-0"
            >
              Give Stuff
            </a>
            <div style="width: 4rem" class="d-none d-lg-block" />
            <a
              variant="secondary"
              size="xl"
              href="/find"
              class="btn btn-xl btn-secondary text--medium-responsive mr-1 ml-sm-0"
            >
              Ask for Stuff
            </a>
          </template>
        </client-only>
      </div>
      <div
        class="font-weight-bold text-header text--medium-responsive mt-3 mb-4 d-none d-md-block"
      >
        Don't throw it away, give it away!
      </div>
      <h2
        class="text--medium-responsive font-weight-bold black d-none d-md-block"
      >
        Just looking?
      </h2>
      <div
        class="d-flex justify-content-around justify-content-lg-start flex-wrap mt-2 mt-md-0"
      >
        <client-only>
          <PlaceAutocomplete
            class="mb-2"
            labeltext="See what's being freegled near you:"
            labeltext-sr="Enter your location and"
            @selected="explorePlace($event)"
          />
        </client-only>
      </div>
      <client-only>
        <VisualiseList
          v-if="!breakpoint || breakpoint === 'xs'"
          class="mt-2 mb-2 d-block d-sm-none"
        />
      </client-only>
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
</template>
<script setup>
import { useRoute, useRouter } from 'vue-router'
import { buildHead } from '~/composables/useBuildHead'
import { useMiscStore } from '~/stores/misc'
import { useAuthStore } from '~/stores/auth'
import { useMobileStore } from '@/stores/mobile'
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

const VisualiseList = defineAsyncComponent(() =>
  import('~/components/VisualiseList')
)

// Setup
const runtimeConfig = useRuntimeConfig()
const api = Api(runtimeConfig)
const route = useRoute()
const router = useRouter()
const miscStore = useMiscStore()
const mobileStore = useMobileStore()
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

// Computed properties
const breakpoint = computed(() => {
  // We show different stuff on xs screens. In SSR we can't tell what the screen size will be.
  // But removing the irrelevant option from the DOM once the client loads will save some network/CPU.
  return process.server ? null : miscStore.breakpoint
})

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

.black {
  color: $color-black !important;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  grid-template-rows: 0px 1fr 60px minmax(50px, auto);

  @include media-breakpoint-up(sm) {
    grid-template-columns: 0.4fr 0.6fr;
    grid-template-rows: 100px auto auto auto;
    grid-column-gap: 50px;
    grid-row-gap: 30px;
  }
}

.eyecandy {
  grid-row: 3 / 4;
  grid-column: 1 / 3;
  align-items: center !important;

  @include media-breakpoint-up(sm) {
    height: 300px;
  }

  @include media-breakpoint-up(lg) {
    grid-row: 1 / 3;
    grid-column: 1 / 2;
    // 100vh includes the header and margins etc so they need to be taken off
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
  grid-row: 3 / 4;
  grid-column: 1 / 3;
  justify-self: center;

  @include media-breakpoint-up(sm) {
    grid-row: 4 / 5;
  }

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
  grid-row: 4 / 5;
  grid-column: 1 / 3;

  @include media-breakpoint-up(sm) {
    grid-row: 5 / 6;
  }

  @include media-breakpoint-up(lg) {
    grid-row: 4 / 5;
  }
}

.shadow {
  box-shadow: 0px 0px 20px 10px grey !important;

  @include media-breakpoint-down(md) {
    box-shadow: 0px 0px 10px 5px grey !important;
  }

  @include media-breakpoint-down(md) {
    box-shadow: none;
  }
}

.iconlarge {
  min-width: 48px;
}

.explore {
  padding-top: 9px;
  padding-bottom: 9px;
}

main {
  margin-top: 0px;
}
</style>
