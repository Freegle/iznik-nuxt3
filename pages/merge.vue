<template>
  <div class="merge-page">
    <div class="merge-page__content">
      <NoticeMessage v-if="invalid" variant="danger">
        <p>
          That request isn't valid. Perhaps you've already merged? Or maybe
          clicked on the wrong link.
        </p>
        <p>
          If you continue to have problems, please contact our support
          volunteers at
          <SupportLink />.
        </p>
      </NoticeMessage>
      <div v-else-if="merge">
        <p class="merge-page__intro">We think you have two Freegle accounts.</p>
        <ul>
          <li>
            <!-- eslint-disable-next-line-->
              <strong>{{ merge.user1.name }} <span v-if="merge.user1.email">({{ merge.user1.email }})</span></strong> You have signed in to this with {{ u1logins }}.
          </li>
          <li>
            <!-- eslint-disable-next-line-->
              <strong>{{ merge.user2.name }} <span v-if="merge.user2.email">({{ merge.user2.email }})</span></strong> You have signed in to this with {{ u2logins }}.
          </li>
        </ul>
        <div v-if="rejected">
          <NoticeMessage variant="info" class="mb-2">
            Ok, we'll keep them separate. Thanks for letting us know.
          </NoticeMessage>
          <p>You can close this page now, or:</p>
          <b-button size="lg" to="/" variant="primary" class="mb-2">
            Continue
          </b-button>
        </div>
        <div v-else-if="!merging">
          <p>This can cause you to miss messages.</p>
          <p>Would you like to combine them into a single account?</p>
          <div class="d-flex justify-content-between mb-2">
            <b-button variant="primary" @click="mergeit"> Yes please </b-button>
            <b-button variant="warning" @click="reject"> No thanks </b-button>
          </div>
        </div>
        <div v-else>
          <hr />
          <p>
            Ok, let's merge them. We need to know which email address you
            prefer.
          </p>
          <p>This is my main email address:</p>
          <b-form-select v-model="preferred" class="mt-1 mb-1">
            <option :value="null">-- Please choose --</option>
            <option :value="merge.user1.id">
              {{ merge.user1.email }}
            </option>
            <option :value="merge.user2.id">
              {{ merge.user2.email }}
            </option>
          </b-form-select>
          <SpinButton
            v-if="preferred"
            class="mt-2"
            variant="primary"
            size="lg"
            icon-name="angle-double-right"
            @handle="combine"
          />
          <div v-if="mergeComplete">
            <hr />
            <p>
              We've merged your accounts. Please check your name in
              <!-- eslint-disable-next-line-->
                <nuxt-link to="/settings">Settings</nuxt-link>
              to make sure it's what you want it to be.
            </p>
            <p>You can close this page now, or:</p>
            <b-button size="lg" to="/" variant="primary" class="mb-2">
              Continue
            </b-button>
          </div>
          <hr />
          <p>
            If you have problems or questions, please contact our support
            volunteers at
            <!-- eslint-disable-next-line -->
              <ExternalLink href="mailto:geeks@ilovefreegle.org">geeks@ilovefreegle.org</ExternalLink>
            >
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { useRoute } from 'vue-router'
import { ref, computed, useRuntimeConfig, defineAsyncComponent } from '#imports'
import SpinButton from '~/components/SpinButton'
import NoticeMessage from '~/components/NoticeMessage'
import Api from '~/api'
import SupportLink from '~/components/SupportLink'

const ExternalLink = defineAsyncComponent(() =>
  import('~/components/ExternalLink')
)

const route = useRoute()
const id = route.query.id
const uid = route.query.uid
const runtimeConfig = useRuntimeConfig()
const api = Api(runtimeConfig)

const merge = ref(null)
const invalid = ref(false)
const merging = ref(false)
const rejected = ref(false)
const preferred = ref(null)
const mergeComplete = ref(false)

// Initial fetch of merge data
try {
  merge.value = await api.merge.fetch({
    id,
    uid,
  })
} catch (e) {}

if (!merge.value?.id || !merge.value.user1?.id || !merge.value.user2?.id) {
  invalid.value = true
}

function logins(user) {
  const ret = []

  user.logins.forEach((login) => {
    switch (login.type) {
      case 'Native': {
        ret.push('Email/Password')
        break
      }
      case 'Facebook': {
        ret.push('Facebook')
        break
      }
      case 'Yahoo': {
        ret.push('Yahoo')
        break
      }
      case 'Google': {
        ret.push('Google')
        break
      }
    }
  })

  return [...new Set(ret)].join(', ')
}

const u1logins = computed(() => {
  return merge.value ? logins(merge.value.user1) : ''
})

const u2logins = computed(() => {
  return merge.value ? logins(merge.value.user2) : ''
})

function mergeit() {
  merging.value = true
}

function reject() {
  rejected.value = true

  api.merge.reject({
    id,
    uid,
    user1: merge.value.user1.id,
    user2: merge.value.user2.id,
  })
}

async function combine(callback) {
  await api.merge.accept({
    id,
    uid,
    user1: preferred.value,
    user2:
      preferred.value === merge.value.user1.id
        ? merge.value.user2.id
        : merge.value.user1.id,
  })

  mergeComplete.value = true
  callback()
}
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';
@import 'assets/css/_color-vars.scss';

.merge-page {
  background: $color-gray--lighter;
  min-height: 100vh;
  padding: 1rem;

  @include media-breakpoint-up(md) {
    padding: 1.5rem;
  }
}

.merge-page__content {
  max-width: 600px;
  margin: 0 auto;
  background: white;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.merge-page__intro {
  font-size: 0.95rem;
  color: $gray-700;
  margin-bottom: 1rem;
}
</style>
