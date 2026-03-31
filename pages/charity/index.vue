<template>
  <client-only>
    <div class="charity-page__wrapper">
      <div class="charity-page">
        <!-- Hero -->
        <div class="hero">
          <div class="hero-badge-wrapper">
            <div class="hero-icon">
              <svg
                viewBox="0 0 24 24"
                width="40"
                height="40"
                aria-hidden="true"
              >
                <path
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  fill="white"
                />
                <path
                  d="M9 12l2 2 4.5-4.5"
                  fill="none"
                  stroke="#1e40af"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
          </div>
          <h1 class="hero-title">Partner with Freegle</h1>
          <p class="hero-subtitle">
            Your local Freegle community is a great place to ask for items,
            promote your campaigns, find new volunteers and advertise events.
          </p>
          <p class="hero-cta-text">
            Sign up as a <strong>Charity Partner</strong> and stand out to
            thousands of local freeglers.
          </p>
          <a href="#signup" class="hero-cta-btn">
            <v-icon icon="arrow-down" class="me-2" />
            Register your organisation
          </a>
        </div>

        <!-- Benefits -->
        <div class="benefits">
          <h2 class="section-title">Why become a Charity Partner?</h2>
          <div class="benefits-grid">
            <div class="benefit-card">
              <div class="benefit-icon-circle benefit-icon-circle--blue">
                <v-icon icon="heart" />
              </div>
              <h3>Stand out in the community</h3>
              <p>
                Your posts are highlighted with a distinctive
                <CharityBadge /> badge and blue border, so freeglers immediately
                know you're a trusted local organisation.
              </p>
            </div>
            <div class="benefit-card">
              <div class="benefit-icon-circle benefit-icon-circle--green">
                <v-icon icon="gift" />
              </div>
              <h3>Get what your people need</h3>
              <p>
                Post WANTEDs for items your service users need. Local freeglers
                are generous people who want to help their community.
              </p>
            </div>
            <div class="benefit-card">
              <div class="benefit-icon-circle benefit-icon-circle--orange">
                <v-icon icon="hands-helping" />
              </div>
              <h3>Grow your network</h3>
              <p>
                Find new volunteers, promote campaigns and events, and connect
                with community-minded people who care about your cause.
              </p>
            </div>
          </div>
        </div>

        <!-- Post preview in phone frame -->
        <div class="preview-section">
          <h2 class="section-title">What your posts will look like</h2>
          <p class="section-subtitle">
            Charity Partner posts stand out in the feed with a blue border and
            badge.
          </p>
          <div class="phone-frame">
            <div class="phone-notch" />
            <div class="phone-screen">
              <div class="phone-browse-grid">
                <!-- Normal post -->
                <div class="browse-card">
                  <img
                    src="https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=300&h=400&fit=crop"
                    alt="Children's bike"
                    class="browse-card-img"
                  />
                  <span class="browse-tag browse-tag--offer">OFFER</span>
                  <div class="browse-title-overlay">
                    Children's bike - good condition
                  </div>
                </div>
                <!-- Charity Partner post -->
                <div class="browse-card browse-card--charity">
                  <img
                    src="https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=300&h=400&fit=crop"
                    alt="Winter coats"
                    class="browse-card-img"
                  />
                  <span class="browse-tag browse-tag--wanted">WANTED</span>
                  <div class="browse-title-overlay">
                    Winter coats - all sizes needed
                  </div>
                  <div class="browse-charity-strip">
                    <CharityBadge />
                  </div>
                </div>
                <!-- Normal post -->
                <div class="browse-card">
                  <img
                    src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&h=400&fit=crop"
                    alt="Sofa"
                    class="browse-card-img"
                  />
                  <span class="browse-tag browse-tag--offer">OFFER</span>
                  <div class="browse-title-overlay">
                    3 seater sofa - collection only
                  </div>
                </div>
                <!-- Charity Partner post -->
                <div class="browse-card browse-card--charity">
                  <img
                    src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=300&h=400&fit=crop"
                    alt="Clothes"
                    class="browse-card-img"
                  />
                  <span class="browse-tag browse-tag--wanted">WANTED</span>
                  <div class="browse-title-overlay">
                    Children's clothes ages 5-8
                  </div>
                  <div class="browse-charity-strip">
                    <CharityBadge />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Signup form -->
        <div id="signup" class="signup-section">
          <h2 class="section-title">Register as a Charity Partner</h2>
          <p class="section-subtitle">
            Tell us about your organisation. We'll verify your details and set
            up your Charity Partner account.
          </p>

          <div class="signup-form">
            <div class="form-group">
              <label class="form-label" for="org-name">
                Organisation name
              </label>
              <b-form-input
                id="org-name"
                v-model="form.orgName"
                placeholder="e.g. Wandsworth Community Aid"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Type of organisation</label>
              <b-form-radio-group v-model="form.orgType" stacked>
                <b-form-radio value="registered">
                  Registered charity
                </b-form-radio>
                <b-form-radio value="other">
                  Other community organisation (CIC, trust, etc.)
                </b-form-radio>
              </b-form-radio-group>
            </div>

            <div v-if="form.orgType === 'registered'" class="form-group">
              <label class="form-label" for="charity-number">
                Charity registration number
              </label>
              <b-form-input
                id="charity-number"
                v-model="form.charityNumber"
                placeholder="e.g. 1234567"
              />
            </div>

            <div v-if="form.orgType === 'other'" class="form-group">
              <label class="form-label" for="org-details">
                Tell us about your organisation's status
              </label>
              <b-form-textarea
                id="org-details"
                v-model="form.orgDetails"
                placeholder="e.g. We are a Community Interest Company registered in..."
                rows="2"
              />
            </div>

            <div class="form-group">
              <label class="form-label" for="website"> Website </label>
              <b-form-input
                id="website"
                v-model="form.website"
                placeholder="e.g. https://www.example.org"
              />
            </div>

            <div class="form-group">
              <label class="form-label" for="social"> Social media </label>
              <b-form-input
                id="social"
                v-model="form.social"
                placeholder="e.g. @yourorg on Facebook, Twitter, Instagram"
              />
            </div>

            <div class="form-group">
              <label class="form-label"> Organisation logo </label>
              <div class="logo-upload">
                <v-icon icon="camera" class="logo-upload-icon" />
                <span>Upload your logo (optional)</span>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="description">
                About your organisation
              </label>
              <p class="form-hint">
                Other users are more likely to donate items if they know about
                your work. Tell freeglers what your organisation does, where
                you're based, and which communities you serve.
              </p>
              <b-form-textarea
                id="description"
                v-model="form.description"
                placeholder="e.g. We provide warm clothing and household essentials to families in need across Wandsworth..."
                rows="4"
              />
            </div>

            <div class="form-actions">
              <b-button variant="primary" size="lg" disabled class="submit-btn">
                <v-icon icon="clock" class="me-1" />
                Coming soon
              </b-button>
              <p class="coming-soon-text">
                Charity Partner registration will be available soon. In the
                meantime, please
                <a href="mailto:partnerships@ilovefreegle.org"
                  >contact our partnerships team</a
                >.
              </p>
            </div>
          </div>
        </div>

        <!-- Individual signup link -->
        <div class="individual-link">
          <p>
            Not a charity?
            <nuxt-link no-prefetch to="/explore">
              Sign up as an individual
            </nuxt-link>
          </p>
        </div>
      </div>
    </div>
  </client-only>
</template>

<script setup>
import { reactive } from 'vue'
import { useRoute } from 'vue-router'
import { buildHead } from '~/composables/useBuildHead'
import CharityBadge from '~/components/CharityBadge.vue'

const runtimeConfig = useRuntimeConfig()
const route = useRoute()

useHead(
  buildHead(
    route,
    runtimeConfig,
    'Charity Partner',
    'Register your charitable organisation with Freegle as a Charity Partner.'
  )
)

const form = reactive({
  orgName: '',
  orgType: null,
  charityNumber: '',
  orgDetails: '',
  website: '',
  social: '',
  description: '',
})
</script>

<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';
@import 'assets/css/_color-vars.scss';

$charity-blue: #2563eb;
$charity-blue-light: #eff6ff;

.charity-page__wrapper {
  display: flex;
  justify-content: center;
  background: $gray-100;
  min-height: 100vh;
}

.charity-page {
  width: 100%;
  max-width: 800px;
  padding: 1rem;

  @include media-breakpoint-up(md) {
    padding: 1.5rem;
  }
}

/* Hero */
.hero {
  text-align: center;
  padding: 2.5rem 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  margin-bottom: 1.5rem;
  border-top: 4px solid $charity-blue;

  @include media-breakpoint-up(md) {
    padding: 3rem 2rem;
  }
}

.hero-badge-wrapper {
  margin-bottom: 1rem;
}

.hero-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: $charity-blue;
}

.hero-title {
  font-size: 2rem;
  font-weight: 700;
  color: $color-gray--darker;
  margin: 0 0 0.75rem;

  @include media-breakpoint-up(md) {
    font-size: 2.25rem;
  }
}

.hero-subtitle {
  font-size: 1.05rem;
  line-height: 1.6;
  max-width: 550px;
  margin: 0 auto 0.5rem;
  color: var(--color-gray-600);
}

.hero-cta-text {
  font-size: 1.05rem;
  margin: 0 auto 1.25rem;
  max-width: 550px;
  color: $color-gray--darker;
}

.hero-cta-btn {
  display: inline-flex;
  align-items: center;
  padding: 0.75rem 1.75rem;
  background: $charity-blue;
  color: white;
  font-weight: 600;
  font-size: 1rem;
  border-radius: 8px;
  text-decoration: none;
  transition: transform 0.15s, box-shadow 0.15s;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
    color: white;
    text-decoration: none;
  }
}

/* Benefits */
.benefits {
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: $color-gray--darker;
  margin-bottom: 0.5rem;
}

.section-subtitle {
  font-size: 0.9rem;
  color: var(--color-gray-600);
  margin-bottom: 1rem;
}

.benefits-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;

  @include media-breakpoint-up(md) {
    grid-template-columns: 1fr 1fr 1fr;
  }
}

.benefit-card {
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  text-align: center;
  transition: transform 0.15s, box-shadow 0.15s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }

  h3 {
    font-size: 1rem;
    font-weight: 700;
    color: $color-gray--darker;
    margin: 1rem 0 0.5rem;
  }

  p {
    font-size: 0.875rem;
    color: var(--color-gray-600);
    line-height: 1.6;
    margin: 0;
  }
}

.benefit-icon-circle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  font-size: 1.5rem;

  &--blue {
    background: #eff6ff;
    color: $charity-blue;
  }

  &--green {
    background: #f0fdf4;
    color: $color-success;
  }

  &--orange {
    background: #fff7ed;
    color: $color-orange--dark;
  }
}

/* Post preview in phone frame */
.preview-section {
  margin-bottom: 1.5rem;
  text-align: center;
}

.phone-frame {
  display: inline-block;
  background: #1a1a1a;
  border-radius: 32px;
  padding: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  max-width: 320px;
  width: 100%;
  margin: 0 auto;
}

.phone-notch {
  width: 100px;
  height: 6px;
  background: #333;
  border-radius: 3px;
  margin: 4px auto 10px;
}

.phone-screen {
  background: $gray-100;
  border-radius: 20px;
  overflow: hidden;
  padding: 6px;
}

.phone-browse-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
}

.browse-card {
  position: relative;
  border-radius: 0.375rem;
  overflow: hidden;
  background: $gray-200;
  aspect-ratio: 3 / 4;

  &--charity {
    border: 2px solid $charity-blue;
  }
}

.browse-card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.browse-tag {
  position: absolute;
  top: 6px;
  left: 6px;
  font-size: 0.6rem;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 3px;
  color: white;
  text-transform: uppercase;
  z-index: 2;

  &--offer {
    background: $color-success-fg;
  }

  &--wanted {
    background: $color-blue--light;
  }
}

.browse-title-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1.5rem 6px 6px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  color: white;
  font-size: 0.65rem;
  font-weight: 600;
  line-height: 1.3;
  z-index: 1;

  .browse-card--charity & {
    bottom: 22px;
  }
}

.browse-charity-strip {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 3px 6px;
  background: $charity-blue-light;
  z-index: 2;
  display: flex;
  align-items: center;

  :deep(.charity-partner) {
    font-size: 0.5rem !important;
    padding: 1px 4px !important;
  }

  :deep(.charity-icon) {
    width: 10px !important;
    height: 10px !important;
  }
}

/* Signup form */
.signup-section {
  background: white;
  border-radius: 8px;
  box-shadow: var(--shadow-sm);
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.signup-form {
  margin-top: 1rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-label {
  font-weight: 600;
  font-size: 0.9rem;
  color: $color-gray--darker;
  margin-bottom: 0.375rem;
  display: block;
}

.form-hint {
  font-size: 0.8rem;
  color: var(--color-gray-600);
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.logo-upload {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem;
  border: 2px dashed $gray-300;
  border-radius: 8px;
  color: var(--color-gray-600);
  font-size: 0.9rem;
  cursor: not-allowed;
  opacity: 0.7;

  .logo-upload-icon {
    font-size: 1.5rem;
    color: $gray-400;
  }
}

.form-actions {
  text-align: center;
  padding-top: 0.5rem;
}

.submit-btn {
  min-width: 200px;
}

.coming-soon-text {
  font-size: 0.85rem;
  color: var(--color-gray-600);
  margin-top: 0.75rem;

  a {
    color: $charity-blue;
  }
}

/* Individual link */
.individual-link {
  text-align: center;
  padding: 1rem;

  p {
    font-size: 0.9rem;
    color: var(--color-gray-600);
    margin: 0;

    a {
      color: $charity-blue;
    }
  }
}
</style>
