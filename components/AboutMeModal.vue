<template>
  <b-modal
    ref="modal"
    scrollable
    size="lg"
    no-stacking
    hide-header
    content-class="aboutme-modal"
  >
    <template #default>
      <div class="aboutme-content">
        <div class="aboutme-header">
          <v-icon icon="user-circle" class="header-icon" />
          <h5 class="header-title">
            {{
              !props.review
                ? 'Complete your public profile'
                : 'Review your public profile'
            }}
          </h5>
          <p class="header-subtitle">
            {{
              props.review
                ? 'Check this still applies, then click Save or Cancel.'
                : 'Tell other freeglers a bit about yourself.'
            }}
          </p>
        </div>

        <div class="aboutme-body">
          <b-form-textarea
            v-model="text"
            placeholder="Tell us a bit about yourself - why you freegle, hobbies, general collection arrangements..."
            rows="6"
            class="aboutme-textarea"
          />

          <div class="info-hint">
            <v-icon icon="globe-europe" class="hint-icon" />
            <span
              >This is public - visible on your profile and posted to
              ChitChat.</span
            >
          </div>

          <div class="suggestions">
            <span class="suggestions-label">Ideas:</span>
            <span class="suggestion-item">Why you freegle</span>
            <span class="suggestion-item">Collection arrangements</span>
            <span class="suggestion-item">Hobbies &amp; interests</span>
          </div>
        </div>

        <div class="aboutme-footer">
          <b-button variant="link" class="cancel-btn" @click="hide">
            {{ props.review ? 'No changes' : 'Skip for now' }}
          </b-button>
          <b-button variant="primary" class="save-btn" @click="save">
            <v-icon icon="check" /> Save
          </b-button>
        </div>
      </div>
    </template>
    <template #footer><span /></template>
  </b-modal>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useOurModal } from '~/composables/useOurModal'

const authStore = useAuthStore()

const props = defineProps({
  review: { type: Boolean, required: false, default: false },
})

const emit = defineEmits(['dataChange'])

const { modal, hide } = useOurModal()

const text = ref(authStore.user.aboutme.text)

async function save() {
  await authStore.saveAboutMe(text.value)
  emit('dataChange')
  hide()
}
</script>

<style scoped lang="scss">
@import 'assets/css/_color-vars.scss';

.aboutme-content {
  padding: 0;
}

.aboutme-header {
  text-align: center;
  padding: 1.5rem 1rem 1rem;
  border-bottom: 1px solid $color-gray--lighter;

  .header-icon {
    font-size: 2.5rem;
    color: $colour-success;
    margin-bottom: 0.75rem;
  }

  .header-title {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0 0 0.25rem 0;
    color: $color-gray--darker;
  }

  .header-subtitle {
    font-size: 0.9rem;
    color: $color-gray--dark;
    margin: 0;
  }
}

.aboutme-body {
  padding: 1.25rem;
}

.aboutme-textarea {
  margin-bottom: 1rem;
}

.info-hint {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: $color-gray--dark;
  padding: 0.75rem;
  background: $color-gray--lighter;
  margin-bottom: 1rem;

  .hint-icon {
    color: $colour-success;
    flex-shrink: 0;
  }
}

.suggestions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;

  .suggestions-label {
    color: $color-gray--dark;
    font-weight: 500;
  }

  .suggestion-item {
    background: $color-gray--lighter;
    padding: 0.25rem 0.75rem;
    color: $color-gray--darker;
  }
}

.aboutme-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-top: 1px solid $color-gray--lighter;
  background: $color-gray--lighter;

  .cancel-btn {
    color: $color-gray--dark;
    text-decoration: none;

    &:hover {
      color: $color-gray--darker;
    }
  }

  .save-btn {
    min-width: 120px;
  }
}
</style>
