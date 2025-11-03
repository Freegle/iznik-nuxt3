<template>
  <client-only>
    <div class="layout fader">
      <div class="d-none d-md-flex justify-content-around">
        <WizardProgress :active-stage="3" class="maxbutt" />
      </div>
      <h1 class="text-center">Finally, your email address</h1>
      <div class="text-center">
        <PostLoggedInEmail v-if="loggedIn" />
        <div v-else>
          <p>
            We need your email address to let you know when you have replies. We
            won't give your email to anyone else.
          </p>
          <p>
            You will get emails from us, which you can control or turn off from
            Settings. Read
            <nuxt-link no-prefetch target="_blank" to="/terms">
              Terms of Use
            </nuxt-link>
            and
            <nuxt-link no-prefetch target="_blank" to="/privacy">
              Privacy
            </nuxt-link>
            for details.
          </p>
          <p>
            We may show this post to people who are not yet members of Freegle.
            This helps the community grow by showing people what's happening and
            encouraging them to join.
          </p>
          <EmailValidator
            v-model:email="email"
            v-model:valid="emailValid"
            center
            class="align-items-center font-weight-bold"
          />
          <EmailBelongsToSomeoneElse
            v-if="emailValid && emailBelongsToSomeoneElse"
            class="mb-2"
            :theirs="email"
          />
        </div>
      </div>
      <div class="d-block d-md-none flex-grow-1" />
      <div class="mt-1 d-block d-md-none">
        <b-button
          v-if="
            previousScreensValid &&
            emailValid &&
            !submitting &&
            !emailBelongsToSomeoneElse
          "
          variant="primary"
          size="lg"
          block
          class="w-100"
          @click="next"
        >
          Freegle it! <v-icon icon="angle-double-right" />
        </b-button>
      </div>
      <div class="mt-3 mb-5 d-none d-md-flex">
        <div class="w-100 d-flex justify-content-around">
          <div class="mt-2 d-flex justify-content-between maxbutt">
            <div>
              <b-button
                variant="secondary"
                size="lg"
                to="/give/whereami"
                class="d-none d-md-block"
              >
                <v-icon icon="angle-double-left" /> Back
              </b-button>
            </div>
            <div>
              <b-button
                v-if="emailValid && !submitting && !emailBelongsToSomeoneElse"
                variant="primary"
                size="lg"
                @click="next"
              >
                Freegle it! <v-icon icon="angle-double-right" />
              </b-button>
            </div>
          </div>
        </div>
        <div v-if="submitting" class="d-flex justify-content-around pt-2 mt-2">
          <b-progress
            height="48px"
            class="mt-2 w-25"
            animated
            variant="success"
          >
            <b-progress-bar :value="progress" />
          </b-progress>
        </div>
        <div v-else class="d-flex justify-content-around pt-2 mt-2">
          <NoticeMessage v-if="notAllowed" variant="danger">
            You are not allowed to post on this community.
          </NoticeMessage>
          <NoticeMessage v-else-if="unvalidatedEmail" variant="danger">
            You tried to post using an email address which has not yet been
            validated. Please check your mailbox (including spam) and validate
            the email, then try again.
          </NoticeMessage>
          <NoticeMessage v-else-if="wentWrong" variant="danger">
            <!-- eslint-disable-next-line -->
            Something went wrong.  Please try again, and if this keeps happening then contact
            <SupportLink />.
          </NoticeMessage>
        </div>
      </div>
    </div>
  </client-only>
</template>
<script setup>
import {
  ref,
  watch,
  onMounted,
  useRoute,
  useHead,
  useRuntimeConfig,
  useRouter,
  storeToRefs,
} from '#imports'
import { useComposeStore } from '~/stores/compose'
import { useUserStore } from '~/stores/user'
import { buildHead } from '~/composables/useBuildHead'
import EmailValidator from '~/components/EmailValidator.vue'
import NoticeMessage from '~/components/NoticeMessage.vue'
import SupportLink from '~/components/ExternalLink.vue'
import EmailBelongsToSomeoneElse from '~/components/EmailBelongsToSomeoneElse.vue'
import PostLoggedInEmail from '~/components/PostLoggedInEmail.vue'
import { setup, freegleIt } from '~/composables/useCompose'
import WizardProgress from '~/components/WizardProgress.vue'
import { useMe } from '~/composables/useMe'

const route = useRoute()
const router = useRouter()
const runtimeConfig = useRuntimeConfig()
const composeStore = useComposeStore()
const userStore = useUserStore()
const { me } = useMe()

// Data properties
const emailValid = ref(false)
const emailBelongsToSomeoneElse = ref(false)
const previousScreensValid = computed(
  () => messageValid && postcodeValid && loggedIn
)

// Get store state
const { email, progress } = storeToRefs(composeStore)

// Head
useHead(
  buildHead(
    route,
    runtimeConfig,
    'OFFER',
    'OFFER something to people nearby and see who wants it'
  )
)

// Get setup data from composable
const {
  messageValid,
  postcodeValid,
  loggedIn,
  emailIsntOurs,
  submitting,
  notAllowed,
  unvalidatedEmail,
  wentWrong,
} = await setup('Offer')

// Methods
async function next() {
  emailBelongsToSomeoneElse.value = false

  if (emailIsntOurs.value) {
    // Need to check if it's ok to use.
    console.log('Not ours')
    const inuse = await userStore.emailIsInUse(email.value)

    if (!inuse) {
      // Not in use - that's ok.
      console.log('Not in use')
      await freegleIt('Offer', router)
    } else {
      // We can't proceed.
      console.log('Belongs to someone else')
      emailBelongsToSomeoneElse.value = true
    }
  } else {
    console.log('One of ours')
    await freegleIt('Offer', router)
  }
}

onMounted(() => {
  if (loggedIn.value) {
    email.value = me.value?.email
    emailValid.value = email.value?.length > 0
  }
})

watch(email, () => {
  emailBelongsToSomeoneElse.value = false
})
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';
@import 'assets/css/sticky-banner.scss';

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
