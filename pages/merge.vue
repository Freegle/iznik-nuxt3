<template>
  <div>
    <b-row class="m-0">
      <b-col cols="0" md="3" />
      <b-col cols="12" md="6" class="bg-white">
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
          <h1>Merge accounts</h1>
          <p>We think you have two Freegle accounts.</p>
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
              <b-button variant="primary" @click="mergeit">
                Yes please
              </b-button>
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
            </p>
          </div>
        </div>
      </b-col>
    </b-row>
  </div>
</template>
<script>
import { useRoute } from 'vue-router'
import SpinButton from '~/components/SpinButton'
import NoticeMessage from '~/components/NoticeMessage'
import api from '~/api'
const ExternalLink = () => import('~/components/ExternalLink')

export default {
  components: {
    SpinButton,
    NoticeMessage,
    ExternalLink,
  },
  async setup() {
    const route = useRoute()
    const id = route.query.id
    const uid = route.query.uid
    const runtimeConfig = useRuntimeConfig()

    let merge = null

    try {
      merge = await api(runtimeConfig).merge.fetch({
        id,
        uid,
      })
    } catch (e) {}

    let invalid = false

    if (!merge?.id || !merge.user1?.id || !merge.user2?.id) {
      invalid = true
    }

    return {
      id,
      uid,
      merge,
      invalid,
    }
  },
  data() {
    return {
      merging: false,
      rejected: false,
      preferred: null,
      mergeComplete: false,
    }
  },
  computed: {
    u1logins() {
      return this.logins(this.merge.user1)
    },
    u2logins() {
      return this.logins(this.merge.user2)
    },
  },
  async mounted() {
    // Get the merge request.
  },
  methods: {
    logins(user) {
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
    },
    mergeit() {
      this.merging = true
    },
    reject() {
      this.rejected = true

      this.$api.merge.reject({
        id: this.id,
        uid: this.uid,
        user1: this.merge.user1.id,
        user2: this.merge.user2.id,
      })
    },
    async combine(callback) {
      await this.$api.merge.accept({
        id: this.id,
        uid: this.uid,
        user1: this.preferred,
        user2:
          this.preferred === this.merge.user1.id
            ? this.merge.user2.id
            : this.merge.user1.id,
      })

      this.mergeComplete = true
      callback()
    },
  },
}
</script>
