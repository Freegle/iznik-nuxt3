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
          <b-input-group-append>
            <SpinButton
              variant="secondary"
              icon-name="save"
              label="Save"
              @handle="setPassword"
            />
          </b-input-group-append>
        </b-input-group>
      </div>
      <p class="mt-2 text-center text-muted">
        You can also log in later with your Facebook, Google or Yahoo account
        for that email address if you have one.
      </p>
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

    return {
      authStore,
    }
  },
  data() {
    return {
      newPassword: null,
    }
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
