<template>
  <div class="settings-section">
    <div class="section-header">
      <v-icon icon="user" class="section-icon" />
      <h2>Account Settings</h2>
      <span class="private-badge"><v-icon icon="lock" /> Private</span>
    </div>

    <div class="section-content">
      <!-- Email -->
      <div class="setting-row">
        <label>Email address:</label>
        <b-input-group>
          <b-form-input v-model="emailLocal" type="email" />
          <template #append>
            <SpinButton
              variant="primary"
              icon-name="save"
              label="Save"
              :disabled="!emailLocal"
              @handle="saveEmail"
            />
          </template>
        </b-input-group>
      </div>

      <div
        v-if="otherEmails.length"
        :key="JSON.stringify(otherEmails) + emailLocal"
        class="other-emails"
      >
        <p class="other-emails-label">
          <v-icon icon="envelope" /> Other emails
        </p>
        <EmailOwn
          v-for="email in otherEmails"
          :key="'ownemail-' + email.id"
          :email="email"
        />
      </div>

      <NoticeMessage v-if="me?.bouncing" variant="danger" class="mb-2">
        <p>Can't deliver to your email. Please update it.</p>
        <SpinButton
          variant="white"
          icon-name="check"
          label="Try again"
          size="sm"
          @handle="unbounce"
        />
      </NoticeMessage>

      <!-- Password -->
      <div class="setting-row">
        <PasswordEntry
          :original-password="me.value?.password"
          show-save-option
          placeholder="Your password"
        />
      </div>

      <!-- Postcode -->
      <div class="setting-row">
        <label>Your postcode:</label>
        <b-input-group>
          <PostCode @selected="selectPostcode" @cleared="clearPostcode" />
          <template #append>
            <SpinButton
              variant="primary"
              :disabled="!pc"
              icon-name="save"
              label="Save"
              @handle="savePostcode"
            />
          </template>
        </b-input-group>
      </div>

      <!-- Leave communities -->
      <div class="leave-section">
        <b-button variant="outline-danger" to="/unsubscribe" class="leave-btn">
          <v-icon icon="trash-alt" /> Unsubscribe or leave communities
        </b-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineEmits, watch } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useMe } from '~/composables/useMe'
import EmailOwn from '~/components/EmailOwn'
import PostCode from '~/components/PostCode'
import NoticeMessage from '~/components/NoticeMessage'
import PasswordEntry from '~/components/PasswordEntry'
import SpinButton from '~/components/SpinButton'

const emit = defineEmits(['update', 'show-email-confirm-modal'])

const authStore = useAuthStore()
const { me, myid } = useMe()

// State
const pc = ref(null)
const emailLocal = ref('')

// Computed properties
const otherEmails = computed(() => {
  return me.value?.emails
    ? me.value.emails.filter((e) => {
        return !e.ourdomain && e.email !== me.value.email
      })
    : []
})

// Methods
const selectPostcode = (postcode) => {
  pc.value = postcode
}

const clearPostcode = () => {
  pc.value = null
}

const saveEmail = async (callback) => {
  if (emailLocal.value) {
    const data = await authStore.saveEmail({
      email: emailLocal.value,
    })

    if (data && data.ret === 10) {
      emit('show-email-confirm-modal')
    }
  }
  callback()
  emit('update')
}

const unbounce = async (callback) => {
  if (emailLocal.value && me.value?.bouncing) {
    await authStore.unbounce(myid.value)
  }
  callback()
  emit('update')
}

const savePostcode = async (callback) => {
  if (pc.value?.id) {
    const settings = me.value?.settings
    if (!settings?.mylocation || settings?.mylocation.id !== pc.value.id) {
      settings.mylocation = pc.value
      await authStore.saveAndGet({
        settings,
      })
    }
  }

  callback()
  emit('update')
}

// Update local refs when me changes
watch(
  () => me.value,
  (newVal) => {
    if (newVal) {
      emailLocal.value = newVal.email || ''
    }
  },
  { immediate: true }
)
</script>

<style scoped lang="scss">
@import 'assets/css/_color-vars.scss';

.settings-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 1rem;
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);

  h2 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: $color-green-background;
    flex: 1;
  }

  .section-icon {
    color: $color-green-background;
  }
}

.private-badge {
  font-size: 0.75rem;
  color: $color-gray--dark;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.section-content {
  padding: 1rem 1.25rem;
}

.setting-row {
  margin-bottom: 1rem;

  label {
    display: block;
    font-weight: 500;
    margin-bottom: 0.25rem;
    font-size: 0.9rem;
  }
}

.other-emails {
  margin-bottom: 1rem;
  padding: 0.75rem 1rem;
  background: $color-gray--lighter;
  border-radius: 8px;
}

.other-emails-label {
  font-weight: 500;
  font-size: 0.85rem;
  color: $color-gray--dark;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.leave-section {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  text-align: center;
}

.leave-btn {
  width: 100%;
}
</style>
