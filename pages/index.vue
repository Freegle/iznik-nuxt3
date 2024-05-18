<template>
  <div
    v-if="!me"
    class="grid m-0 pl-1 pr-1 pl-sm-0 pr-sm-0 mt-0 mt-lg-5 ml-2 mr-2"
  >
    <client-only>
      <div class="d-none d-sm-flex eyecandy justify-content-start flex-column">
        <VisualiseMap v-if="type === 'Map'" class="shadow flex-grow-1" />
        <FreeglerPhotos v-else-if="type === 'Photos'" class="ps-4 h-100" />
        <div v-else-if="type === 'Song'" class="w-100">
          <b-img
            v-if="!timeToPlay"
            fluid
            src="/songpreview.png"
            class="flex-grow-1 w-100"
            @click="play"
          />
          <video
            v-else
            autoplay="autoplay"
            controls="controls"
            poster="/songpreview.png"
            loop="loop"
            src="/song.mp4"
            class="embed-responsive-item shadow flex-grow-1 w-100 bg-secondary"
          ></video>
        </div>
      </div>
    </client-only>
    <div class="info">
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
      <div class="d-flex justify-content-between justify-content-lg-start">
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
        <PlaceAutocomplete
          class="mb-2"
          labeltext="See what's being freegled near you:"
          labeltext-sr="Enter your location and"
          @selected="explorePlace($event)"
        />
      </div>
      <VisualiseList class="mb-2 d-block d-sm-none" />
    </div>
    <client-only>
      <div v-if="!isApp" class="app-download mt-2">
        <a
          href="https://play.google.com/store/apps/details?id=org.ilovefreegle.direct"
          target="_blank"
          class="mr-2"
          rel="noopener noreferrer"
        >
          <b-img
            lazy
            alt="Freegle Android app on Google Play"
            title="Freegle Android app on Google Play"
            class="app-download__image"
            src="/en-play-badge.png"
          />
        </a>
        <a
          href="https://itunes.apple.com/gb/app/freegle/id970045029?ls=1&amp;mt=8"
          target="_blank"
          rel="noopener noreferrer"
        >
          <b-img
            lazy
            alt="Freegle app for iPhone, iPad, and iPod touch"
            title="Freegle app for iPhone, iPad, and iPod Touch"
            class="app-download__image"
            src="/app-store-black-sm.png"
          />
        </a>
      </div>
    </client-only>
    <MainFooter class="thefooter" />
  </div>
</template>
<script>
import { useRoute } from 'vue-router'
import { buildHead } from '../composables/useBuildHead'
import { useMiscStore } from '../stores/misc'
import { useMobileStore } from '../stores/mobile'
import MainFooter from '~/components/MainFooter'
import { useRouter } from '#imports'
import api from '~/api'
const VisualiseMap = defineAsyncComponent(() =>
  import('~/components/VisualiseMap')
)
const VisualiseList = defineAsyncComponent(() =>
  import('~/components/VisualiseList')
)

export default {
  components: {
    MainFooter,
    VisualiseMap,
    VisualiseList,
  },
  setup() {
    const runtimeConfig = useRuntimeConfig()
    const route = useRoute()

    useHead(
      buildHead(
        route,
        runtimeConfig,
        "Don't throw it away, give it away!",
        "Freegle - like online dating for stuff. Got stuff you don't need? Looking for something? We'll match you with someone local. All completely free.",
        null,
        {
          class: 'landing',
        }
      )
    )

    const miscStore = useMiscStore()

    return {
      miscStore,
    }
  },
  data() {
    return {
      userWatch: null,
      ourBackground: false,
      type: null,
      timeToPlay: false,
    }
  },
  computed: {
    isApp() {
      const mobileStore = useMobileStore()
      return mobileStore.isApp
    },
  },
  async mounted() {
    if (process.client) {
      // await this.fetchMe(['me', 'groups'])

      if (this.me) {
        this.goHome()
      } else {
        // Ensure we can still load the page if we get an API error.
        try {
          const runtimeConfig = useRuntimeConfig()
          const type = await api(runtimeConfig).bandit.choose({
            uid: 'landing',
          })

          if (type?.variant) {
            this.type = type.variant

            this.$api.bandit.shown({
              uid: 'landing',
              variant: this.type,
            })
          }
        } catch (e) {
          console.error(e)
        }

        if (this.type !== 'Map') {
          // The video plays with sound, wrongly, even if the muted attribute is set.  So set it here.
          setTimeout(() => {
            this.timeToPlay = true
            this.play()
          }, 1000)
        }
      }
    }
  },
  beforeUnmount() {
    if (this.userWatch) {
      this.userWatch()
    }
  },
  methods: {
    goHome() {
      let nextroute = '/browse'

      // Logged in homepage - on client side we want to load the last page, for logged in users.
      try {
        const lastRoute = this.miscStore.get('lasthomepage')

        if (lastRoute === 'news') {
          nextroute = '/chitchat'
        } else if (lastRoute === 'myposts') {
          nextroute = '/myposts'
        }

        const router = useRouter()
        const route = useRoute()

        console.log('route', route)
        if (route.path !== nextroute) {
          console.log('Push', nextroute)
          this.$nextTick(() => {
            router.push(nextroute)
          })
        }
      } catch (e) {
        console.log('Exception', e)
      }
    },
    async clicked(button) {
      await this.$api.bandit.chosen({
        uid: 'landing',
        variant: this.type,
      })

      await this.$api.bandit.chosen({
        uid: 'landing-button',
        variant: this.type + '-' + button,
      })
    },
    async explorePlace(place) {
      await this.$api.bandit.chosen({
        uid: 'landing',
        variant: this.type,
      })

      await this.$api.bandit.chosen({
        uid: 'landing-button',
        variant: this.type + '-place',
      })

      this.$router.push('/explore/place/' + JSON.stringify(place))
    },
    async play() {
      if (process.client) {
        try {
          const videoEl = document.querySelector('video')

          if (videoEl) {
            videoEl.muted = true
            await videoEl.play()
          }
        } catch (e) {
          console.log('Video play failed', e)
        }
      }
    },
  },
}
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

  @include media-breakpoint-up(sm) {
    height: 300px;
  }

  @include media-breakpoint-up(lg) {
    grid-row: 1 / 3;
    grid-column: 1 / 2;
    // 100vh includes the header and margins etc so they need to be taken off
    height: max(500px, calc(100vh - 450px));
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
