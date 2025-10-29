<template>
  <b-card
    border-variant="info"
    header-bg-variant="info"
    header-text-variant="white"
    class="mt-2"
  >
    <template #header>
      <h2 class="bg-info header--size5 mb-0">
        <v-icon icon="user" />
        Your Account Settings
      </h2>
    </template>
    <b-card-body class="p-0 pt-1">
      <p class="text-muted">
        <v-icon icon="lock" /> This is private. Other freeglers can't see this.
      </p>
      <div class="d-flex">
        <EmailValidator
          ref="email"
          v-model:email="emailLocal"
          v-model:valid="emailValid"
          size="md"
          label="Your primary email address:"
        />
        <div class="d-flex flex-column justify-content-end">
          <SpinButton
            variant="primary"
            icon-name="save"
            label="Save"
            :disabled="!emailValid"
            @handle="saveEmail"
          />
        </div>
      </div>
      <div
        v-if="otherEmails.length"
        :key="JSON.stringify(otherEmails) + emailLocal"
        class="mt-1 mb-3"
      >
        <p class="m-0">Other emails:</p>
        <EmailOwn
          v-for="email in otherEmails"
          :key="'ownemail-' + email.id"
          :email="email"
        />
      </div>
      <NoticeMessage v-if="me?.bouncing" variant="danger" class="mb-2">
        <p>
          We can't send to your email address. Please change it to a valid one
          and press <em>Save</em>.
        </p>
        <p>Or if you're sure it's valid:</p>
        <SpinButton
          variant="white"
          icon-name="check"
          label="Try again"
          @handle="unbounce"
        />
      </NoticeMessage>
      <b-row>
        <b-col cols="12" sm="6">
          <PasswordEntry
            :original-password="me.value?.password"
            show-save-option
            placeholder="Your password"
          />
        </b-col>
      </b-row>
      <b-row>
        <b-col cols="12">
          <b-form-group label="Your Postcode:">
            <div class="d-flex flex-wrap align-items-start">
              <PostCode @selected="selectPostcode" @cleared="clearPostcode" />
              <SpinButton
                variant="white"
                size="lg"
                class="mb-2"
                :disabled="!pc"
                icon-name="save"
                label="Save"
                @handle="savePostcode"
              />
            </div>
          </b-form-group>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <hr />
          <b-button variant="secondary" size="lg" to="/unsubscribe">
            <v-icon icon="trash-alt" />
            Unsubscribe or Leave Communities
          </b-button>
        </b-col>
      </b-row>
    </b-card-body>
  </b-card>
</template>

<script setup>
import { ref, computed, defineEmits, watch } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useMe } from '~/composables/useMe'
import EmailOwn from '~/components/EmailOwn'
import EmailValidator from '~/components/EmailValidator'
import PostCode from '~/components/PostCode'
import NoticeMessage from '~/components/NoticeMessage'
import PasswordEntry from '~/components/PasswordEntry'
import SpinButton from '~/components/SpinButton'

const emit = defineEmits(['update', 'show-email-confirm-modal'])

const authStore = useAuthStore()
const { me, myid } = useMe()

// State
const pc = ref(null)
const emailValid = ref(false)
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
