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
<script setup>
import { ref, watch } from 'vue'
import SpinButton from './SpinButton'
import SettingsGroup from './SettingsGroup'
import { useAuthStore } from '~/stores/auth'
import { useMe } from '~/composables/useMe'

defineProps({
  password: {
    type: String,
    required: true,
  },
})

const authStore = useAuthStore()
const { me, myGroups } = useMe()
const emailSimple = ref(-1)
const newPassword = ref(null)

watch(emailSimple, async (value) => {
  for (const group of myGroups.value) {
    const params = {
      userid: me.id,
      groupid: group.id,
    }
    params.emailfrequency = value

    // Don't fetch for each group.
    await authStore.setGroup(params, true)
  }

  await authStore.fetchUser()
})

async function setPassword(callback) {
  if (newPassword.value) {
    await authStore.saveAndGet({
      password: newPassword.value,
    })
  }
  callback()
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
