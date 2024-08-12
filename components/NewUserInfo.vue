<template>
  <div>
    <h5 class="text-center">
      It looks like this is your first time freegling. Hello!
    </h5>
    <b-card variant="white">
      <h2 class="text-center">Your Account Password</h2>
      <p class="text-center">We've emailed a password to you:</p>
      <div class="d-flex justify-content-around">
        <b-card variant="white">
          <h1 class="text-primary">
            <span class="large">
              {{ password }}
            </span>
          </h1>
        </b-card>
      </div>
      <p class="text-center mt-2">...or you can set your own:</p>
      <div class="d-flex justify-content-around">
        <b-input-group>
          <b-form-input v-model="newPassword" type="password" />
          <slot name="append">
            <SpinButton
              variant="secondary"
              icon-name="save"
              label="Save"
              @handle="setPassword"
            />
          </slot>
        </b-input-group>
      </div>
      <p class="mt-2 text-center text-muted">
        You can also log in later with your Facebook, Google or Yahoo account
        for that email address if you have one.
      </p>
    </b-card>
    <b-card v-if="me" variant="white">
      <h2 class="text-center">How often do you want emails?</h2>
      <p class="text-center">
        We'll email you OFFERs and WANTEDs from other freeglers. How often do
        you want them?
      </p>
      <div class="d-flex justify-content-around w-100 settings">
        <SettingsGroup
          v-model:emailfrequency="emailSimple"
          eventshide
          volunteerhide
          label="Choose OFFER/WANTED frequency:"
        />
      </div>
    </b-card>
  </div>
</template>
<script>
import { useAuthStore } from '../stores/auth'
import SpinButton from './SpinButton'

export default {
  components: { SpinButton },
  props: {
    password: {
      type: String,
      required: true,
    },
  },
  setup() {
    const authStore = useAuthStore()
    const emailSimple = ref(-1)

    return {
      authStore,
      emailSimple,
    }
  },
  data() {
    return {
      newPassword: null,
    }
  },
  watch: {
    async emailSimple(value) {
      for (const group of this.myGroups) {
        const params = {
          userid: this.me.id,
          groupid: group.id,
        }
        params.emailfrequency = value

        // Don't fetch for each group.
        await this.authStore.setGroup(params, true)
      }

      await this.authStore.fetchUser()
    },
  },
  methods: {
    async setPassword(callback) {
      if (this.newPassword) {
        await this.authStore.saveAndGet({
          password: this.newPassword,
        })
      }
      callback()
    },
  },
}
</script>
<style scoped lang="scss">
:deep(.settings) {
  legend {
    display: none;
  }

  select {
    min-width: 200px;
  }
}
</style>
