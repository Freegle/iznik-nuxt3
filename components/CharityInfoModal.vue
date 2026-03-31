<template>
  <b-modal ref="modal" scrollable hide-header content-class="charity-modal">
    <template #default>
      <div class="charity-content">
        <div class="charity-header">
          <svg
            class="header-icon"
            viewBox="0 0 24 24"
            width="48"
            height="48"
            aria-hidden="true"
          >
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              fill="#2563eb"
            />
            <path
              d="M9 12l2 2 4.5-4.5"
              fill="none"
              stroke="white"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <h5 class="header-title">Charity Partner</h5>
          <p class="header-subtitle">
            Local organisations working with Freegle
          </p>
        </div>

        <div class="charity-body">
          <p class="intro-text">
            This user has registered with Freegle as a charitable organisation
            that does charitable work locally. Charity Partners are local
            charities, community support organisations, CICs, and trusts who use
            Freegle to help the people and communities they serve.
          </p>

          <div class="benefits-list">
            <div class="benefit-item">
              <v-icon icon="gift" class="benefit-icon" />
              <span
                >They can post WANTEDs for items their service users need</span
              >
            </div>
            <div class="benefit-item">
              <v-icon icon="bullhorn" class="benefit-icon" />
              <span>They can promote campaigns and events locally</span>
            </div>
            <div class="benefit-item">
              <v-icon icon="hands-helping" class="benefit-icon" />
              <span>They can find new volunteers in the community</span>
            </div>
          </div>

          <div class="info-box">
            <v-icon icon="info-circle" class="info-icon" />
            <span>
              You can find out more about this organisation by viewing their
              profile.
            </span>
          </div>
        </div>

        <div class="charity-footer">
          <b-button variant="link" class="close-btn" @click="hide">
            Close
          </b-button>
        </div>
      </div>
    </template>
    <template #footer><span /></template>
  </b-modal>
</template>

<script setup>
import { useOurModal } from '~/composables/useOurModal'

const { modal, hide } = useOurModal()
</script>

<style scoped lang="scss">
@import 'assets/css/_color-vars.scss';

.charity-content {
  padding: 0;
}

.charity-header {
  text-align: center;
  padding: 1.5rem 1rem 1rem;
  border-bottom: 1px solid $color-gray--lighter;

  .header-icon {
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
    color: var(--color-gray-600);
    margin: 0;
  }
}

.charity-body {
  padding: 1.25rem;
}

.intro-text {
  color: var(--color-gray-600);
  margin-bottom: 1.25rem;
  font-size: 0.9rem;
  line-height: 1.6;
}

.benefits-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
  color: $color-gray--darker;

  .benefit-icon {
    color: #2563eb;
    flex-shrink: 0;
    width: 1.25rem;
  }
}

.info-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #eff6ff;
  font-size: 0.85rem;
  color: $color-gray--darker;
  border-radius: 4px;

  .info-icon {
    color: #2563eb;
    flex-shrink: 0;
  }
}

.charity-footer {
  display: flex;
  justify-content: center;
  padding: 1rem;
  border-top: 1px solid $color-gray--lighter;

  .close-btn {
    color: var(--color-gray-600);
  }
}
</style>
