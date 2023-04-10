<template>
  <client-only>
    <div class="layout fader">
      <div class="d-none d-md-flex justify-content-around">
        <WizardProgress :active-stage="3" class="maxbutt" />
      </div>
      <h1 class="text-center">Finally, your email address</h1>
      <div class="text-center">
        <p class="text-muted">
          We need your email address to let you know when you have replies. We
          won't give your email to anyone else.
        </p>
        <p class="text-muted">
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
        <p class="text-muted">
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
          :ours="me?.email"
          :theirs="email"
        />
      </div>
      <div class="d-block d-md-none flex-grow-1" />
      <div class="d-block d-md-none margbott">
        <b-button
          v-if="emailValid && !submitting"
          variant="primary"
          size="lg"
          block
          class="w-100"
          @click="next"
        >
          Freegle it! <v-icon icon="angle-double-right" />
        </b-button>
      </div>
      <div class="w-100 d-flex justify-content-around">
        <div class="mt-2 d-none d-md-flex justify-content-between maxbutt">
          <b-button
            variant="secondary"
            size="lg"
            to="/give/whereami"
            class="d-none d-md-block"
          >
            <v-icon icon="angle-double-left" /> Back
          </b-button>
          <b-button
            v-if="emailValid && !submitting"
            variant="primary"
            size="lg"
            @click="next"
          >
            Freegle it! <v-icon icon="angle-double-right" />
          </b-button>
        </div>
      </div>
      <div v-if="submitting" class="text-center pt-2 mt-2">
        <NoticeMessage v-if="notAllowed" variant="danger">
          You are not allowed to post on this community.
        </NoticeMessage>
        <NoticeMessage v-else-if="wentWrong" variant="danger">
          <!-- eslint-disable-next-line -->
                Something went wrong.  Please try again, and if this keeps happening then contact
          <SupportLink />.
        </NoticeMessage>
        <b-progress
          v-else
          height="48px"
          class="mt-2"
          animated
          variant="success"
        >
          <b-progress-bar :value="progress" />
        </b-progress>
      </div>
    </div>
  </client-only>
</template>
<script>
import { mapWritableState } from 'pinia'
import { useRoute } from 'vue-router'
import { useComposeStore } from '../../stores/compose'
import { useUserStore } from '../../stores/user'
import { buildHead } from '../../composables/useBuildHead'
import { useRouter } from '#imports'
import EmailValidator from '~/components/EmailValidator'
import NoticeMessage from '~/components/NoticeMessage'
import SupportLink from '~/components/ExternalLink'
import EmailBelongsToSomeoneElse from '~/components/EmailBelongsToSomeoneElse'
import { setup, freegleIt } from '~/composables/useCompose'
import WizardProgress from '~/components/WizardProgress'

export default {
  components: {
    SupportLink,
    NoticeMessage,
    EmailBelongsToSomeoneElse,
    EmailValidator,
    WizardProgress,
  },
  async setup() {
    const runtimeConfig = useRuntimeConfig()
    const route = useRoute()

    useHead(
      buildHead(
        route,
        runtimeConfig,
        'OFFER',
        'OFFER something to people nearby and see who wants it'
      )
    )

    return await setup('Offer')
  },
  data() {
    return {
      id: null,
      postType: 'Offer',
      emailValid: false,
      emailBelongsToSomeoneElse: false,
    }
  },
  computed: {
    ...mapWritableState(useComposeStore, ['email', 'progress']),
  },
  mounted() {
    const router = useRouter()

    if (!this.messageValid) {
      router.push('/give')
    }

    if (!this.postcodeValid) {
      router.push('/give/whereami')
    }
  },
  methods: {
    async next() {
      this.emailBelongsToSomeoneElse = false
      const router = useRouter()

      if (this.emailIsntOurs) {
        // Need to check if it's ok to use.
        console.log('Not ours')
        const userStore = useUserStore()
        const inuse = await userStore.emailIsInUse(this.email)

        if (!inuse) {
          // Not in use - that's ok.
          console.log('Not in use')
          await freegleIt.call(this, 'Offer', router)
        } else {
          // We can't proceed.
          console.log('Belongs to someone else')
          this.emailBelongsToSomeoneElse = true
        }
      } else {
        console.log('One of ours')
        await freegleIt.call(this, 'Offer', router)
      }
    },
  },
}
</script>
<style scoped lang="scss">
@import '~bootstrap/scss/functions';
@import '~bootstrap/scss/variables';
@import '~bootstrap/scss/mixins/_breakpoints';

.fader {
  background-color: rgba(246, 246, 236, 0.6);
  box-shadow: 0 0 80px 450px rgba(246, 246, 236, 0.6);
  font-weight: bold;
}

@include media-breakpoint-down(md) {
  .layout {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding-bottom: 84px;
  }
}

.maxbutt {
  width: 33vw;
}

.margbott {
  margin-bottom: 50px;
}
</style>
