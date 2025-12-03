<template>
  <div class="new-user-info">
    <div class="welcome-header">
      <v-icon icon="hand-sparkles" class="welcome-icon" />
      <h5 class="welcome-title">Welcome to Freegle!</h5>
      <p class="welcome-subtitle">
        It looks like this is your first time. Hello!
      </p>
    </div>

    <div class="info-card">
      <div class="card-header">
        <v-icon icon="key" class="header-icon" />
        <h6 class="header-title">Your Account Password</h6>
      </div>
      <div class="card-content">
        <p class="password-intro">We've emailed a password to you:</p>
        <div class="password-display">
          <span class="password-value">{{ password }}</span>
        </div>
        <p class="password-alt">...or set your own:</p>
        <div class="password-input">
          <b-input-group>
            <b-form-input
              v-model="newPassword"
              type="password"
              placeholder="Enter new password"
            />
            <template #append>
              <SpinButton
                variant="primary"
                icon-name="save"
                label="Save"
                @handle="setPassword"
              />
            </template>
          </b-input-group>
        </div>
        <p class="login-hint">
          <v-icon icon="info-circle" class="hint-icon" />
          You can also log in with Facebook, Google, or Yahoo.
        </p>
      </div>
    </div>

    <div v-if="me" class="info-card">
      <div class="card-header">
        <v-icon icon="envelope" class="header-icon" />
        <h6 class="header-title">Email Preferences</h6>
      </div>
      <div class="card-content">
        <p class="email-intro">
          How often do you want to receive OFFERs and WANTEDs?
        </p>
        <div class="settings-wrapper">
          <SettingsGroup
            v-model:emailfrequency="emailSimple"
            eventshide
            volunteerhide
            label="Choose OFFER/WANTED frequency:"
          />
        </div>
      </div>
    </div>
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
@import 'assets/css/_color-vars.scss';

.new-user-info {
  max-width: 500px;
  margin: 0 auto;
}

.welcome-header {
  text-align: center;
  padding: 1.5rem 1rem;
  margin-bottom: 1rem;

  .welcome-icon {
    font-size: 2.5rem;
    color: $colour-success;
    margin-bottom: 0.75rem;
  }

  .welcome-title {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0 0 0.25rem 0;
    color: $color-gray--darker;
  }

  .welcome-subtitle {
    font-size: 0.9rem;
    color: $color-gray--dark;
    margin: 0;
  }
}

.info-card {
  background: white;
  margin-bottom: 1rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: $color-gray--lighter;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);

  .header-icon {
    color: $colour-success;
  }

  .header-title {
    font-size: 0.95rem;
    font-weight: 600;
    margin: 0;
    color: $color-gray--darker;
  }
}

.card-content {
  padding: 1rem;
}

.password-intro,
.password-alt,
.email-intro {
  font-size: 0.9rem;
  color: $color-gray--dark;
  margin-bottom: 0.75rem;
  text-align: center;
}

.password-display {
  background: $color-gray--lighter;
  padding: 1rem;
  text-align: center;
  margin-bottom: 1rem;

  .password-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: $colour-success;
    letter-spacing: 0.1em;
  }
}

.password-input {
  max-width: 300px;
  margin: 0 auto 1rem;
}

.login-hint {
  font-size: 0.8rem;
  color: $color-gray--dark;
  text-align: center;
  margin: 0;

  .hint-icon {
    margin-right: 0.25rem;
  }
}

.settings-wrapper {
  :deep(legend) {
    display: none;
  }

  :deep(select) {
    min-width: 200px;
  }
}
</style>
