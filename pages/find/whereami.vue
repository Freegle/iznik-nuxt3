<template>
  <client-only>
    <div class="layout fader">
      <GlobalMessage />
      <div class="d-none d-md-flex justify-content-around">
        <WizardProgress :active-stage="2" class="maxbutt" />
      </div>
      <h1 class="text-center">Now, tell us where you are</h1>
      <p class="text-center">
        We'll use this to show your wanted to people nearby. Don't worry, we
        won't give other people your postcode.
      </p>
      <PostCode
        class="justify-content-center"
        :value="initialPostcode"
        @selected="postcodeSelect"
        @cleared="postcodeClear"
      />
      <div v-if="!closed && postcodeValid" class="text-center">
        <transition name="fade">
          <nuxt-link no-prefetch to="/find/whoami">
            <v-icon
              icon="check-circle"
              class="text-success mt-2 fa-bh"
              scale="5"
            />
          </nuxt-link>
        </transition>
      </div>
      <div
        v-if="postcodeValid && noGroups"
        class="d-flex justify-content-around"
      >
        <NoticeMessage variant="info" class="mt-2 flex-shrink-1">
          We're really sorry, but there are no communities near there. If you'd
          like to start one, please
          <ExternalLink href="mailto:newgroups@ilovefreegle.org">
            get in touch!
          </ExternalLink>
        </NoticeMessage>
      </div>
      <div v-else>
        <div v-if="postcodeValid" class="mt-1 text-center">
          Freegle has local communities for each area. We'll put anything you
          post on here, and search this community and others nearby.
        </div>
        <div v-if="postcodeValid" class="mt-1 d-flex justify-content-around">
          <ComposeGroup />
        </div>
        <div v-if="postcodeValid" class="mt-1 text-center text-muted small">
          Click on the name above to choose a different community.
        </div>
      </div>
      <div class="d-block d-md-none flex-grow-1" />
      <div class="mt-1 d-block d-md-none">
        <b-button
          variant="primary"
          size="lg"
          block
          class="w-100"
          to="/find/whoami"
        >
          Next <v-icon icon="angle-double-right" />
        </b-button>
      </div>
      <div class="w-100 d-flex justify-content-around">
        <div class="mt-2 d-none d-md-flex justify-content-between maxbutt">
          <b-button
            variant="secondary"
            size="lg"
            to="/find"
            class="d-none d-md-block"
          >
            <v-icon icon="angle-double-left" /> Back
          </b-button>
          <b-button
            v-if="postcodeValid && !closed"
            variant="primary"
            size="lg"
            to="/find/whoami"
          >
            Next <v-icon icon="angle-double-right" />
          </b-button>
        </div>
      </div>
    </div>
  </client-only>
</template>
<script>
import { useRoute } from 'vue-router'
import { buildHead } from '../../composables/useBuildHead'
import NoticeMessage from '~/components/NoticeMessage'
import ExternalLink from '~/components/ExternalLink'
import GlobalMessage from '~/components/GlobalMessage'
import PostCode from '~/components/PostCode'
import { setup, postcodeSelect, postcodeClear } from '~/composables/useCompose'

import WizardProgress from '~/components/WizardProgress'
import ComposeGroup from '~/components/ComposeGroup'

export default {
  options: () => {},
  components: {
    ExternalLink,
    GlobalMessage,
    NoticeMessage,
    PostCode,
    ComposeGroup,
    WizardProgress,
  },
  async setup() {
    const route = useRoute()
    const runtimeConfig = useRuntimeConfig()

    useHead(
      buildHead(
        route,
        runtimeConfig,
        'WANTED',
        "Ask people nearby if they have what you're looking for"
      )
    )

    return await setup('Wanted')
  },
  data() {
    return {
      id: null,
    }
  },
  computed: {
    source() {
      const runtimeConfig = useRuntimeConfig()
      return runtimeConfig.public.APIv1 + '/locations?typeahead='
    },
  },
  methods: {
    postcodeSelect,
    postcodeClear,
  },
}
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';
@import 'assets/css/sticky-banner.scss';

select {
  max-width: 400px !important;
}

.fader {
  background-color: rgba(246, 246, 236, 0.6);
  box-shadow: 0 0 80px 450px rgba(246, 246, 236, 0.6);
  font-weight: bold;
}

@include media-breakpoint-down(md) {
  .layout {
    //We need to subtract space for the navbar, the ad bar, and also allow some extra because of the way vh works
    //mobile browsers.
    min-height: calc(100vh - 84px - $sticky-banner-height-mobile - 84px);

    @media (min-height: $mobile-tall) {
      min-height: calc(100vh - 84px - $sticky-banner-height-mobile-tall - 84px);
    }

    @supports (height: 100dvh) {
      min-height: calc(100dvh - 84px - $sticky-banner-height-mobile - 84px);

      @media (min-height: $mobile-tall) {
        min-height: calc(
          100dvh - 84px - $sticky-banner-height-mobile-tall - 84px
        );
      }
    }

    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
}

.maxbutt {
  width: 33vw;
}
</style>
